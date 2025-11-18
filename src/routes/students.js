const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/search', studentController.searchStudents);

router.route('/')
  .get(studentController.getAllStudents)
  .post(authorize('admin'), studentController.createStudent);

router.route('/:id')
  .get(studentController.getStudent)
  .put(authorize('admin'), studentController.updateStudent)
  .delete(authorize('admin'), studentController.deleteStudent);

module.exports = router;
