import express from 'express';
import { getUser } from '../middleware/user.middleware.js';
import { createJob, getJobs, getJobById, updateJob, deleteJob } from '../controllers/jobs.controller.js';

const jobRouter = express.Router();

// Public routes (no authentication required)
jobRouter.route('/').get(getJobs);
jobRouter.route('/:id').get(getJobById);

// Protected routes (authentication required)
jobRouter.route('/').post(getUser, createJob);
jobRouter.route('/:id').put(getUser, updateJob);
jobRouter.route('/:id').delete(getUser, deleteJob);

export default jobRouter;