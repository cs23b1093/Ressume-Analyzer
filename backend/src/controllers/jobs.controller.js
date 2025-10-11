import { asyncHandler } from "../middleware/errorHandler.js";
import logger from "../utils/logger.js";
import { ApiError } from "../utils/errorFormat.js";
import { Job } from "../models/jobs.model.js";
import { validateJobData } from "../utils/validateJobData.js";

const createJob = asyncHandler(async (req, res, next) => {
    logger.info('hit create job...');

    const { error } = validateJobData(req.body);
    if (error) {
        throw new ApiError({ message: error.details[0].message, status: 400 });
    }

    const { title, company_name, location } = req.body;

    const isJobExists = await Job.findOne({ title, company_name, location });
    if (isJobExists) {
        throw new ApiError({ message: 'Job with the same title, company, and location already exists', status: 409 });
    }

    // Invalidate cache
    await req.redisClient.del('jobs:all');
    logger.warn('All jobs cache invalidated due to new job creation.');

    const newJob = new Job({
        ...req.body,
        job_adder: req.user.user_id
    });

    await newJob.save();
    logger.info('job created successfully');
    res.status(201).json({
        message: 'Job created successfully',
        job: newJob,
        success: true,
        statusCode: 201
    });
});

const getJobs = asyncHandler(async (req, res, next) => {
    logger.info('hit get jobs...');

    const jobsCacheKey = 'jobs:all';
    const cachedJobs = await req.redisClient.get(jobsCacheKey);

    if (cachedJobs) {
        logger.warn('jobs found in cache');
        return res.status(200).json({
            message: 'Jobs fetched successfully (from cache)',
            jobs: JSON.parse(cachedJobs),
            success: true,
            statusCode: 200
        });
    }

    const jobs = await Job.find({}).populate('job_adder', 'username fullName');

    logger.info('jobs found in db, caching...');
    await req.redisClient.set(jobsCacheKey, JSON.stringify(jobs), 'EX', 3600); // Cache for 1 hour

    res.status(200).json({
        message: 'Jobs fetched successfully',
        jobs,
        success: true,
        statusCode: 200
    });
});

const getJobById = asyncHandler(async (req, res, next) => {
    logger.info('hit get job by id...');
    const { id } = req.params;

    const jobCacheKey = `job:${id}`;
    const cachedJob = await req.redisClient.get(jobCacheKey);

    if (cachedJob) {
        logger.warn(`job:${id} found in cache`);
        return res.status(200).json({
            message: 'Job fetched successfully (from cache)',
            job: JSON.parse(cachedJob),
            success: true,
            statusCode: 200
        });
    }

    const job = await Job.findById(id).populate('job_adder', 'username fullName');

    if (!job) {
        throw new ApiError({ message: 'Job not found', status: 404 });
    }

    await req.redisClient.set(jobCacheKey, JSON.stringify(job), 'EX', 3600); // Cache for 1 hour

    res.status(200).json({
        message: 'Job fetched successfully',
        job,
        success: true,
        statusCode: 200
    });
});

const updateJob = asyncHandler(async (req, res, next) => {
    logger.info('hit update job...');
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
        throw new ApiError({ message: 'Job not found', status: 404 });
    }

    // Ensure only the user who added the job can update it
    if (job.job_adder.toString() !== req.user.user_id) {
        throw new ApiError({ message: 'User not authorized to update this job', status: 403 });
    }

    const { error } = validateJobData(req.body);
    if (error) {
        throw new ApiError({ message: error.details[0].message, status: 400 });
    }

    const { title, company_name, location } = req.body;

    // Check if another job with the new details already exists
    const isJobExists = await Job.findOne({ title, company_name, location, _id: { $ne: id } });
    if (isJobExists) {
        throw new ApiError({ message: 'Another job with the same title, company, and location already exists', status: 409 });
    }

    const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    // Invalidate caches
    await req.redisClient.del('jobs:all');
    await req.redisClient.del(`job:${id}`);
    logger.warn(`Cache invalidated for jobs:all and job:${id}`);


    logger.info('job updated successfully');
    res.status(200).json({
        message: 'Job updated successfully',
        job: updatedJob,
        success: true,
        statusCode: 200
    });
});

const deleteJob = asyncHandler(async (req, res, next) => {
    logger.info('hit delete job...');
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
        throw new ApiError({ message: 'Job not found', status: 404 });
    }

    if (job.job_adder.toString() !== req.user.user_id && req.user.role !== 'admin') {
        throw new ApiError({ message: 'User not authorized to delete this job', status: 403 });
    }

    await Job.findByIdAndDelete(id);

    // Invalidate caches
    await req.redisClient.del('jobs:all');
    await req.redisClient.del(`job:${id}`);
    logger.warn(`Cache invalidated for jobs:all and job:${id}`);

    logger.info('job deleted successfully');
    res.status(200).json({
        message: 'Job deleted successfully',
        success: true,
        statusCode: 200
    });
});

export {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
};