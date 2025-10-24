import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingStep = ({ isActive, isDone, text }) => (
  <div className="flex items-center gap-3 text-lg">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 
      ${isActive ? 'border-indigo-600 bg-indigo-50' : isDone ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-gray-50'}`}
    >
      {isDone ? (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-gray-300'}`} />
      )}
    </div>
    <span className={`font-medium ${isActive ? 'text-gray-900' : isDone ? 'text-gray-600' : 'text-gray-400'}`}>
      {text}
    </span>
  </div>
);

const ResumeLoadingScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    'Parsing your resume',
    'Analyzing your experience',
    'Extracting your skills',
    'Generating recommendations'
  ];

  useEffect(() => {
    const timings = [1000, 2000, 1500, 1500]; // Timing for each step in milliseconds
    let timeout;

    const advanceStep = (step) => {
      if (step < steps.length) {
        timeout = setTimeout(() => {
          setCurrentStep(step);
          advanceStep(step + 1);
        }, timings[step]);
      } else {
        // All steps complete, navigate to ATS dashboard
        navigate('/ats');
      }
    };

    advanceStep(0);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <LoadingStep
              key={index}
              text={step}
              isActive={currentStep === index}
              isDone={currentStep > index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeLoadingScreen;