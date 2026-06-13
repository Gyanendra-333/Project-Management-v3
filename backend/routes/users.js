import express from 'express';
const router = express.Router();
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  getUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

router.use(protect);

router.get('/', adminOnly, getAllUsers);
router.post('/', adminOnly, createUser);
router.put('/profile', updateProfile);
router.get('/:id', getUser);
router.put('/:id', adminOnly, updateUser);
router.delete('/:id', adminOnly, deleteUser);

export default router;
