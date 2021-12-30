var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const {User, Course} = require('./models');
const { authenticateUser } = require('./middleware/auth-user');

// Handler function to wrap each route.
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error) {
      next(error);
    }
  }
}

// Route that returns full details of authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  res.status(200).json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
}));
  
// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
  try {
    await User.create(req.body);
    res.status(201).location('/').end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

// Route that returns all courses.
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: User,
        attributes: ['firstName', 'lastName'],
      }
    ]
  });
  res.status(200).json({courses});
}));

// Route that returns a corresponding course
router.get("/courses/:id", asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: User,
        attributes: ['firstName', 'lastName'],
      }
    ]
  });
  if (course) {
    res.status(200).json({course});
  } else {
    const err = createError(404, "Sorry! We couldn't find the course you are looking for.");
    next(err);
  } 
}));

// Route that creates a new course.
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).location(`/api/courses/${course.id}`).end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

// Route that updates a course.
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  try {
    const user = req.currentUser;
    const course = await Course.findByPk(req.params.id);
    if (course && course.userId === user.id) {
      await course.update(req.body);
      res.status(204).end();
    } else {
      const err = createError(403, "Sorry! Only course owner can edit this course.");
      next(err);
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

// Route that deletes a course.
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);
    if (course && course.userId === user.id) {
      await course.destroy();
      res.status(204).end();
    } else {
      const err = createError(403, "Sorry! Only course owner can delete this course.");
      next(err);
    }
}));

module.exports = router;