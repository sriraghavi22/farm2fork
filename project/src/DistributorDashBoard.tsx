import React, { useState, useEffect } from 'react';
import api from './api';
import { Farmers } from './components/Farmers';
import { Shopkeepers } from './components/Shopkeepers';
import { Catalog } from './components/Catalog';
import { Storage } from './components/Storage';
import { Truck, BarChart2, Users, Package, ShoppingCart, Star } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import type { Farmer, CatalogItem, WarehouseItem } from './types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Analytics: React.FC<{
  farmers: Farmer[];
  catalogItems: CatalogItem[];
  warehouseItems: WarehouseItem[];
}> = ({ farmers, catalogItems, warehouseItems }) => {
  // Calculate analytics data
  const totalFarmers = farmers.length;
  const totalCatalogValue = catalogItems.reduce(
    (sum, item) => sum + (item.negotiationPrice * item.quantity),
    0
  );
  const totalStock = warehouseItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const activeDeals = catalogItems.filter(item => 
    item.status === 'pending' || item.status === 'confirmed'
  ).length;
  const avgFarmerRating = farmers.length > 0 
    ? (farmers.reduce((sum, farmer) => sum + (farmer.rating || 0), 0) / farmers.length).toFixed(1)
    : '0.0';

  // Data for Bar Chart (Catalog Value by Crop)
  const cropValues = catalogItems.reduce((acc, item) => {
    acc[item.cropName] = (acc[item.cropName] || 0) + (item.negotiationPrice * item.quantity);
    return acc;
  }, {} as Record<string, number>);
  
  const barData = {
    labels: Object.keys(cropValues),
    datasets: [{
      label: 'Value (₹)',
      data: Object.values(cropValues),
      backgroundColor: 'rgba(16, 185, 129, 0.6)', // emerald-500 with opacity
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
    }]
  };

  // Data for Pie Chart (Status Distribution)
  const statusDistribution = catalogItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(statusDistribution),
    datasets: [{
      data: Object.values(statusDistribution),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',  // emerald-500
        'rgba(5, 150, 105, 0.8)',   // emerald-600
        'rgba(4, 120, 87, 0.8)',    // emerald-700
        'rgba(6, 78, 59, 0.8)',     // emerald-800
      ],
    }]
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-xl shadow-lg text-white">
          <Users className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-semibold">Total Suppliers</h3>
          <p className="mt-2 text-3xl font-bold">{totalFarmers}</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-xl shadow-lg text-white">
          <ShoppingCart className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-semibold">Catalog Value</h3>
          <p className="mt-2 text-3xl font-bold">₹{totalCatalogValue.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-xl shadow-lg text-white">
          <Package className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-semibold">Total Stock</h3>
          <p className="mt-2 text-3xl font-bold">{totalStock} units</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-xl shadow-lg text-white">
          <BarChart2 className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-semibold">Active Deals</h3>
          <p className="mt-2 text-3xl font-bold">{activeDeals}</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-xl shadow-lg text-white">
          <Star className="h-8 w-8 mb-2" />
          <h3 className="text-lg font-semibold">Avg. Rating</h3>
          <p className="mt-2 text-3xl font-bold">{avgFarmerRating}/5</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-emerald-700 mb-4">Catalog Value by Crop</h3>
          <Bar 
            data={barData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Crop Values' }
              }
            }}
          />
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-emerald-700 mb-4">Deal Status Distribution</h3>
          <Pie 
            data={pieData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Deal Status' }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

function DistributorDashBoard() {
  const [activeTab, setActiveTab] = useState<'farmers' | 'shopkeepers' | 'catalog' | 'storage' | 'analytics'>('farmers');
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const distributorId = localStorage.getItem('userId') || '';
  const distributorName = localStorage.getItem('name') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [farmersRes, catalogRes, warehouseRes] = await Promise.all([
          api.get("http://localhost:5000/api/distributor/farmers"),
          api.get("http://localhost:5000/api/distributor/catalogs"),
          api.get("http://localhost:5000/api/distributor/warehouses")
        ]);
        
        setFarmers(farmersRes.data);
        setCatalogItems(catalogRes.data);
        setWarehouseItems(warehouseRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Rest of the DistributorDashBoard component remains the same
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Distribution Hub</h1>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'farmers'
                    ? 'bg-white text-emerald-800 shadow-md transform scale-105'
                    : 'bg-emerald-700 text-white hover:bg-emerald-600'
                }`}
                onClick={() => setActiveTab('farmers')}
              >
                Suppliers
              </button>
              <button
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'shopkeepers'
                    ? 'bg-white text-emerald-800 shadow-md transform scale-105'
                    : 'bg-emerald-700 text-white hover:bg-emerald-600'
                }`}
                onClick={() => setActiveTab('shopkeepers')}
              >
                Retailers
              </button>
              <button
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'catalog'
                    ? 'bg-white text-emerald-800 shadow-md transform scale-105'
                    : 'bg-emerald-700 text-white hover:bg-emerald-600'
                }`}
                onClick={() => setActiveTab('catalog')}
              >
                Catalog
              </button>
              <button
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'storage'
                    ? 'bg-white text-emerald-800 shadow-md transform scale-105'
                    : 'bg-emerald-700 text-white hover:bg-emerald-600'
                }`}
                onClick={() => setActiveTab('storage')}
              >
                Storage
              </button>
              <button
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-white text-emerald-800 shadow-md transform scale-105'
                    : 'bg-emerald-700 text-white hover:bg-emerald-600'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Analytics
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <p className="text-center text-gray-500">Loading data...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : activeTab === 'farmers' ? (
          <Farmers farmers={farmers} />
        ) : activeTab === 'shopkeepers' ? (
          <Shopkeepers />
        ) : activeTab === 'catalog' ? (
          <Catalog 
            farmers={farmers} 
            catalogItems={catalogItems} 
            setCatalogItems={setCatalogItems} 
            distributorId={distributorId} 
            distributorName={distributorName} 
          />
        ) : activeTab === 'storage' ? (
          <Storage 
            catalogItems={catalogItems} 
            warehouseItems={warehouseItems} 
            setWarehouseItems={setWarehouseItems} 
          />
        ) : (
          <Analytics 
            farmers={farmers} 
            catalogItems={catalogItems} 
            warehouseItems={warehouseItems} 
          />
        )}
      </main>
    </div>
  );
}

export default DistributorDashBoard;