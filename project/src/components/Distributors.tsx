import React, { useState, useEffect, useMemo } from 'react';
import { Phone, MapPin, Search } from 'lucide-react';
import api from '../api'; // Assuming you're using axios for API calls

const Distributors = () => {
  interface Distributor {
    _id: string;
    fullName: string;
    phoneNumber: string;
    businessAddress: string;
    sustainabilityBadge: string;
  }
  
  const [distributorsData, setDistributorsData] = useState<Distributor[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch distributor data from the API
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await api.get('http://localhost:5000/api/distributor'); // Replace with your API endpoint
        setDistributorsData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch distributors. Please try again later.");
        setLoading(false);
      }
    };

    fetchDistributors();
  }, []);

  // Filter distributors based on location
  const filteredDistributors = useMemo(() => {
    return distributorsData.filter(distributor =>
      !searchLocation || distributor.businessAddress.toLowerCase().includes(searchLocation.toLowerCase())
    );
  }, [distributorsData, searchLocation]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Loading distributors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Location</label>
            <div className="relative">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Enter location..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDistributors.map((distributor, index) => (
          <div key={distributor._id || index} className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-green-800 mb-4">{distributor.fullName}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-5 h-5" />
                <span>{distributor.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{distributor.businessAddress}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Sustainability Badge</p>
                <p className="text-lg font-bold text-green-600">{distributor.sustainabilityBadge}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDistributors.length === 0 && (
        <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No distributors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Distributors;