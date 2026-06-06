const Course = require('../models/Course');

// GET all published courses (public)
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .sort({ category: 1, order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    next(err);
  }
};

// GET all courses (admin only)
exports.getAllCoursesAdmin = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ category: 1, order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    next(err);
  }
};

// POST create new course (admin only)
exports.createCourse = async (req, res, next) => {
  try {
    const { title, instructor, youtubeVideoId, description, category, duration, order } = req.body;

    // Extract video ID from full YouTube URL if provided
    let videoId = youtubeVideoId;
    if (youtubeVideoId.includes('youtube.com') || youtubeVideoId.includes('youtu.be')) {
      videoId = extractVideoId(youtubeVideoId);
    }

    const course = await Course.create({
      title,
      instructor,
      youtubeVideoId: videoId,
      description: description || '',
      category: category || 'Other',
      duration: duration || '',
      order: order || 0,
      isPublished: true
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(err);
  }
};

// PUT update course (admin only)
exports.updateCourse = async (req, res, next) => {
  try {
    const { title, instructor, youtubeVideoId, description, category, duration, order, isPublished } = req.body;

    const updateData = { title, instructor, description, category, duration, order, isPublished };

    if (youtubeVideoId) {
      let videoId = youtubeVideoId;
      if (youtubeVideoId.includes('youtube.com') || youtubeVideoId.includes('youtu.be')) {
        videoId = extractVideoId(youtubeVideoId);
      }
      updateData.youtubeVideoId = videoId;
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(err);
  }
};

// DELETE course (admin only)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Helper: Extract YouTube video ID from URL
function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}