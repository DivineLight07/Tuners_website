const Application = require('../models/Application');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Submit the membership application for the logged-in account
// @route   POST /api/v1/applications
// @access  Private (member, just signed up)
exports.submitApplication = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(new ErrorResponse('Admin accounts don\'t submit applications', 400));
    }

    const existing = await Application.findOne({ user: req.user.id });
    if (existing) {
      return res.status(409).json({ success: false, error: 'You have already submitted an application.' });
    }

    const {
      studentId, year, committee, major, instrument, hear, reason, phone
    } = req.body;

    // Another account may have already used this student ID or phone number.
    const duplicate = await Application.findOne({ $or: [{ studentId }, { phone }] });
    if (duplicate) {
      const field = duplicate.studentId === studentId ? 'Student ID' : 'Phone number';
      return res.status(409).json({ success: false, error: `That ${field} is already linked to another application.` });
    }

    const application = await Application.create({
      user: req.user.id,
      name: req.user.name,
      email: req.user.email,
      studentId, year, committee, major, instrument, hear, reason, phone
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. The admin will review it soon.',
      data: application
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'You have already submitted an application.' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ success: false, errors: messages });
    }
    next(err);
  }
};

// @desc    Get the logged-in account's own application (or null if none yet)
// @route   GET /api/v1/applications/me
// @access  Private
exports.getMyApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({ user: req.user.id });
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

// @desc    Dismiss the accept popup once the applicant has seen it
// @route   PATCH /api/v1/applications/me/acknowledge
// @access  Private
exports.acknowledgeMyApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndUpdate(
      { user: req.user.id, status: 'approved' },
      { acknowledged: true },
      { new: true }
    );
    if (!application) {
      return next(new ErrorResponse('No approved application to acknowledge', 404));
    }
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

// @desc    Get applications (admin only) — filter with ?status=pending
// @route   GET /api/v1/applications
// @access  Admin
exports.getAllApplications = async (req, res, next) => {
  try {
    const filter = {};
    if (['pending', 'approved', 'rejected'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const applications = await Application.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept or reject an application (admin only)
// @route   PATCH /api/v1/applications/:id
// @access  Admin
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Status must be approved or rejected', 400));
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return next(new ErrorResponse(`Application not found with id ${req.params.id}`, 404));
    }

    application.status = status;
    application.acknowledged = false;
    await application.save();

    // Reflect the decision on the account itself: this is what unlocks
    // course access, and what the dashboard checks to show the popup.
    const update = { status };
    if (status === 'approved') {
      const user = await User.findById(application.user).select('universityId');
      if (user && !user.universityId) update.universityId = application.studentId;
    }
    await User.findByIdAndUpdate(application.user, update);

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};
