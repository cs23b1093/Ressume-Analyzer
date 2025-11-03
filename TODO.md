# TODO: Store Resume Data in Redis and Use in ATS Calculation

## Tasks to Complete

- [ ] Edit `backend/src/controllers/resumeParser.controller.js`:
  - Import `crypto` for UUID generation.
  - After parsing `parsedData`, generate a unique UUID.
  - Store `parsedData` in Redis with key `resume:${uuid}` using `req.redisClient.set()`.
  - Modify response to include `resume_id` (the UUID) instead of directly returning `parsedData`.

- [ ] Edit `backend/src/controllers/ats.controller.js`:
  - Change the request body validation to accept `resume_id` instead of `resumeData`.
  - Fetch the resume data from Redis using `req.redisClient.get(\`resume:${resume_id}\`)`.
  - Parse the JSON data and use it as `resumeData` for the ATS calculation.
  - Add error handling if the resume_id is not found in Redis (throw ApiError).

- [ ] Test the endpoints:
  - Parse a resume using the resume-parser endpoint to get `resume_id`.
  - Use the `resume_id` in the ATS calculation endpoint to ensure data is fetched correctly.
