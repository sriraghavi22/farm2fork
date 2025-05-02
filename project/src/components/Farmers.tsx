import React, { useState } from 'react';
import { Search, MapPin, Phone, Package, Truck, X, Star } from 'lucide-react';
import type { Farmer, Product } from '../types';
import defaultFarmerPhoto from '../images/farmerDp.avif'

// Updated interface based on your schema
interface FarmerProduct {
  cropType: string;
  fertilizersUsed: string;
  quantity: number;
  costPerQuintal: number;
}

// Extended Farmer interface with badge calculation
interface FarmerWithBadge extends Farmer {
  crops?: FarmerProduct[];
}

interface FarmersProps {
  farmers: FarmerWithBadge[];
}

// Badge configuration with descriptions
const SUSTAINABILITY_BADGES = {
  GOLD: {
    name: 'Gold',
    style: 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white',
    description: 'Uses 100% organic practices with zero carbon footprint and regenerative farming'
  },
  SILVER: {
    name: 'Silver',
    style: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
    description: 'Implements sustainable irrigation and reduced chemical usage'
  },
  BRONZE: {
    name: 'Bronze',
    style: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white',
    description: 'Beginning sustainable practices with crop rotation techniques'
  },
  SPROUT: {
    name: 'Sprout',
    style: 'bg-gradient-to-r from-green-400 to-green-600 text-white',
    description: 'New to sustainable farming, starting their eco-friendly journey'
  }
};

// Updated badge style function
const getBadgeStyle = (badge: string | undefined) => {
  if (!badge) return SUSTAINABILITY_BADGES.SPROUT.style;
  
  switch (badge.toLowerCase()) {
    case 'gold':
      return SUSTAINABILITY_BADGES.GOLD.style;
    case 'silver':
      return SUSTAINABILITY_BADGES.SILVER.style;
    case 'bronze':
      return SUSTAINABILITY_BADGES.BRONZE.style;
    default:
      return SUSTAINABILITY_BADGES.SPROUT.style;
  }
};

// Updated badge text function
const getBadgeText = (badge: string | undefined) => {
  if (!badge) return SUSTAINABILITY_BADGES.SPROUT.name;
  
  switch (badge.toLowerCase()) {
    case 'gold':
      return SUSTAINABILITY_BADGES.GOLD.name;
    case 'silver':
      return SUSTAINABILITY_BADGES.SILVER.name;
    case 'bronze':
      return SUSTAINABILITY_BADGES.BRONZE.name;
    default:
      return SUSTAINABILITY_BADGES.SPROUT.name;
  }
};

// Get badge description for hover
const getBadgeDescription = (badge: string | undefined) => {
  if (!badge) return SUSTAINABILITY_BADGES.SPROUT.description;
  
  switch (badge.toLowerCase()) {
    case 'gold':
      return SUSTAINABILITY_BADGES.GOLD.description;
    case 'silver':
      return SUSTAINABILITY_BADGES.SILVER.description;
    case 'bronze':
      return SUSTAINABILITY_BADGES.BRONZE.description;
    default:
      return SUSTAINABILITY_BADGES.SPROUT.description;
  }
};

