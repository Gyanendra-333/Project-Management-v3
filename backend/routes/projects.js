import express from 'express';
const router = express.Router();
import { 
  getProjects,
  getProject,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
 } from '../controllers/projectController.js';
import {  protect, adminOnly  } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', adminOnly, upload.array('attachments', 3), createProject);
router.put('/:id', adminOnly, upload.array('attachments', 3), updateProject);
router.patch('/:id/status', updateProjectStatus);
router.delete('/:id', adminOnly, deleteProject);

export default router;
