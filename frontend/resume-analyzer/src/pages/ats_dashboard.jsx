import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const ATSDashboard = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { jobDescription } = location.state || {};
  const resumeId = searchParams.get('resume_id');

  const [atsData, setAtsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressOffset, setProgressOffset] = useState(100); // Start at 100 for no progress

  // Fetch ATS data from API
  useEffect(() => {
    const fetchATSData = async () => {
      if (!jobDescription) {
        setError('Job Description is required');
        setLoading(false);
        return;
      }

      if (!resumeId) {
        setError('Resume ID is required. Please upload a resume first.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/ats/calculate', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ job_description: jobDescription, resume_id: resumeId })
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ATS data.`);
        }

        const data = await response.json();
        setAtsData(data.data);
        setProgressOffset(100 - data.data.overallScore);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchATSData();
  }, [jobDescription, resumeId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Calculating ATS Score...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!atsData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>No ATS data available</p>
        </div>
      </div>
    );
  }

  const { overallScore, scoreBreakdown, keywordAnalysis, skillsAnalysis, recommendations, scoreInterpretation } = atsData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">ATS Dashboard</h1>

      {/* ATS Score Section */}
      <Card>
        <CardHeader>
          <CardTitle>ATS Score</CardTitle>
          <CardDescription>Your resume's compatibility with Applicant Tracking Systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke={overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="2"
                  strokeDasharray={`${overallScore}, 100`}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{overallScore}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{scoreInterpretation}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{scoreBreakdown.keywordMatch}%</div>
                <div className="text-xs text-gray-500">Keyword Match</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{scoreBreakdown.skillsMatch}%</div>
                <div className="text-xs text-gray-500">Skills Match</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{scoreBreakdown.sectionPresence}%</div>
                <div className="text-xs text-gray-500">Section Presence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{scoreBreakdown.contactValidation}%</div>
                <div className="text-xs text-gray-500">Contact Info</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{scoreBreakdown.educationMatch}%</div>
                <div className="text-xs text-gray-500">Education</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{scoreBreakdown.formatScore}%</div>
                <div className="text-xs text-gray-500">Format</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Response Advice Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Personalized suggestions to improve your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendations.map((advice, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                <p className="text-sm">{advice}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Keywords Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Matched Keywords ({keywordAnalysis.matched.length})</CardTitle>
            <CardDescription>Keywords found in your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywordAnalysis.matched.slice(0, 20).map((keyword, index) => (
                <Badge key={index} variant="secondary">{keyword}</Badge>
              ))}
              {keywordAnalysis.matched.length > 20 && (
                <Badge variant="outline">+{keywordAnalysis.matched.length - 20} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missing Keywords ({keywordAnalysis.missing.length})</CardTitle>
            <CardDescription>Keywords not found in your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywordAnalysis.missing.slice(0, 20).map((keyword, index) => (
                <Badge key={index} variant="destructive">{keyword}</Badge>
              ))}
              {keywordAnalysis.missing.length > 20 && (
                <Badge variant="outline">+{keywordAnalysis.missing.length - 20} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Matched Skills ({skillsAnalysis.matched.length})</CardTitle>
            <CardDescription>Skills found in your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillsAnalysis.matched.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missing Skills ({skillsAnalysis.missing.length})</CardTitle>
            <CardDescription>Skills not found in your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillsAnalysis.missing.map((skill, index) => (
                <Badge key={index} variant="destructive">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Features */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Optimization</CardTitle>
          <CardDescription>Tools to enhance your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => {}}>
              <span className="text-2xl mb-1">📄</span>
              <span>Reformat Resume</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">🔍</span>
              <span>Keyword Checker</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">📊</span>
              <span>Score History</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ATSDashboard;