// The Badge component with hover effect
const SustainabilityBadge = ({ badge }: { badge: string | undefined }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative">
      <span 
        className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold ${getBadgeStyle(badge)}`}
        style={{
          clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)',
          width: '2em',
          height: '2em',
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {getBadgeText(badge).charAt(0)}
      </span>
      
      {showTooltip && (
        <div className="absolute z-10 p-2 text-xs bg-gray-800 text-white rounded shadow-lg w-48 -left-20 top-8">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
          <p className="font-semibold mb-1">{getBadgeText(badge)} Sustainability</p>
          <p>{getBadgeDescription(badge)}</p>
        </div>
      )}
    </div>
  );
};

export const Farmers: React.FC<FarmersProps> = ({ farmers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerWithBadge | null>(null);

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         farmer.products?.some(product => product.name.toLowerCase().includes(searchTerm.toLowerCase())) || false;
    const matchesLocation = farmer.location?.toLowerCase().includes(locationFilter.toLowerCase()) || false;
    return matchesSearch && (locationFilter ? matchesLocation : true);
  });

  const handleFarmerClick = (farmer: FarmerWithBadge) => {
    setSelectedFarmer(farmer);
  };

  const handleCloseDetails = () => {
    setSelectedFarmer(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-emerald-800">Supplier Network</h2>
        <div className="flex items-center gap-2 text-emerald-700">
          <Truck className="h-5 w-5" />
          <span className="font-medium">Total Suppliers: {filteredFarmers.length}</span>
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search suppliers or products..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Filter by location..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarmers.map(farmer => (
          <div
            key={farmer.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => handleFarmerClick(farmer)}
          >
            <div className="flex items-center mb-4">
              <div className="relative w-20 h-20 mr-4">
                <img
                  src={farmer.photo || defaultFarmerPhoto}
                  alt={farmer.fullName}
                  className="w-full h-full rounded-full object-cover border-4 border-emerald-100"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                  <Package className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <h3 className="text-xl font-semibold text-emerald-800 mr-2">{farmer.fullName}</h3>
                  <SustainabilityBadge badge={farmer.sustainabilityBadge} />
                </div>
                <div className="flex items-center text-gray-600 mb-1">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  <span className="text-sm">{farmer.rating || '0'} Rating</span>
                </div>
                <p className="text-sm text-gray-600">
                  {farmer.products?.map(p => p.name).join(', ') || 
                   farmer.crops?.map(c => c.cropType).join(', ') || 
                   'No products listed'}
                </p>
                <div className="flex items-center text-gray-600 mt-1">
                  <Phone className="h-4 w-4 mr-1 text-emerald-600" />
                  <span className="text-sm">{farmer.phoneNumber || 'No phone number'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
              <span className="text-sm">{farmer.location || 'Location not specified'}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedFarmer && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 relative">
            <button
              className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
              onClick={handleCloseDetails}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-emerald-800">{selectedFarmer.fullName}</h2>
              <SustainabilityBadge badge={selectedFarmer.sustainabilityBadge} />
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="text-sm">{selectedFarmer.rating || '0'} Rating</span>
            </div>
            <p className="text-gray-700 mb-6">
              <strong>Location:</strong> {selectedFarmer.location || 'Not specified'} | <strong>Phone:</strong> {selectedFarmer.phoneNumber || 'Not specified'}
            </p>
            
            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              {selectedFarmer.products && selectedFarmer.products.length > 0 ? 'Product Details:' : 
              (selectedFarmer.crops && selectedFarmer.crops.length > 0 ? 'Crop Details:' : 'No Products Listed')}
            </h3>
            
            {selectedFarmer.products && selectedFarmer.products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-emerald-100">
                      <th className="border border-gray-200 px-4 py-2 text-left">Product Name</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Quantity</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Unit</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Price/Unit</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFarmer.products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">{product.name}</td>
                        <td className="border border-gray-200 px-4 py-2">{product.quantity}</td>
                        <td className="border border-gray-200 px-4 py-2">{product.unit}</td>
                        <td className="border border-gray-200 px-4 py-2">₹{product.price}</td>
                        <td className="border border-gray-200 px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            product.qualityGrade === 'A' ? 'bg-green-100 text-green-800' :
                            product.qualityGrade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            Grade {product.qualityGrade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : selectedFarmer.crops && selectedFarmer.crops.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-emerald-100">
                      <th className="border border-gray-200 px-4 py-2 text-left">Crop Type</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Quantity</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Cost/Quintal</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Fertilizers Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFarmer.crops.map((crop, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">{crop.cropType}</td>
                        <td className="border border-gray-200 px-4 py-2">{crop.quantity} quintal</td>
                        <td className="border border-gray-200 px-4 py-2">₹{crop.costPerQuintal}</td>
                        <td className="border border-gray-200 px-4 py-2">{crop.fertilizersUsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No products or crops data available for this farmer.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};