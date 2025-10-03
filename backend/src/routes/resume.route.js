import express from "express";
import getUser from "../middleware/user.middleware.js";
import { createResume, getResume } from "../controllers/ressume.controller.js";

const resumeRouter = express();

resumeRouter.use(getUser);

resumeRouter.route('/').post(createResume)
resumeRouter.route('/').get(getResume);

export default resumeRouter;