const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('./subject.controller');
const { protect, restrictTo } = require('../../middleware/auth');

router.use(protect);

router.get('/', getSubjects);
router.post('/', restrictTo('ADMIN', 'SUPER_ADMIN'), createSubject);
router.put('/:id', restrictTo('ADMIN', 'SUPER_ADMIN'), updateSubject);
router.delete('/:id', restrictTo('ADMIN', 'SUPER_ADMIN'), deleteSubject);

module.exports = router;
