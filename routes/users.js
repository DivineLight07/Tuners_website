const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, createUser, updateUser, deleteUser, addBadge } = require('../controllers/userController');

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

// ✅ Matches: apiFetch('/api/v1/users')
router.get('/', getAllUsers);

// ✅ Matches: apiFetch('/api/v1/users/add', { method: 'POST' })
router.post('/add', createUser);

// ✅ Matches: apiFetch(`/api/v1/users/${user._id}`, { method: 'PATCH' })
router.patch('/:id', updateUser);

// ✅ Matches: apiFetch(`/api/v1/users/${userId}`, { method: 'DELETE' })
router.delete('/:id', deleteUser);

router.patch('/:id/badge', addBadge);

module.exports = router;