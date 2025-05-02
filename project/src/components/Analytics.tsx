import React, { useState, useEffect } from 'react';
import api from '../api';
import { Farmers } from './Farmers';
import { Shopkeepers } from './Shopkeepers';
import { Catalog } from './Catalog';
import { Storage } from './Storage';
import { Truck, BarChart2 } from 'lucide-react';
import type { Farmer, CatalogItem, WarehouseItem } from '../types';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Total Suppliers</h3>
        <p className="mt-2 text-3xl font-bold text-emerald-600">{totalFarmers}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Catalog Value</h3>
        <p className="mt-2 text-3xl font-bold text-emerald-600">₹{totalCatalogValue.toLocaleString()}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Total Stock</h3>
        <p className="mt-2 text-3xl font-bold text-emerald-600">{totalStock} units</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Active Deals</h3>
        <p className="mt-2 text-3xl font-bold text-emerald-600">{activeDeals}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Avg. Farmer Rating</h3>
        <p className="mt-2 text-3xl font-bold text-emerald-600">{avgFarmerRating}/5</p>
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
          api.get("http://localhost:5000/api/distributor/catalog"),
          api.get("http://localhost:5000/api/distributor/warehouse")
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