import React, { useState } from 'react';
import { Award, Upload, Leaf, Plane as Plant, Star, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FarmerCertificate() {
  const [step, setStep] = useState<'initial' | 'upload' | 'selfDeclare' | 'complete'>('initial');
  const [certificationType, setCertificationType] = useState<'certified' | 'declared' | 'farmer' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate(); // Use the useNavigate hook

  const handleCertifiedFarmer = (answer: boolean) => {
    if (answer) {
      setStep('upload');
    } else {
      setStep('selfDeclare');
    }
  };

  const handleSelfDeclare = (answer: boolean) => {
    setCertificationType(answer ? 'declared' : 'farmer');
    setStep('complete');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setCertificationType('certified');
      setStep('complete');
    }
  };

  const Badge = ({ type }: { type: 'certified' | 'declared' | 'farmer' }) => {
    const badges = {
      certified: {
        icon: <Award className="w-20 h-20 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />,
        decorativeIcons: [
          <Star key="star1" className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />,
          <Shield key="shield" className="w-6 h-6 text-green-500 absolute -bottom-2 -left-2 animate-bounce" />,
          <Sparkles key="sparkles" className="w-6 h-6 text-yellow-300 absolute -top-2 -left-2 animate-spin-slow" />
        ],
        title: 'Certified Organic Farmer',
        description: 'Officially recognized for sustainable and organic farming practices',
        color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-500',
        textColor: 'text-green-800',
        achievements: ['Verified Certification', 'Sustainable Practices', 'Quality Assurance']
      },
      declared: {
        icon: <Leaf className="w-20 h-20 text-green-500 group-hover:rotate-12 transition-transform duration-300" />,
        decorativeIcons: [
          <Leaf key="leaf1" className="w-6 h-6 text-green-400 absolute -top-2 -right-2 rotate-45" />,
          <Leaf key="leaf2" className="w-6 h-6 text-green-300 absolute -bottom-2 -left-2 -rotate-45" />
        ],
        title: 'Self-Declared Organic Farmer',
        description: 'Committed to organic farming principles and sustainable agriculture',
        color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500',
        textColor: 'text-blue-800',
        achievements: ['Organic Practices', 'Environmental Focus', 'Sustainable Methods']
      },
      farmer: {
        icon: <Plant className="w-20 h-20 text-amber-600 group-hover:scale-105 transition-transform duration-300" />,
        decorativeIcons: [
          <Plant key="plant1" className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 rotate-12" />
        ],
        title: 'Traditional Farmer',
        description: 'Dedicated to agricultural excellence and food production',
        color: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-500',
        textColor: 'text-amber-800',
        achievements: ['Agricultural Expertise', 'Food Production', 'Land Management']
      }
    };

    const badge = badges[type];

    return (
      <div 
        className={`group perspective-1000 cursor-pointer transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative p-8 rounded-xl ${badge.color} border-2 text-center max-w-md mx-auto 
          shadow-lg hover:shadow-2xl transition-all duration-300 transform 
          ${isFlipped ? 'rotate-y-180 absolute inset-0' : ''}`}
        >
          <div className="relative inline-block mb-4">
            {badge.icon}
            {badge.decorativeIcons}
          </div>
          <h2 className={`text-3xl font-bold ${badge.textColor} mb-3`}>{badge.title}</h2>
          <p className={`${badge.textColor} opacity-80 mb-4`}>{badge.description}</p>
          {type === 'certified' && file && (
            <p className="text-green-600 mt-2 font-medium">
              ✓ Certificate verified: {file.name}
            </p>
          )}
          <div className="mt-4 space-y-2">
            {badge.achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`${badge.textColor} bg-white/50 rounded-full py-2 px-4 text-sm font-medium
                  transform hover:scale-105 transition-transform duration-200`}
              >
                {achievement}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
      }}
    >
      <div className="bg-white/90 p-8 rounded-xl shadow-2xl backdrop-blur-sm max-w-2xl w-full">
        {step === 'initial' && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-8">Are you a certified farmer?</h1>
            <div className="space-x-4">
              <button
                onClick={() => handleCertifiedFarmer(true)}
                className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition-colors
                  transform hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                Yes
              </button>
              <button
                onClick={() => handleCertifiedFarmer(false)}
                className="bg-gray-500 text-white px-8 py-3 rounded-full hover:bg-gray-600 transition-colors
                  transform hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                No
              </button>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-8">Upload Your Certification</h1>
            <div className="border-2 border-dashed border-green-300 rounded-lg p-8 mb-4
              hover:border-green-500 transition-colors duration-300 group">
              <Upload className="w-12 h-12 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="certificate"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="certificate"
                className="bg-green-500 text-white px-6 py-3 rounded-full cursor-pointer 
                  hover:bg-green-600 transition-all duration-300 inline-block
                  transform hover:scale-105 hover:shadow-lg"
              >
                Select Certificate
              </label>
            </div>
          </div>
        )}

        {step === 'selfDeclare' && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-8">Do you declare yourself as a self organic farmer?</h1>
            <div className="space-x-4">
              <button
                onClick={() => handleSelfDeclare(true)}
                className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 
                  transform hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                Yes
              </button>
              <button
                onClick={() => handleSelfDeclare(false)}
                className="bg-gray-500 text-white px-8 py-3 rounded-full hover:bg-gray-600
                  transform hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                No
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && certificationType && (
          <>
            <Badge type={certificationType} />
            <button
              onClick={() => navigate('/FarmerDashboard')} // Navigate to the FarmerDashboard page
              className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default FarmerCertificate;