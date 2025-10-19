import express from "express";
import { parseResumeText } from "../controllers/resumeParser.controller.js";

const resumeParserRouter = express.Router();

resumeParserRouter.route('/parse').post(parseResumeText);

export default resumeParserRouter;
