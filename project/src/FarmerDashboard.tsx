import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CropDetails from './components/CropDetails';
import Distributors from './components/Distributors';
import { User } from 'lucide-react';
import ProfileModal from './components/ProfileModal';

function FarmerDashboard() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    location: '',
    landArea: '',
    soilType: '',
    proofOfLand: null as File | null,
    certification: null as File | null,
    certificationStatus: 'none' as 'none' | 'uploaded',
  });

  return (
    <AppContent 
      showProfileModal={showProfileModal} 
      setShowProfileModal={setShowProfileModal}
      profileData={profileData}
      setProfileData={setProfileData}
    />
  );
}

function AppContent({ 
  showProfileModal, 
  setShowProfileModal, 
  profileData, 
  setProfileData 
}: {
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  profileData: any;
  setProfileData: (data: any) => void;
}) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" 
         style={{ 
           backgroundImage: 'url("https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3270&q=80")',
         }}>
      <div className="min-h-screen bg-black bg-opacity-50">
        <header className="bg-white bg-opacity-90 shadow-md p-4 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-green-800">John Smith</h1>
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-green-100 text-green-800 p-2 rounded-full hover:bg-green-200 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1580974928064-f0aeef70895a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80" 
                alt="Batch Certificate" 
                className="h-12 w-12 rounded-lg shadow-md"
              />
              <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full font-medium">
                Batch #2024-001
              </span>
            </div>
          </div>
        </header>
        
        <Navbar />
        
        <main className="container mx-auto p-4 mt-4">
          {location.pathname === '/' ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to Your Farm Management Dashboard</h1>
              <p className="text-xl mb-8">Select a category from the navigation menu to get started</p>
            </div>
          ) : (
            <Routes>
              <Route path="/CropDetails" element={<CropDetails />} />
              <Route path="/Distributors" element={<Distributors />} />
            </Routes>
          )}
        </main>

        {showProfileModal && (
          <ProfileModal 
            profileData={profileData}
            setProfileData={setProfileData}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default FarmerDashboard;
