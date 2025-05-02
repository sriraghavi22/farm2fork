import React, { useState, useEffect } from "react";
import { Send, Trash2, RefreshCw } from "lucide-react";
import api from "../api";
import { format } from "date-fns";

interface CropData {
  _id?: string;
  cropType: string;
  fertilizersUsed: string;
  quantity: number;
  costPerQuintal: number;
  startDate: string;
  harvestDate: string;
}

const CropDetails: React.FC = () => {
  const [cropData, setCropData] = useState<CropData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<CropData>({
    cropType: "",
    fertilizersUsed: "",
    quantity: 0,
    costPerQuintal: 0,
    startDate: "",
    harvestDate: ""
  });

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Fetch crops from API
  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await api.get("http://localhost:5000/api/farmer/crops", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.status === 200) {
        setCropData(response.data.crops);
      }
    } catch (error: any) {
      console.error("Failed to fetch crops:", error);
      setMessage("Failed to load crops from database");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCrops();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Check if all required fields are provided
    if (
      !formData.cropType || 
      !formData.fertilizersUsed || 
      formData.quantity <= 0 || 
      formData.costPerQuintal <= 0 ||
      !formData.startDate ||
      !formData.harvestDate
    ) {
      setMessage("⚠️ Please fill all fields correctly.");
      setMessageType("error");
      return;
    }

    try {
      // Send data to API - ensure dates are valid ISO strings
      const submissionData = {
        ...formData,
        // Ensure dates are in ISO format by creating a new Date and converting to ISO string
        startDate: new Date(formData.startDate).toISOString(),
        harvestDate: new Date(formData.harvestDate).toISOString()
      };

      const response = await api.post("http://localhost:5000/api/farmer/add-crop", submissionData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 201) {
        setMessage("✅ Crop added successfully!");
        setMessageType("success");
        
        // Reset form
        setFormData({
          cropType: "",
          fertilizersUsed: "",
          quantity: 0,
          costPerQuintal: 0,
          startDate: "",
          harvestDate: ""
        });
        
        // Refresh crop list
        fetchCrops();
      }
    } catch (error: any) {
      console.error("❌ API Error:", error);
      setMessage(error.response?.data?.message || "Failed to add crop.");
      setMessageType("error");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      // First handle if the date is already an ISO string
      if (typeof dateString === 'string' && dateString.includes('T')) {
        return format(new Date(dateString), "dd/MM/yyyy");
      }
      
      // Check if it's a valid date string and parse accordingly
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, "dd/MM/yyyy");
      }
      
      return "Invalid date";
    } catch (e) {
      console.error("Date formatting error:", e, "for date:", dateString);
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <p className={`text-center font-semibold ${
          messageType === "success" ? "text-green-600" : "text-red-600"
        }`}>
          {message}
        </p>
      )}

      {/* Form to add crop details */}
      <form onSubmit={handleSubmit} className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Add Crop Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">What kind of crop?</label>
            <input
              type="text"
              value={formData.cropType}
              onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fertilizers used</label>
            <input
              type="text"
              value={formData.fertilizersUsed}
              onChange={(e) => setFormData({ ...formData, fertilizersUsed: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity (in quintals)</label>
            <input
              type="number"
              value={formData.quantity || ""}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost per quintal (₹)</label>
            <input
              type="number"
              value={formData.costPerQuintal || ""}
              onChange={(e) => setFormData({ ...formData, costPerQuintal: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Harvest Date</label>
            <input
              type="date"
              value={formData.harvestDate}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          Upload Data
        </button>
      </form>

      {/* Display Crops from Database */}
      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-green-800">Your Crops</h3>
          <button 
            onClick={fetchCrops}
            className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-center py-4 text-gray-600">Loading crops...</p>
        ) : cropData.length === 0 ? (
          <p className="text-center py-4 text-gray-600">No crops added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fertilizers</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Quintal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harvest Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cropData.map((crop) => (
                  <tr key={crop._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{crop.cropType}</td>
                    <td className="px-4 py-3">{crop.fertilizersUsed}</td>
                    <td className="px-4 py-3">{crop.quantity} quintals</td>
                    <td className="px-4 py-3">₹{crop.costPerQuintal}</td>
                    <td className="px-4 py-3">{formatDate(crop.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(crop.harvestDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropDetails;