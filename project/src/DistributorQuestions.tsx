import React, { useState } from 'react';
import { Plane as Plant, Droplets, Bug, Wind, ChevronLeft, ChevronRight, Award, Truck, Snowflake, Package, Globe } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import api from './api';

const ContinueButton = () => {
  const navigate = useNavigate();

  const handleCont = () => {
    navigate("/DistributorDashBoard");
  };

  return (
    <button
      onClick={handleCont}
      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      Continue to Dashboard
    </button>
  );
};

interface Question {
  text: string;
  options: {
    label: string;
    points: number;
  }[];
}

const sections = {
  A: {
    title: 'Transportation & Logistics',
    icon: Truck,
    questions: [
      {
        text: 'What type of transport do you use?',
        options: [
          { label: 'Electric / Hybrid / Bicycle', points: 20 },
          { label: 'CNG / Biofuel', points: 15 },
          { label: 'Diesel / Petrol', points: 5 },
        ],
      },
      {
        text: 'Do you optimize delivery routes to reduce fuel consumption?',
        options: [
          { label: 'Yes', points: 10 },
          { label: 'No', points: 0 },
        ],
      },
    ],
  },
  B: {
    title: 'Storage & Energy Efficiency',
    icon: Snowflake,
    questions: [
      {
        text: 'Do you use cold storage?',
        options: [
          { label: 'Yes', points: 10 },
          { label: 'No', points: 0 },
        ],
      },
      {
        text: 'If yes, is your cold storage energy-efficient?',
        options: [
          { label: 'Yes, uses solar or energy-saving tech', points: 15 },
          { label: 'No, standard refrigeration', points: 5 },
        ],
      },
    ],
  },
  C: {
    title: 'Packaging & Waste Management',
    icon: Package,
    questions: [
      {
        text: 'What type of packaging do you use?',
        options: [
          { label: 'Biodegradable / Recyclable', points: 15 },
          { label: 'Plastic / Styrofoam', points: 5 },
        ],
      },
      {
        text: 'Do you have waste reduction measures in place?',
        options: [
          { label: 'Yes', points: 5 },
          { label: 'No', points: 0 },
        ],
      },
    ],
  },
  D: {
    title: 'Carbon Footprint Reduction',
    icon: Globe,
    questions: [
      {
        text: 'Do you track and measure your carbon footprint?',
        options: [
          { label: 'Yes', points: 10 },
          { label: 'No', points: 0 },
        ],
      },
      {
        text: 'Do you offset your carbon emissions? (E.g., tree planting, carbon credits)',
        options: [
          { label: 'Yes', points: 5 },
          { label: 'No', points: 0 },
        ],
      },
    ],
  },
};

const sectionKeys = Object.keys(sections);

function DistributorQuestions() {
  const [answers, setAnswers] = useState<Record<string, number[]>>({
    A: Array(sections.A.questions.length).fill(-1),
    B: Array(sections.B.questions.length).fill(-1),
    C: Array(sections.C.questions.length).fill(-1),
    D: Array(sections.D.questions.length).fill(-1),
  });
  const [currentSection, setCurrentSection] = useState('A');
  const [isComplete, setIsComplete] = useState(false);
/*************  ✨ Codeium Command ⭐  *************/
  /**
   * Handles user answer for a given question in a section, updating the answers state.
   * @param {string} sectionKey The key of the section in which the question belongs.
   * @param {number} questionIndex The index of the question in the section.
   * @param {number} points The points assigned for the given answer.
   */
/******  aa61d26f-91fe-4b0b-9b35-705fca29e8a5  *******/  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      setIsLoading(true);
      setError(null);

      try {
        const userId = localStorage.getItem('userId'); // Get userId from localStorage
        if (!userId) {
          setError('User ID not found. Please log in again.');
          return;
        }
        const totalScore = calculateTotalScore();
        const badge = getBadgeInfo(totalScore);

        const response = await api.put('http://localhost:5000/api/distributor/update-sustainability', {
          score: totalScore,
          badge: badge.type,
          userId: userId,
        });
        console.log(response);

        if (response.status === 200) {
          setIsComplete(true);
        } else {
          setError('Failed to save assessment results. Please try again.');
        }
      } catch (err) {
        setError('An error occurred while saving your results. Please try again.');
        console.error('Error submitting assessment:', err);
      } finally {
        setIsLoading(false);
      }
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

  const updateDistributorScore = async (score: number, badge: string) => {
    try {
      const response = await api.put('/api/distributor/update-sustainability', {
        score,
        badge
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Include your auth token here if required
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 200) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating score:', error);
      return false;
    }
  };

  const getBadgeInfo = (score: number) => {
    if (score >= 35) {
      return {
        type: 'Gold',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        description: 'Excellence in Sustainable Distribution!'
      };
    } else if (score >= 25) {
      return {
        type: 'Silver',
        color: 'text-gray-400',
        bgColor: 'bg-gray-100',
        description: 'Strong Commitment to Sustainable Distribution!'
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
          Distributor Sustainability Assessment
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {!isComplete ? (
          <>
            <div className="flex justify-center space-x-2 mb-8">
              {/* ... (keep existing section buttons) ... */}
            </div>

            {Object.entries(sections).map(([key, section]) => (
              <SectionComponent key={key} sectionKey={key} section={section} />
            ))}

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => navigateSection('prev')}
                disabled={currentSection === 'A' || isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${currentSection === 'A' || isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-green-600 hover:bg-green-50'}`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentSection === 'D' ? (
                <button
                  onClick={handleSubmit}
                  disabled={!isAllAnswered() || isLoading}
                  className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors
                    ${isAllAnswered() && !isLoading
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  {isLoading ? 'Submitting...' : 'Submit Assessment'}
                </button>
              ) : (
                <button
                  onClick={() => navigateSection('next')}
                  disabled={isLoading}
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
                  <div className="flex justify-center mb-4" >
                    <Award className={`w-16 h-16 ${badge.color}`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${badge.color} mb-2`}>
                    {badge.type} Badge Achieved!
                  </h3>
                  <p className="text-gray-700 mb-4">{badge.description}</p>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {totalScore} / 70 
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round((totalScore / 70) * 100)}% Distributor Score
                  </p>
                </div>
              );
            })()}

            <ContinueButton />
          </div>
        )}
      </div>
    </div>
  );
}

export default DistributorQuestions;