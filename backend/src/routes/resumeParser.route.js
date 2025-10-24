import express from "express";
import { parseResumeText } from "../controllers/resumeParser.controller.js";
import multer from "multer";

const resumeParserRouter = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

resumeParserRouter.route('/parse').post(upload.single('resume'), parseResumeText);

export default resumeParserRouter;
