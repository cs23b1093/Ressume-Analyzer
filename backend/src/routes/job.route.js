import express from 'express';
import { getUser } from '../middleware/user.middleware.js';
import { createJob, getJobs, getJobById, updateJob, deleteJob } from '../controllers/jobs.controller';

const jobRouter = express.Router();

jobRouter.use(getUser);

jobRouter.route('/').post(createJob);
jobRouter.route('/').get(getJobs);
jobRouter.route('/:id').get(getJobById);
jobRouter.route('/:id').put(updateJob);
jobRouter.route('/:id').delete(deleteJob);

export default jobRouter