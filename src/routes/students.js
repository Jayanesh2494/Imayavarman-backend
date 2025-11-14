const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { createStudentValidation } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getStudents)
  .post(authorize('admin'), createStudentValidation, createStudent);

router.get('/search', searchStudents);

router
  .route('/:id')
  .get(getStudent)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

module.exports = router;
