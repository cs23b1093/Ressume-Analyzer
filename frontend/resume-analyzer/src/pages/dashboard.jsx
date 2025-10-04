import { useState } from "react";
import { Upload, Sparkles, Target, Zap } from "lucide-react";

const Dashboard = () => {
  const [loading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Andada+Pro:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap');
        
        .indie-flower {
          font-family: 'Andada Pro', serif;
        }
        
        .highlight-orange {
          font-family: 'Architects Daughter', cursive;
          color: #ff6b35;
          text-decoration: underline;
          text-decoration-color: #ff6b35;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
        }
        
        .highlight-gray {
          font-family: 'Architects Daughter', cursive;
          color: #6b7280;
          text-decoration: underline;
          text-decoration-color: #6b7280;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
        }
      `}</style>

      {/* Hero Section with Drag & Drop */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Drag & Drop */}
          <div
            className={`relative border-4 border-dashed rounded-2xl p-8 transition-all duration-300 ${
              dragActive
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx"
            />
            
            <div className="text-center indie-flower">
              <Upload className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-2xl font-bold text-black mb-3">
                {uploadedFile ? "File Uploaded! 🎉" : "Drop Your Resume Here"}
              </h3>
              <p className="text-gray-600 mb-4 text-lg">
                {uploadedFile
                  ? uploadedFile.name
                  : "or click to browse files"}
              </p>
              <label
                htmlFor="fileInput"
                className="inline-block px-6 py-2 bg-orange-500 rounded-full text-white font-bold cursor-pointer hover:bg-orange-600 transition-colors"
              >
                {uploadedFile ? "Upload Another" : "Choose File"}
              </label>
              {loading && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Hero Text */}
          <div className="text-right indie-flower">
            <h1 className="text-5xl font-bold text-black leading-tight mb-4">
              Level Up Your Resume
            </h1>
            <p className="text-xl text-gray-600">
              AI-powered insights for your career 💯
            </p>
          </div>
        </div>
      </div>

      {/* Feature Section 1 - AI Feedback (Left Content) */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="indie-flower">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-orange-500" />
              <h2 className="text-3xl font-bold text-black">
                Get <span className="highlight-orange">AI Feedback</span>
              </h2>
            </div>
            <p className="text-lg text-black leading-relaxed">
              Our AI analyzes your resume like a <span className="highlight-gray">pro recruiter</span>. Get instant,
              actionable feedback on everything from formatting to content.
              This is the <span className="highlight-orange">feedback you need</span> to stand out
              in applications. We'll tell you what's working and
              what needs improvement.
            </p>
          </div>
          <div className="text-right indie-flower">
            <div className="text-7xl font-bold text-gray-200">
              AI
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section 2 - ATS Score (Right Content) */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-left indie-flower">
            <div className="text-7xl font-bold text-gray-200">
              ATS
            </div>
          </div>
          <div className="indie-flower">
            <div className="flex items-center gap-3 mb-4 justify-end">
              <h2 className="text-3xl font-bold text-black text-right">
                Check <span className="highlight-orange">ATS Score</span>
              </h2>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-lg text-black leading-relaxed text-right">
              Beat the bots! Most companies use <span className="highlight-gray">ATS (Applicant Tracking Systems)</span>
              to filter resumes before a human sees them. We'll scan your
              resume and give you a score based on how well it'll perform.
              Get tips on <span className="highlight-orange">keywords, formatting, and structure</span>
              that'll help you get past the digital gatekeepers.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Section 3 - Instant Results (Left Content) */}
      <div className="container mx-auto px-4 py-16 pb-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="indie-flower">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-orange-500" />
              <h2 className="text-3xl font-bold text-black">
                <span className="highlight-orange">Instant Results</span>
              </h2>
            </div>
            <p className="text-lg text-black leading-relaxed">
              No waiting around. Upload your resume and get <span className="highlight-gray">comprehensive
              analysis in seconds</span>. We'll highlight your strengths, point out
              areas for improvement, and give you specific recommendations
              that you can implement right away. It's like having a <span className="highlight-orange">career
              coach in your pocket</span>, but faster and more affordable.
            </p>
          </div>
          <div className="text-right indie-flower">
            <div className="text-7xl font-bold text-gray-200">
              GO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;