import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge"; // Assuming Badge is available, or use a simple div

const ATSDashboard = () => {
  const [atsScore, setAtsScore] = useState(99); // Mock ATS score
  const [aiAdvice, setAiAdvice] = useState([
    "Improve keyword density by adding more industry-specific terms.",
    "Use quantifiable achievements to strengthen your experience section.",
    "Ensure your resume is ATS-friendly by avoiding complex formatting.",
    "Tailor your resume to the job description for better matching."
  ]);
  const [matchedKeywords, setMatchedKeywords] = useState(["JavaScript", "React", "Node.js", "API"]);
  const [missingKeywords, setMissingKeywords] = useState(["Python", "AWS", "Docker"]);
  const [progressOffset, setProgressOffset] = useState(100); // Start at 100 for no progress

  // Mock data loading
  useEffect(() => {
    // In a real app, fetch data from API
    // Example: fetch('/api/ats-analysis').then(res => res.json()).then(data => { setAtsScore(data.score); setAiAdvice(data.advice); });
    // Animate progress on mount
    setTimeout(() => setProgressOffset(100 - atsScore), 100);
  }, [atsScore]);

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
                  stroke={atsScore >= 80 ? "#10b981" : atsScore >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="2"
                  strokeDasharray={`${atsScore}, 100`}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{atsScore}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {atsScore >= 80 ? "Excellent! Your resume is highly ATS-friendly." :
               atsScore >= 60 ? "Good, but there's room for improvement." :
               "Needs significant improvements to pass ATS filters."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Response Advice Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Response Advice</CardTitle>
          <CardDescription>Personalized suggestions to improve your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {aiAdvice.map((advice, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                <p className="text-sm">{advice}</p>
              </li>
            ))}
          </ul>
          <Button className="mt-4" variant="outline">
            Generate More Advice
          </Button>
        </CardContent>
      </Card>

      {/* Keywords Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Matched Keywords</CardTitle>
            <CardDescription>Keywords found in your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">{keyword}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missing Keywords</CardTitle>
            <CardDescription>Keywords not found in your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword, index) => (
                <Badge key={index} variant="destructive">{keyword}</Badge>
              ))}
            </div>
            <Button className="mt-4" size="sm">
              Add to Resume
            </Button>
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
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
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