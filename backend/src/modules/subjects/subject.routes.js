const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('./subject.controller');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', getSubjects);
router.post('/', authorizeRoles('ADMIN', 'SUPER_ADMIN'), createSubject);
router.put('/:id', authorizeRoles('ADMIN', 'SUPER_ADMIN'), updateSubject);
router.delete('/:id', authorizeRoles('ADMIN', 'SUPER_ADMIN'), deleteSubject);

module.exports = router;
