import React, { useState } from 'react';
import { CheckCircle2, Upload, X } from 'lucide-react';

interface ProfileModalProps {
  profileData: any;
  setProfileData: (data: any) => void;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ profileData, setProfileData, onClose }) => {
  const [isEditing, setIsEditing] = useState(!profileData.location);
  const [formData, setFormData] = useState({
    location: profileData.location || '',
    landArea: profileData.landArea || '',
    soilType: profileData.soilType || '',
    proofOfLand: null as File | null,
    certification: null as File | null,
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData({
      ...profileData,
      ...formData,
      certificationStatus: formData.certification ? 'uploaded' : profileData.certificationStatus,
    });
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setIsEditing(false);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'proofOfLand' | 'certification') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [type]: e.target.files[0] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">Farmer Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {showSuccessMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Profile updated successfully!
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Land in acres</label>
                <input
                  type="number"
                  value={formData.landArea}
                  onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type of soil</label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              >
                <option value="">Select soil type</option>
                <option value="Clay Soil">Clay Soil</option>
                <option value="Sandy Soil">Sandy Soil</option>
                <option value="Loamy Soil">Loamy Soil</option>
                <option value="Silt Soil">Silt Soil</option>
                <option value="Black Soil">Black Soil</option>
                <option value="Red Soil">Red Soil</option>
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Proof of land</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'proofOfLand')}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100"
                  required={!profileData.proofOfLand}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Certification</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'certification')}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100"
                  required={!profileData.certification}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Update Profile
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">Location</label>
                <p className="font-medium text-gray-800">{profileData.location}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Land Area</label>
                <p className="font-medium text-gray-800">{profileData.landArea} acres</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Soil Type</label>
                <p className="font-medium text-gray-800">{profileData.soilType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Certification Status</label>
                <p className="font-medium text-gray-800">
                  {profileData.certificationStatus === 'uploaded' ? (
                    <span className="text-green-600">Verified ✓</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;