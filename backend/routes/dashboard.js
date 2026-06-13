import express from 'express';
const router = express.Router();
import {  getDashboard  } from '../controllers/dashboardController.js';
import {  protect, adminOnly  } from '../middleware/auth.js';

router.get('/', protect, adminOnly, getDashboard);

export default router;
