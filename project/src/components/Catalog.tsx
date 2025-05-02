import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import api from '../api';
import type { Farmer, CatalogItem } from '../types';

interface CatalogProps {
  farmers: Farmer[];
  catalogItems: CatalogItem[];
  setCatalogItems: React.Dispatch<React.SetStateAction<CatalogItem[]>>;
  distributorId: string;  // Add this
  distributorName: string;  // Add this
}

export const Catalog: React.FC<CatalogProps> = ({ farmers, catalogItems, setCatalogItems, distributorId, distributorName }) => {
  useEffect(() => {
    console.log('Farmers data:', farmers);
  }, [farmers]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Form state
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [selectedFarmerName, setSelectedFarmerName] = useState<string>('');
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [cropName, setCropName] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [negotiationPrice, setNegotiationPrice] = useState<number | string>('');
  const [negotiatedDate, setNegotiatedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [farmerRating, setFarmerRating] = useState<number>(0);
  
  // Edit mode
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);

  // Fetch catalog items
  const fetchCatalogItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('http://localhost:5000/api/distributor/catalog/items');
      setCatalogItems(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching catalog items:', err);
      setError('Failed to load catalog items');
    } finally {
      setLoading(false);
    }
  };

  // Fetch farmer crops when a farmer is selected
  const fetchFarmerCrops = async (farmerId: string) => {
    console.log('Fetching crops for farmer:', farmerId);
    
    try {
      const response = await api.get(`http://localhost:5000/api/distributor/catalog/farmer-crops/${farmerId}`);
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        const crops = response.data.map((crop: any) => crop.cropType).filter(Boolean);
        setAvailableCrops(crops);
      } else if (response.data.crops && Array.isArray(response.data.crops)) {
        const crops = response.data.crops.map((crop: any) => crop.cropType).filter(Boolean);
        setAvailableCrops(crops);
      } else {
        console.warn('Unexpected API response format:', response.data);
        setAvailableCrops([]);
      }
    } catch (err) {
      console.error('Error fetching farmer crops:', err);
      setAvailableCrops([]);
      setError('Failed to fetch farmer crops');
    }
  };

  // Handle farmer selection
  const handleFarmerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const farmerId = e.target.value;
    console.log('Selected farmer ID from dropdown:', farmerId);
    
    if (!farmerId) {
      setSelectedFarmerId('');
      setSelectedFarmerName('');
      setAvailableCrops([]);
      return;
    }

    setSelectedFarmerId(farmerId);
    
    // Find the selected farmer using the ID
    const selectedFarmer = farmers.find(farmer => farmer._id === farmerId);
    console.log('Found farmer:', selectedFarmer);

    if (selectedFarmer) {
      setSelectedFarmerName(selectedFarmer.fullName);
      setFarmerRating(selectedFarmer.rating || 0);
      await fetchFarmerCrops(farmerId);
    }
  };

  // Add new catalog item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFarmerId || !cropName || !quantity || !negotiationPrice || !deliveryDate) {
      setError('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      console.log(distributorId, distributorName);  // Add this
      const itemData = {
        farmerId: selectedFarmerId,
        farmerName: selectedFarmerName,
        distributorId: distributorId,  // Add this
        distributorName: distributorName,  // Add this
        cropName,
        quantity: Number(quantity),
        negotiationPrice: Number(negotiationPrice),
        negotiatedDate,
        deliveryDate,
        farmerRating
      };
      
      if (editMode && editItemId) {
        await api.put(`http://localhost:5000/api/distributor/catalog/items/${editItemId}`, itemData);
      } else {
        await api.post('http://localhost:5000/api/distributor/catalog/items', itemData);
      }
      
      resetForm();
      fetchCatalogItems();
      setError(null);
    } catch (err) {
      console.error('Error saving catalog item:', err);
      setError('Failed to save catalog item');
    } finally {
      setLoading(false);
    }
  };
  // Delete catalog item
  const handleDeleteItem = async (item: CatalogItem) => {
    if (!item._id) {
      console.error('Cannot delete item: Missing _id');
      setError('Unable to delete item: Invalid ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setLoading(true);
        await api.delete(`http://localhost:5000/api/distributor/catalog/items/${item._id}`);
        await fetchCatalogItems();
        setError(null);
      } catch (err) {
        console.error('Error deleting catalog item:', err);
        setError('Failed to delete catalog item');
      } finally {
        setLoading(false);
      }
    }
  };

  // Edit catalog item
  const handleEditItem = (item: CatalogItem) => {
    setEditMode(true);
    setEditItemId(item._id); // Assuming item._id is the correct identifier
    setSelectedFarmerId(item.farmerId);
    setSelectedFarmerName(item.farmerName);
    setCropName(item.cropName);
    setQuantity(item.quantity);
    setNegotiationPrice(item.negotiationPrice);
    setNegotiatedDate(new Date(item.negotiatedDate).toISOString().split('T')[0]);
    setDeliveryDate(new Date(item.deliveryDate).toISOString().split('T')[0]);
    setFarmerRating(item.farmerRating);
    
    fetchFarmerCrops(item.farmerId);
  };

  // Reset form
  const resetForm = () => {
    setEditMode(false);
    setEditItemId(null);
    setSelectedFarmerId('');
    setSelectedFarmerName('');
    setCropName('');
    setQuantity('');
    setNegotiationPrice('');
    setNegotiatedDate(new Date().toISOString().split('T')[0]);
    setDeliveryDate('');
    setFarmerRating(0);
    setAvailableCrops([]);
  };

  // Filter catalog items based on search term
  const filteredItems = catalogItems.filter(item => 
    item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cropName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initial data fetch
  useEffect(() => {
    fetchCatalogItems();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-emerald-800 mb-6">Distribution Catalog</h2>
      
      {/* Add/Edit Form */}
      <div className="bg-emerald-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-emerald-700 mb-4">
          {editMode ? 'Edit Catalog Item' : 'Add New Item'}
        </h3>
        
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Farmer Selection */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name:</label>
            <select
              value={selectedFarmerId}
              onChange={handleFarmerChange}
              className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
              style={{ maxHeight: '38px' }}
            >
              <option value="">Select Farmer</option>
              <optgroup label="Available Farmers" className="max-h-60 overflow-y-auto">
                {farmers.map(farmer => (
                  <option key={farmer._id} value={farmer._id}>
                    {farmer.fullName}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          
          {/* Crop Selection */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name:</label>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
              disabled={!selectedFarmerId}
            >
              <option value="">Select Crop</option>
              {availableCrops && availableCrops.length > 0 ? (
                availableCrops.map(crop => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))
              ) : (
                <option value="" disabled>No crops available</option>
              )}
            </select>
          </div>
          
          {/* Quantity */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg):</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          {/* Negotiation Price */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Negotiation Price (₹/kg):</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={negotiationPrice}
              onChange={(e) => setNegotiationPrice(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          {/* Negotiated Date */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Negotiated Date:</label>
            <input
              type="date"
              value={negotiatedDate}
              onChange={(e) => setNegotiatedDate(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          {/* Delivery Date */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date:</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          
          {/* Farmer Rating */}
          <div className="form-group lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Rating:</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFarmerRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  <span className={star <= farmerRating ? "text-yellow-500" : "text-gray-300"}>★</span>
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{farmerRating} of 5</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="form-group lg:col-span-3 flex gap-2 justify-end mt-4">
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              {editMode ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search by farmer or crop..."
          className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-2 focus:ring-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Catalog Items Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (kg)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negotiation Price (₹/kg)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negotiated Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading catalog items...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No catalog items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.farmerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cropName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.negotiationPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.negotiatedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.deliveryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= item.farmerRating ? "text-yellow-500" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-emerald-600 hover:text-emerald-900 mr-2"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};