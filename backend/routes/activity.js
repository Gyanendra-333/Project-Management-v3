import express from 'express';
const router = express.Router();
import {  getActivities  } from '../controllers/activityController.js';
import {  protect, adminOnly  } from '../middleware/auth.js';

router.get('/', protect, adminOnly, getActivities);

export default router;
