import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                // The backend server.js file configures the job routes under /api/v1/job
                const response = await fetch('http://localhost:3000/api/v1/job', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch jobs');
                }

                const data = await response.json();
                // Assuming the backend returns an object with a 'jobs' array property
                setJobs(data.jobs || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []); // Empty dependency array ensures this runs only once on mount

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Available Jobs</h1>
            {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <Card key={job._id} className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-gray-800">{job.title}</CardTitle>
                                <CardDescription className="text-lg text-orange-600 font-semibold">{job.company_name}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-600">Location:</span>
                                    <span className="text-sm text-gray-800">{job.location}</span>
                                </div>
                                {job.salary && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-600">Salary:</span>
                                        <span className="text-sm text-gray-800">${job.salary.toLocaleString()}</span>
                                    </div>
                                )}
                                {job.experience && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-600">Experience:</span>
                                        <span className="text-sm text-gray-800">{job.experience} years</span>
                                    </div>
                                )}
                                {job.skills && job.skills.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-600">Skills:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills.map((skill, index) => (
                                                <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                                    Apply Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 text-lg">No jobs found at the moment.</p>
            )}
        </div>
    );
};

export default Jobs;
