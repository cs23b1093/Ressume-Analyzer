import express from 'express';
import { calculateATSScore } from '../controllers/ats.controller.js';

const atsRouter = express.Router();

// Public route - no authentication required
atsRouter.route('/calculate').post(calculateATSScore);

export default atsRouter;
