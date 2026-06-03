const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.post('/add', async (req, res) => {
    console.log('Received request to add user:', req.body);
  try {
    const { name, email, password, universityId, role } = req.body;
    const newUser = new User({ name, email, password, universityId, role });
    await newUser.save();
    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding user' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find(); // ✅ assign result
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading users' });
  }
});




const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  addBadge
} = require('../controllers/userController');

router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

router.patch('/:id/badge', addBadge);


module.exports = router;
