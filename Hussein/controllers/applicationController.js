const Application = require('../models/Application');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Submit a new membership application
// @route   POST /api/v1/applications
// @access  Public
exports.submitApplication = async (req, res, next) => {
  try {
    const {
      name,
      email,
      studentId,
      year,
      committee,
      major,
      instrument,
      hear,
      reason,
      phone
    } = req.body;

    const application = await Application.create({
      name,
      email,
      studentId,
      year,
      committee,
      major,
      instrument,
      hear,
      reason,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. The admin will review it soon.',
      data: application
    });

  } catch (err) {
    // Duplicate key — same email + studentId already applied
    if (err.code === 11000) {
      return next(new ErrorResponse('You have already submitted an application.', 409));
    }

    // Mongoose validation errors — return all field messages as an array
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({ success: false, errors: messages });
    }

    next(err);
  }
};

// @desc    Get all applications  (admin only — used by Nour)
// @route   GET /api/v1/applications
// @access  Admin
exports.getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.find().sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status  (admin only — used by Nour)
// @route   PATCH /api/v1/applications/:id
// @access  Admin
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Status must be pending, accepted, or rejected', 400));
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return next(new ErrorResponse(`Application not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an application  (admin only — used by Nour)
// @route   DELETE /api/v1/applications/:id
// @access  Admin
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return next(new ErrorResponse(`Application not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
