import express from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/resourceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All resource routes require authentication
router.use(protect);

router.route('/').get(getResources).post(createResource);
router
  .route('/:id')
  .get(getResourceById)
  .put(updateResource)
  .delete(deleteResource);

export default router;
