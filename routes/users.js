const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, createUser, updateUser, deleteUser, addBadge } = require('../controllers/userController');

// Protect all routes
router.use(protect);

// ✅ Matches: apiFetch('/api/v1/users')
router.get('/', authorize('admin'), getAllUsers);

// ✅ Matches: apiFetch('/api/v1/users/add', { method: 'POST' })
router.post('/add', authorize('admin'), createUser);

// ✅ Matches: apiFetch(`/api/v1/users/${user._id}`, { method: 'PATCH' })
// Allowed for all protected users, controller handles ensuring they only update themselves
router.patch('/:id', updateUser);

// ✅ Matches: apiFetch(`/api/v1/users/${userId}`, { method: 'DELETE' })
router.delete('/:id', authorize('admin'), deleteUser);

router.patch('/:id/badge', authorize('admin'), addBadge);

module.exports = router;