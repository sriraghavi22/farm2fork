import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface FarmerDetailsProps {
  setProfileData: (data: any) => void;
}

const FarmerDetails: React.FC<FarmerDetailsProps> = ({ setProfileData }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    landArea: '',
    proofOfLand: null as File | null,
    soilType: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData({
      location: formData.location,
      landArea: formData.landArea,
      soilType: formData.soilType,
    });
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, proofOfLand: e.target.files[0] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-green-800 mb-6">Farmer Details</h2>
        <div className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Proof of land</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
              required
            />
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
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Update Profile
          </button>
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Profile Updated!</h3>
            <p className="text-gray-600 mb-4">Your profile has been successfully updated.</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDetails;