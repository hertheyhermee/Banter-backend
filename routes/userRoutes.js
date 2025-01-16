import express from 'express';
import { getAllUsers, findUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

// Get all users - Admin only
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Find a single user - Admin can access any user, regular users can only access their own profile
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is trying to access their own profile or if they're an admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own profile.' });
    }
    const user = await findUser(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Update a user - Admin can update any user, regular users can only update their own profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is trying to update their own profile or if they're an admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
    }
    
    // Prevent regular users from escalating their role
    if (req.user.role !== 'admin' && req.body.role) {
      delete req.body.role; // Remove role from update data if user is not admin
    }
    
    const updatedUser = await updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a user - Admin can delete any user, regular users can only delete their own profile
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is trying to delete their own profile or if they're an admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own profile.' });
    }
    await deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default router;