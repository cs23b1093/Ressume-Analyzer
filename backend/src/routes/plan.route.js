import express from 'express';
import { getPlan, createPlan, updatePlan } from '../controllers/plan.controller.js';
import { getUser } from '../middleware/user.middleware.js';

const planRouter = express.Router();

planRouter.use(getUser);

planRouter.route('/').get(getPlan);
planRouter.route('/').post(createPlan);
planRouter.route('/update').put(updatePlan);

export default planRouter