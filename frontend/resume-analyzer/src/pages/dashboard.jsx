import { useState, useRef } from "react";
import { Upload, Sparkles, Target, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ResumeLoadingScreen from "../components/ResumeLoadingScreen";
import ParsedResume from "../components/ParsedResume.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Chat sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Hi! I'm here to help with any questions you have." },
  ]);
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState(null);
  const [showThinking, setShowThinking] = useState({});

  const fileRef = useRef(null);
  const messageIdCounter = useRef(messages.length + 1);

  const parseFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('http://localhost:3000/api/v1/resume-parser/parse', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }
      const data = await response.json();
      // No longer setting parsedData since chat is general
      setMessages((m) => [
        ...m,
        { id: messageIdCounter.current++, role: "assistant", content: <ParsedResume parsedData={data.parsedData} /> },
      ]);
    } catch (error) {
      console.error("Error parsing PDF:", error);
      setMessages((m) => [
        ...m,
        { id: messageIdCounter.current++, role: "assistant", content: "Sorry, there was an error parsing your resume." },
      ]);
    }
  };

  const sendChatMessage = async (message) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/chat/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message }),
      });
      const result = await response.json();
      if (result.success) {
        setMessages((m) => [
          ...m,
          {
            id: messageIdCounter.current++,
            role: "assistant",
            content: result.response,
            thinking: result.thinking
          },
        ]);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
      setMessages((m) => [
        ...m,
        { id: messageIdCounter.current++, role: "assistant", content: "Sorry, there was an error processing your question." },
      ]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setIsLoading(true);
      await parseFile(file);
      
      // Show loading screen after successful parse
      const loadingScreenTimeout = setTimeout(() => {
        navigate('/ats');
      }, 6000); // Total time for all loading steps

      // Cleanup timeout if component unmounts
      return () => clearTimeout(loadingScreenTimeout);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setIsLoading(true);
      await parseFile(file);
      
      // Show loading screen after successful parse
      const loadingScreenTimeout = setTimeout(() => {
        navigate('/ats');
      }, 6000); // Total time for all loading steps

      // Cleanup timeout if component unmounts
      return () => clearTimeout(loadingScreenTimeout);
    }
  };

  // Chat handlers
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    setMessages((m) => [
      ...m,
      { id: messageIdCounter.current++, role: "user", content: `Uploaded ${f.name}` },
    ]);
    // In a real app: upload file to server or pass to parser here
  };

  const onSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { id: messageIdCounter.current++, role: "user", content: text }]);
    setInput("");
    await sendChatMessage(text);
  };

  return (
    <div className="min-h-screen bg-white">
      {loading && <ResumeLoadingScreen />}
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

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleSidebar}
          aria-label="Chat with PDF"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl hover:scale-105 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.864 9.864 0 01-3.89-.77L3 20l1.23-3.44A7.975 7.975 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Chat Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">R</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">AI Assistant</div>
                      <span className="px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Free</span>
                    </div>
                    <div className="text-xs text-slate-500">Ask me anything!</div>
                  </div>
                </div>
                <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white ring-1 ring-black/5 text-slate-800'} max-w-[80%] px-3 py-2 rounded-lg`}>
                      <div className="text-sm">
                        {m.content || m.text}
                        {m.thinking && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => setShowThinking(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                              <svg className={`w-3 h-3 transition-transform ${showThinking[m.id] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              {showThinking[m.id] ? 'Hide thinking' : 'Show thinking'}
                            </button>
                            {showThinking[m.id] && (
                              <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-indigo-200">
                                <pre className="whitespace-pre-wrap font-mono">{m.thinking}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t bg-white">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="p-2 rounded-md hover:bg-slate-50"
                    title="Upload PDF"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
                    placeholder={fileName ? `Ask about ${fileName} or type a question...` : 'Type a message or upload a resume (PDF)'}
                    className="flex-1 px-3 py-2 rounded-full border bg-white text-sm outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                  <button
                    onClick={onSend}
                    className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm hover:brightness-110"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
            {/* Hidden file input */}
            <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
          </div>
      )}
    </div>
  );
};

export default Dashboard;