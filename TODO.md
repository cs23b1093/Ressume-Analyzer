# TODO: Move Resume Parsing to Backend Only

## Backend Changes
- [x] Install multer for file upload handling in backend
- [x] Modify `backend/src/controllers/resumeParser.controller.js` to accept file upload, extract text from PDF, then parse it
- [x] Update `backend/src/routes/resumeParser.route.js` to handle multipart/form-data for file upload

## Frontend Changes
- [x] Update `frontend/resume-analyzer/src/pages/dashboard.jsx` to send file directly to backend instead of extracting text
- [x] Remove `frontend/resume-analyzer/src/utils/resumeParser.js`
- [x] Remove `frontend/resume-analyzer/src/utils/pdfjs-dist.js` (check if used elsewhere)

## Testing
- [x] Test file upload and parsing functionality
- [x] Ensure ParsedResume component works with backend response
