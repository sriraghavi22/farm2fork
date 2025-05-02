import React, { useState, useEffect } from 'react';
import { Warehouse, Plus } from 'lucide-react';
import type { CatalogItem, WarehouseItem } from '../types';
import api from '../api';

interface WarehouseData {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

interface StorageProps {
  catalogItems: CatalogItem[];
  warehouseItems: WarehouseItem[];
  setWarehouseItems: React.Dispatch<React.SetStateAction<WarehouseItem[]>>;
}

export function Storage({ catalogItems: initialCatalogItems, warehouseItems, setWarehouseItems }: StorageProps) {
  console.log('Component rendered with props:', { initialCatalogItems, warehouseItems });

  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(initialCatalogItems || []);
  const [isAddingWarehouse, setIsAddingWarehouse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  // Flag to track if we've already fetched catalog items
  const [hasFetchedCatalog, setHasFetchedCatalog] = useState(false);

  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    location: '',
    capacity: 0,
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    }
  });

  const [newWarehouseItem, setNewWarehouseItem] = useState({
    warehouseId: '',
    productId: '',
    bestBefore: '',
    packaging: '',
    quantity: 0,
    batchNumber: ''
  });

  // Initial data fetching
  useEffect(() => {
    fetchWarehouses();
    fetchWarehouseItems();
    
    // Only fetch catalog items if initialCatalogItems is empty
    if (!initialCatalogItems || initialCatalogItems.length === 0) {
      console.log('Initial catalog items not provided, fetching from API');
      fetchCatalogItems();
    } else {
      console.log('Using provided catalog items:', initialCatalogItems);
      setCatalogItems(initialCatalogItems);
    }
  }, []); // Empty dependency array to run only once on mount

  const fetchWarehouses = async () => {
    try {
      console.log('Fetching warehouses...');
      setLoading(true);
      const response = await api.get('http://localhost:5000/api/warehouses');
      console.log('Warehouses fetched:', response.data);
      setWarehouses(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setError('Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouseItems = async () => {
    try {
      console.log('Fetching warehouse items...');
      console.log(warehouseItems)
      const response = await api.get('http://localhost:5000/api/warehouse-items');
      console.log('Warehouse items fetched:', response.data);
      setWarehouseItems(response.data.data || []);
    } catch (err) {
      console.error('Error fetching warehouse items:', err);
      setError('Failed to fetch warehouse items');
    }
  };

  const fetchCatalogItems = async () => {
    if (catalogLoading) return; // Prevent multiple simultaneous requests
    
    try {
      console.log('Fetching catalog items...');
      setCatalogLoading(true);
      const response = await api.get('http://localhost:5000/api/distributor/catalog/items');
      console.log('Catalog items fetched:', response.data);
      
      // FIX: Extract data correctly from the response
      // Accessing the data array directly if it exists, otherwise use the full response
      const items = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
          
      // Extra validation before setting state
      if (items.length > 0) {
        console.log('Setting catalog items:', items);
        setCatalogItems(items);
      } else {
        // Check if the response structure is different than expected
        console.warn('Unexpected response structure:', response.data);
        // Try to handle different response formats
        if (response.data && typeof response.data === 'object') {
          // If single item response
          const singleItem = Object.keys(response.data).includes('cropName') ? [response.data] : [];
          if (singleItem.length > 0) {
            console.log('Setting single catalog item:', singleItem);
            setCatalogItems(singleItem);
          }
        }
      }
      
      setHasFetchedCatalog(true);
    } catch (err) {
      console.error('Error fetching catalog items:', err);
      setError('Failed to fetch catalog items');
      setCatalogItems([]);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleWarehouseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewWarehouse(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewWarehouse(prev => ({
        ...prev,
        [name]: name === 'capacity' ? parseInt(value) : value
      }));
    }
  };

  const handleAddWarehouse = async () => {
    try {
      setLoading(true);
      console.log('Adding warehouse:', newWarehouse);
      await api.post('http://localhost:5000/api/warehouses', newWarehouse);
      console.log('Warehouse added successfully');
      await fetchWarehouses();
      setIsAddingWarehouse(false);
      setNewWarehouse({
        name: '',
        location: '',
        capacity: 0,
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          pincode: ''
        }
      });
    } catch (err) {
      console.error('Error adding warehouse:', err);
      setError('Failed to add warehouse');
    } finally {
      setLoading(false);
    }
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewWarehouseItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = async () => {
    try {
      console.log('Adding product to warehouse:', newWarehouseItem);
      const response = await api.post('http://localhost:5000/api/warehouse-items', newWarehouseItem);
      console.log('Product added response:', response.data);
      setWarehouseItems(prev => [...prev, response.data.data]);
      setNewWarehouseItem({
        warehouseId: '',
        productId: '',
        bestBefore: '',
        packaging: '',
        quantity: 0,
        batchNumber: ''
      });
    } catch (err) {
      console.error('Error adding product to warehouse:', err);
      setError('Failed to add product to warehouse');
    }
  };

  // Separate useEffect for warehouse selection
  useEffect(() => {
    // Only fetch catalog items when a warehouse is selected and we don't have items yet
    if (newWarehouseItem.warehouseId && catalogItems.length === 0 && !catalogLoading && !hasFetchedCatalog) {
      console.log('Warehouse selected but no catalog items, fetching...');
      fetchCatalogItems();
    }
  }, [newWarehouseItem.warehouseId]);

  // Safeguard to ensure catalogItems is always an array
  const safeCatalogItems = Array.isArray(catalogItems) ? catalogItems : [];
  console.log('Rendering component with catalogItems:', safeCatalogItems);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-emerald-800">Storage Information</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Warehouse className="h-5 w-5" />
            <span className="font-medium">Total Warehouses: {warehouses.length}</span>
          </div>
          <button
            onClick={() => setIsAddingWarehouse(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Add Warehouse
          </button>
        </div>
      </div>

      {isAddingWarehouse && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4">Add New Warehouse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              value={newWarehouse.name}
              onChange={handleWarehouseInputChange}
              placeholder="Warehouse Name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <input
              type="text"
              name="location"
              value={newWarehouse.location}
              onChange={handleWarehouseInputChange}
              placeholder="Location"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <input
              type="number"
              name="capacity"
              value={newWarehouse.capacity}
              onChange={handleWarehouseInputChange}
              placeholder="Capacity"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <input
              type="text"
              name="address.street"
              value={newWarehouse.address.street}
              onChange={handleWarehouseInputChange}
              placeholder="Street Address"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <input
              type="text"
              name="address.city"
              value={newWarehouse.address.city}
              onChange={handleWarehouseInputChange}
              placeholder="City"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <input
              type="text"
              name="address.state"
              value={newWarehouse.address.state}
              onChange={handleWarehouseInputChange}
              placeholder="State"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <input
              type="text"
              name="address.country"
              value={newWarehouse.address.country}
              onChange={handleWarehouseInputChange}
              placeholder="Country"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <input
              type="text"
              name="address.pincode"
              value={newWarehouse.address.pincode}
              onChange={handleWarehouseInputChange}
              placeholder="Pincode"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddWarehouse}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Warehouse
            </button>
            <button
              onClick={() => setIsAddingWarehouse(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-emerald-700 mb-3">Add Product to Warehouse:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="warehouseId" className="block text-gray-700 text-sm font-bold mb-2">
              Warehouse:
            </label>
            <select
              id="warehouseId"
              name="warehouseId"
              value={newWarehouseItem.warehouseId}
              onChange={handleItemInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name} ({warehouse.location})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="productId" className="block text-gray-700 text-sm font-bold mb-2">
              Product:
            </label>
            {catalogLoading ? (
              <div className="flex items-center justify-center py-2">
                <span className="text-emerald-600">Loading catalog items...</span>
              </div>
            ) : (
              <select
                id="productId"
                name="productId"
                value={newWarehouseItem.productId}
                onChange={handleItemInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={!newWarehouseItem.warehouseId}
              >
                <option value="">Select Product</option>
                {safeCatalogItems.length > 0 ? (
                  safeCatalogItems.map(item => (
                    <option key={item._id || item.cropName} value={item.cropName}>
                      {item.cropName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No products available</option>
                )}
              </select>
            )}
            {newWarehouseItem.warehouseId && safeCatalogItems.length === 0 && !catalogLoading && (
              <button 
                onClick={fetchCatalogItems}
                className="mt-2 text-emerald-600 text-sm hover:underline flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh product list
              </button>
            )}
          </div>
          <div>
            <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">
              Quantity:
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={newWarehouseItem.quantity}
              onChange={handleItemInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label htmlFor="bestBefore" className="block text-gray-700 text-sm font-bold mb-2">
              Best Before Date:
            </label>
            <input
              type="date"
              id="bestBefore"
              name="bestBefore"
              value={newWarehouseItem.bestBefore}
              onChange={handleItemInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label htmlFor="batchNumber" className="block text-gray-700 text-sm font-bold mb-2">
              Batch Number:
            </label>
            <input
              type="text"
              id="batchNumber"
              name="batchNumber"
              value={newWarehouseItem.batchNumber}
              onChange={handleItemInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label htmlFor="packaging" className="block text-gray-700 text-sm font-bold mb-2">
              Packaging:
            </label>
            <input
              type="text"
              id="packaging"
              name="packaging"
              value={newWarehouseItem.packaging}
              onChange={handleItemInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleAddProduct}
            disabled={!newWarehouseItem.warehouseId || !newWarehouseItem.productId}
            className={`${
              !newWarehouseItem.warehouseId || !newWarehouseItem.productId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
          >
            Add Product
          </button>
          {(!newWarehouseItem.warehouseId || !newWarehouseItem.productId) && (
            <p className="text-sm text-amber-600 mt-2">
              Please select both warehouse and product to continue
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Only render this section if safeCatalogItems has items */}
      {safeCatalogItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-emerald-700 mb-3">Available Catalog Items:</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              {safeCatalogItems.map((item, index) => (
                <div key={index} className="border rounded-md p-3 hover:bg-emerald-50 cursor-pointer" 
                     onClick={() => setNewWarehouseItem(prev => ({ ...prev, productId: item.cropName }))}>
                  <h4 className="font-medium text-emerald-700">{item.cropName}</h4>
                  {item.farmerName && <p className="text-sm text-gray-600">Farmer: {item.farmerName}</p>}
                  {item.quantity && <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>}
                  {item.negotiationPrice && <p className="text-sm text-gray-600">Price: ₹{item.negotiationPrice}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-emerald-100">
              <th className="border border-gray-200 px-4 py-2 text-left">Warehouse Name</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Location</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Product Name</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Quantity</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Batch Number</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Best Before Date</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Packaging</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(warehouseItems) && warehouseItems.length > 0 ? (
              warehouseItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{item.warehouseId?.name || 'N/A'}</td>
                  <td className="border border-gray-200 px-4 py-2">{item.warehouseId?.location || 'N/A'}</td>
                  <td className="border border-gray-200 px-4 py-2">{item.productId}</td>
                  <td className="border border-gray-200 px-4 py-2">{item.quantity}</td>
                  <td className="border border-gray-200 px-4 py-2">{item.batchNumber || 'N/A'}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    {item.bestBefore ? new Date(item.bestBefore).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">{item.packaging || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No warehouse items available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-emerald-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}