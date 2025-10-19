import mongoose from 'mongoose';
import dbConnect from '../src/config/dbConnect.js';
import { Job } from '../src/models/jobs.model.js';

const sampleJobs = [
    {
        title: "Senior Frontend Developer",
        description: "We are seeking a Senior Frontend Developer experienced with React, TypeScript, and performance optimization. Responsibilities include building reusable components, mentoring juniors, and collaborating on product design.",
        company_name: "Acme Corp",
        company_details: "Acme Corp is a fast-growing SaaS startup focused on HR tools. Series B funded, remote-first.",
        location: "Bangalore, India (Remote)",
        job_adder: "64b6f2a4c3f1a4b2d5e6f789", // Placeholder user ID - replace with actual user ID if needed
        salary: 120000,
        experience: 5,
        skills: ["react", "typescript", "redux", "tailwindcss", "testing-library"],
        applications: 0
    },
    {
        title: "Full Stack Developer",
        description: "Join our team as a Full Stack Developer working on cutting-edge web applications. You'll be responsible for both frontend and backend development using modern technologies.",
        company_name: "Tech Solutions Inc",
        company_details: "Tech Solutions Inc is a leading software development company specializing in enterprise solutions.",
        location: "Mumbai, India",
        job_adder: "64b6f2a4c3f1a4b2d5e6f789",
        salary: 90000,
        experience: 3,
        skills: ["nodejs", "react", "mongodb", "express", "javascript"],
        applications: 0
    },
    {
        title: "DevOps Engineer",
        description: "We're looking for a skilled DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. Experience with AWS and Docker is required.",
        company_name: "CloudTech",
        company_details: "CloudTech provides cloud solutions and managed services for businesses worldwide.",
        location: "Delhi, India (Hybrid)",
        job_adder: "64b6f2a4c3f1a4b2d5e6f789",
        salary: 110000,
        experience: 4,
        skills: ["aws", "docker", "kubernetes", "jenkins", "terraform"],
        applications: 0
    },
    {
        title: "Data Scientist",
        description: "Exciting opportunity for a Data Scientist to work on machine learning projects and big data analytics. Python and SQL expertise required.",
        company_name: "Data Insights Corp",
        company_details: "Data Insights Corp helps companies leverage their data for better decision making.",
        location: "Pune, India",
        job_adder: "64b6f2a4c3f1a4b2d5e6f789",
        salary: 95000,
        experience: 2,
        skills: ["python", "machine-learning", "sql", "pandas", "tensorflow"],
        applications: 0
    },
    {
        title: "UI/UX Designer",
        description: "Creative UI/UX Designer needed to design intuitive user interfaces and improve user experience across our products.",
        company_name: "Design Studio",
        company_details: "Design Studio is a creative agency specializing in digital product design.",
        location: "Chennai, India (Remote)",
        job_adder: "64b6f2a4c3f1a4b2d5e6f789",
        salary: 70000,
        experience: 3,
        skills: ["figma", "sketch", "adobe-xd", "prototyping", "user-research"],
        applications: 0
    }
];

async function seedJobs() {
    try {
        await dbConnect();
        console.log('Connected to database');

        for (const jobData of sampleJobs) {
            // Check if job already exists to avoid duplicates
            const existingJob = await Job.findOne({
                title: jobData.title,
                company_name: jobData.company_name,
                location: jobData.location
            });

            if (!existingJob) {
                await Job.create(jobData);
                console.log(`✓ Seeded job: ${jobData.title} at ${jobData.company_name}`);
            } else {
                console.log(`- Job already exists: ${jobData.title} at ${jobData.company_name}`);
            }
        }

        console.log('\nSeeding completed successfully!');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seeding function
seedJobs();
