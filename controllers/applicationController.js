const Application = require('../models/Application');
const ErrorResponse = require('../utils/errorResponse');
const emailValidator = require('deep-email-validator');

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

    // VALIDATE EMAIL IS MIU ACCOUNT
    const miuEmailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)*miuegypt\.edu\.eg$/i;
    if (!miuEmailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'You must use a valid MIU email address (e.g., your.name@miuegypt.edu.eg or @eng.miuegypt.edu.eg).'
      });
    }

    // CHECK FOR DUPLICATES ON MULTIPLE FIELDS
    // Check if ANY existing application matches email, studentId, phone, OR name
    const existingApplication = await Application.findOne({
      $or: [
        { email: email },
        { studentId: studentId },
        { phone: phone },
        { name: name }
      ]
    });

    if (existingApplication) {
      // Determine which field caused the duplicate
      let duplicateField = '';
      let duplicateValue = '';
      
      if (existingApplication.email === email) {
        duplicateField = 'Email';
        duplicateValue = email;
      } else if (existingApplication.studentId === studentId) {
        duplicateField = 'Student ID';
        duplicateValue = studentId;
      } else if (existingApplication.phone === phone) {
        duplicateField = 'Phone number';
        duplicateValue = phone;
      } else if (existingApplication.name === name) {
        duplicateField = 'Full name';
        duplicateValue = name;
      }
      
      return res.status(409).json({
        success: false,
        error: `You have already submitted an application with this ${duplicateField}: "${duplicateValue}". Duplicate applications are not allowed.`
      });
    }

    // No duplicate found — create new application
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
    // Duplicate key — MongoDB unique index (backup safety)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'You have already submitted an application. Duplicate applications are not allowed.'
      });
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

// @desc    Get all applications (admin only — used by Nour)
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

// @desc    Update application status (admin only — used by Nour)
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

// @desc    Delete an application (admin only — used by Nour)
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