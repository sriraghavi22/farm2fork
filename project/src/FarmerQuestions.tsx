import React, { useState } from 'react';
import { Plane as Plant, Droplets, Bug, Wind, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import api from './api';
import { useNavigate } from 'react-router-dom';

 // ✅ Import Axios
interface Question {  
  text: string;
  options: {
    label: string;
    points: number;
  }[];
}

const sections = {
  A: {
    title: 'Soil Health & Fertilizer Use',
    icon: Plant,
    questions: [
      {
        text: 'Do you use organic fertilizers (compost, manure, bio-fertilizers)?',
        options: [
          { label: 'Yes', points: 5 },
          { label: 'No', points: 0 },
        ],
      },
      {
        text: 'Do you practice crop rotation to maintain soil health?',
        options: [
          { label: 'Yes', points: 4 },
          { label: 'No', points: 0 },
        ],
      },
      {
        text: 'Do you use synthetic chemical fertilizers?',
        options: [
          { label: 'No', points: 5 },
          { label: 'Occasionally', points: 2 },
          { label: 'Yes, regularly', points: 0 },
        ],
      },
    ],
  },
  B: {
    title: 'Water Conservation',
    icon: Droplets,
    questions: [
      {
        text: 'What irrigation system do you use?',
        options: [
          { label: 'Drip irrigation / Rain-fed', points: 5 },
          { label: 'Sprinkler system', points: 3 },
          { label: 'Flood irrigation', points: 0 },
        ],
      },
      {
        text: 'Do you harvest rainwater for irrigation?',
        options: [
          { label: 'Yes', points: 5 },
          { label: 'No', points: 0 },
        ],
      },
    ],
  },
  C: {
    title: 'Pesticide & Pest Management',
    icon: Bug,
    questions: [
      {
        text: 'What type of pest control do you use?',
        options: [
          { label: 'Natural (Neem extract, pheromone traps)', points: 5 },
          { label: 'Integrated Pest Management (IPM)', points: 3 },
          { label: 'Chemical pesticides', points: 0 },
        ],
      },
      {
        text: 'Have you eliminated banned or highly toxic pesticides?',
        options: [
          { label: 'Yes', points: 5 },
          { label: 'No', points: 0 },
        ],
      },
    ],
  },
  D: {
    title: 'Energy & Carbon Footprint',
    icon: Wind,
    questions: [
      {
        text: 'Do you use renewable energy (solar, wind) on your farm?',
        options: [
          { label: 'Yes', points: 5 },
          { label: 'No', points: 0 },
        ],
      },
      {
        text: 'How do you manage farm waste?',
        options: [
          { label: 'Composting / Biogas', points: 5 },
          { label: 'Burning', points: 0 },
          { label: 'Other', points: 2 },
        ],
      },
    ],
  },
};

const sectionKeys = Object.keys(sections);

function FarmerQuestions() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number[]>>({
    A: Array(sections.A.questions.length).fill(-1),
    B: Array(sections.B.questions.length).fill(-1),
    C: Array(sections.C.questions.length).fill(-1),
    D: Array(sections.D.questions.length).fill(-1),
  });
  const [currentSection, setCurrentSection] = useState('A');
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (sectionKey: string, questionIndex: number, points: number) => {
    setAnswers(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((val, idx) => 
        idx === questionIndex ? points : val
      ),
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(answers).flat().reduce((sum, points) => 
      points >= 0 ? sum + points : sum, 0
    );
  };

  const isAllAnswered = () => {
    return Object.values(answers).every(section => 
      section.every(answer => answer >= 0)
    );
  };

  const handleSubmit = async () => {
    if (isAllAnswered()) {
        setIsComplete(true);
        await handleSubmitScore();  // ✅ Store data in DB after submission
    }
};

const handleSubmitScore = async () => {
  const score = calculateTotalScore();
  const badgeInfo = getBadgeInfo(score);
  const token = localStorage.getItem("accessToken");

  console.log("Submitting Score:", { score, badge: badgeInfo.type });
  console.log("Token Being Sent:", token);
  console.log("🎯 Calculated Score Before Submission:", score);

  if (!token) {
      console.error("❌ No token found in localStorage!");
      alert("Authentication error. Please log in again.");
      return;
  }

  try {
      const response = await api.post("http://localhost:5000/api/farmer/submit-score", {
          sustainabilityScore: score,
          sustainabilityBadge: badgeInfo.type
      });

      console.log("✅ Server Response:", response.data);
      alert(`Your sustainability score is ${response.data.sustainabilityScore}, and your badge is ${response.data.sustainabilityBadge}`);

  } catch (error: any) {
    console.error("❌ Failed to update score:", error.response ? error.response.data.message : error.message);
  }
};



  const navigateSection = (direction: 'prev' | 'next') => {
    const currentIndex = sectionKeys.indexOf(currentSection);
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentSection(sectionKeys[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < sectionKeys.length - 1) {
      setCurrentSection(sectionKeys[currentIndex + 1]);
    }
  };

  const getBadgeInfo = (score: number) => {
    if (score >= 35) {
      return {
        type: 'Gold',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        description: 'Excellence in Sustainable Agriculture!'
      };
    } else if (score >= 25) {
      return {
        type: 'Silver',
        color: 'text-gray-400',
        bgColor: 'bg-gray-100',
        description: 'Strong Commitment to Sustainable Farming!'
      };
    } else if (score >= 15) {
      return {
        type: 'Bronze',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        description: 'Good Progress in Sustainable Practices!'
      };
    } else {
      return {
        type: 'Sprout',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'Starting Your Sustainability Journey'
      };
    }
  };

  const SectionComponent = ({ sectionKey, section }: { sectionKey: string, section: typeof sections.A }) => {
    const Icon = section.icon;
    return (
      <div className={`p-6 ${currentSection === sectionKey ? 'block' : 'hidden'}`}>
        <div className="flex items-center gap-2 mb-6">
          <Icon className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-semibold text-green-800">{section.title}</h2>
        </div>
        <div className="space-y-6">
          {section.questions.map((question, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-lg text-gray-800 mb-3">{question.text}</p>
              <div className="space-y-2">
                {question.options.map((option, optIdx) => (
                  <label key={optIdx} className="flex items-center space-x-2 cursor-pointer hover:bg-green-50 p-2 rounded-md transition-colors">
                    <input
                      type="radio"
                      name={`${sectionKey}-${idx}`}
                      checked={answers[sectionKey][idx] === option.points}
                      onChange={() => handleAnswer(sectionKey, idx, option.points)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-8">
          Agricultural Sustainability Assessment
        </h1>

        {!isComplete ? (
          <>
            <div className="flex justify-center space-x-2 mb-8">
              {Object.entries(sections).map(([key, section]) => {
                const Icon = section.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setCurrentSection(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                      ${currentSection === key 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white text-green-600 hover:bg-green-50'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>Section {key}</span>
                  </button>
                );
              })}
            </div>

            {Object.entries(sections).map(([key, section]) => (
              <SectionComponent key={key} sectionKey={key} section={section} />
            ))}

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => navigateSection('prev')}
                disabled={currentSection === 'A'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${currentSection === 'A'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-green-600 hover:bg-green-50'}`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentSection === 'D' ? (
                <button
                  onClick={handleSubmit}
                  disabled={!isAllAnswered()}
                  className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors
                    ${isAllAnswered() 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={() => navigateSection('next')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-green-600 hover:bg-green-50 transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Assessment Complete!</h2>
            
            {(() => {
              const totalScore = calculateTotalScore();
              const badge = getBadgeInfo(totalScore);
              return (
                <div className={`p-6 ${badge.bgColor} rounded-lg mb-6`}>
                  <div className="flex justify-center mb-4">
                    <Award className={`w-16 h-16 ${badge.color}`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${badge.color} mb-2`}>
                    {badge.type} Badge Achieved!
                  </h3>
                  <p className="text-gray-700 mb-4">{badge.description}</p>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {totalScore} / 43
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round((totalScore / 43) * 100)}% Sustainability Score
                  </p>
                </div>
              );
            })()}

            <button 
              onClick={() => navigate('/FarmerCertificate')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue to Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmerQuestions;