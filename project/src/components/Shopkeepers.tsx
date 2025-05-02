import React, { useState, useEffect } from 'react';
import { Search, MapPin, Package, Check, Phone, User, Store, TrendingUp } from 'lucide-react';
import axios from 'axios';

// Define types based on your Shopkeeper schema and traceability data
interface InventoryItem {
  _id: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'delivered';
  requestDate: string;
  distributorId: string;
  distributorName: string;
  catalogItemId: string;
  requestedDeliveryDate: string;
}

interface Shopkeeper {
  _id: string;
  fullName: string;
  shopName: string;
  phoneNumber: string;
  businessAddress: string;
  inventory: InventoryItem[];
  activeOrders: number;
}

interface TraceabilityData {
  shopkeeper: {
    name: string;
    address: string;
    productName: string;
    quantity: number;
    confirmedDate: string;
    transactionId: string;
  };
  farmer?: {
    name: string;
    cropType: string;
    quantity: number;
    startDate: string;
    harvestDate: string;
    fertilizersUsed: string;
  };
  distributor?: {
    name: string;
    negotiationPrice: number;
    deliveryDate: string;
  };
  warehouse?: {
    productId: string;
    quantity: number;
    bestBefore: string;
    batchNumber: string;
  };
}

export function Shopkeepers() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTraceability, setSelectedTraceability] = useState<{ data: TraceabilityData; qrCode: string } | null>(null);

  useEffect(() => {
    const fetchShopkeepers = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Shopkeeper[]>('http://localhost:5000/api/shopkeeper');
        setShopkeepers(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch shopkeepers data');
        console.error('Error fetching shopkeepers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopkeepers();
  }, []);

  const filteredShopkeepers = shopkeepers.filter((shopkeeper: Shopkeeper) => {
    const matchesSearch = shopkeeper.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shopkeeper.inventory.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = shopkeeper.businessAddress.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const handleAcceptRequest = async (shopkeeperId: string, requestId: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/shopkeeper/${shopkeeperId}/inventory/${requestId}`,
        { status: 'confirmed' }
      );

      const { shopkeeper, traceabilityData, qrCodeImage } = response.data;

      // Update shopkeepers state
      setShopkeepers((prevShopkeepers: Shopkeeper[]) =>
        prevShopkeepers.map((s: Shopkeeper) =>
          s._id === shopkeeperId ? shopkeeper : s
        )
      );

      // Set traceability data and QR code for display
      if (traceabilityData && qrCodeImage) {
        setSelectedTraceability({ data: traceabilityData, qrCode: qrCodeImage });
      }
    } catch (err) {
      console.error('Error accepting order:', err);
    }
  };

  const getTotalOrders = (shopkeeper: Shopkeeper): number => {
    return shopkeeper.inventory.filter((item: InventoryItem) => item.status === 'confirmed').length;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-emerald-800">Retail Network</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Store className="h-5 w-5" />
            <span className="font-medium">Active Retailers: {filteredShopkeepers.length}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">
              Total Orders: {shopkeepers.reduce((acc: number, shop: Shopkeeper) => acc + getTotalOrders(shop), 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search retailers or products..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredShopkeepers.map((shopkeeper: Shopkeeper) => (
          <div key={shopkeeper._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-emerald-800">{shopkeeper.shopName}</h3>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getTotalOrders(shopkeeper)} Orders
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-1 text-emerald-600" />
                  <span className="text-sm">{shopkeeper.fullName}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-1 text-emerald-600" />
                  <span className="text-sm">{shopkeeper.phoneNumber}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                <span className="text-sm">{shopkeeper.businessAddress}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center text-emerald-700">
                <Package className="h-4 w-4 mr-2" />
                Order Requirements
              </h4>
              <div className="space-y-3">
                {shopkeeper.inventory.map((item: InventoryItem) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-emerald-50 p-4 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-emerald-800">{item.productName}</span>
                        <span className="text-emerald-700 font-semibold">₹{item.price}/kg</span>
                      </div>
                      <span className="text-sm text-emerald-600">
                        Required: {item.quantity} {item.unit}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAcceptRequest(shopkeeper._id, item._id)}
                      disabled={item.status === 'confirmed'}
                      className={`ml-4 px-4 py-2 rounded-lg flex items-center gap-2 ${
                        item.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {item.status === 'confirmed' ? (
                        <>
                          <Check className="h-4 w-4" />
                          Confirmed
                        </>
                      ) : (
                        'Confirm Order'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable Traceability Modal */}
      {selectedTraceability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-emerald-800 mb-4 sticky top-0 bg-white z-10">Order Traceability</h3>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h4 className="font-semibold text-emerald-700 mb-2">Shopkeeper Details</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedTraceability.data.shopkeeper.name}</p>
                  <p><span className="font-medium">Address:</span> {selectedTraceability.data.shopkeeper.address}</p>
                  <p><span className="font-medium">Product:</span> {selectedTraceability.data.shopkeeper.productName}</p>
                  <p><span className="font-medium">Quantity:</span> {selectedTraceability.data.shopkeeper.quantity}</p>
                  <p><span className="font-medium">Confirmed:</span> {new Date(selectedTraceability.data.shopkeeper.confirmedDate).toLocaleString()}</p>
                  <p><span className="font-medium">Transaction ID:</span> {selectedTraceability.data.shopkeeper.transactionId}</p>
                </div>
              </div>

              {selectedTraceability.data.farmer && (
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-emerald-700 mb-2">Farmer Details</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedTraceability.data.farmer.name}</p>
                    <p><span className="font-medium">Crop:</span> {selectedTraceability.data.farmer.cropType}</p>
                    <p><span className="font-medium">Quantity:</span> {selectedTraceability.data.farmer.quantity}</p>
                    <p><span className="font-medium">Start Date:</span> {selectedTraceability.data.farmer.startDate}</p>
                    <p><span className="font-medium">Harvest Date:</span> {selectedTraceability.data.farmer.harvestDate}</p>
                    <p><span className="font-medium">Fertilizers:</span> {selectedTraceability.data.farmer.fertilizersUsed}</p>
                  </div>
                </div>
              )}

              {selectedTraceability.data.distributor && (
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-emerald-700 mb-2">Distributor Details</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedTraceability.data.distributor.name}</p>
                    <p><span className="font-medium">Price:</span> ₹{selectedTraceability.data.distributor.negotiationPrice}</p>
                    <p><span className="font-medium">Delivery Date:</span> {new Date(selectedTraceability.data.distributor.deliveryDate).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {selectedTraceability.data.warehouse && (
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-emerald-700 mb-2">Warehouse Details</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Product ID:</span> {selectedTraceability.data.warehouse.productId}</p>
                    <p><span className="font-medium">Quantity:</span> {selectedTraceability.data.warehouse.quantity}</p>
                    <p><span className="font-medium">Best Before:</span> {new Date(selectedTraceability.data.warehouse.bestBefore).toLocaleString()}</p>
                    <p><span className="font-medium">Batch Number:</span> {selectedTraceability.data.warehouse.batchNumber}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-center py-4">
                <img src={selectedTraceability.qrCode} alt="Traceability QR Code" className="w-32 h-32" />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white pt-4">
              <button
                onClick={() => setSelectedTraceability(null)}
                className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}