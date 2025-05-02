import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface InventoryItem {
  _id: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  status: string;
  ipfsHash?: string;
  distributorName?: string;
  requestDate?: string;
}

interface Shopkeeper {
  _id: string;
  fullName: string;
  shopName: string;
  phoneNumber: string;
  businessAddress: string;
  inventory: InventoryItem[];
}

interface TraceabilityData {
  farmer: {
    name: string;
    cropType: string;
    quantity: number;
    startDate: string;
    harvestDate: string;
    fertilizersUsed: string;
  };
  distributor: {
    name: string;
    negotiationPrice: number;
    deliveryDate: string;
    warehouse: {
      productId: string;
      quantity: string;
      bestBefore: string;
      batchNumber: string;
    } | null;
  };
  shopkeeper: {
    name: string;
    fullName: string;
    address: string;
    productName: string;
    quantity: number;
    price: number;
    confirmedDate: string;
  };
}

const ConsumerPage: React.FC = () => {
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [traceabilityData, setTraceabilityData] = useState<Record<string, { data: TraceabilityData; qrCodeImage: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsumerData = async () => {
      try {
        setLoading(true);
        // Fetch all shopkeepers
        const shopkeeperResponse = await axios.get<Shopkeeper[]>('http://localhost:5000/api/shopkeeper');
        const allShopkeepers = shopkeeperResponse.data;
        console.log('All Shopkeepers:', allShopkeepers);

        // Filter for confirmed orders with ipfsHash
        const confirmedOrders = allShopkeepers.flatMap(shopkeeper =>
          shopkeeper.inventory
            .filter(item => item.status === 'confirmed' && item.ipfsHash)
            .map(item => ({ shopkeeperId: shopkeeper._id, requestId: item._id, item }))
        );
        console.log('Confirmed Orders:', confirmedOrders);

        if (confirmedOrders.length === 0) {
          console.warn('No confirmed orders with ipfsHash found');
          setShopkeepers(allShopkeepers);
          return;
        }

        // Fetch traceability data
        const tracePromises = confirmedOrders.map(({ shopkeeperId, requestId }) =>
          axios.get(`http://localhost:5000/api/traceability/${shopkeeperId}/${requestId}`)
            .catch(err => {
              console.error(`Error fetching traceability for ${shopkeeperId}/${requestId}:`, err.response?.data || err.message);
              return null; // Return null for failed requests
            })
        );
        const traceResponses = await Promise.all(tracePromises);

        const traceMap = traceResponses.reduce((acc: Record<string, { data: TraceabilityData; qrCodeImage: string }>, response, index) => {
          if (!response) return acc; // Skip failed requests
          const { shopkeeperId, requestId } = confirmedOrders[index];
          acc[`${shopkeeperId}-${requestId}`] = {
            data: response.data.data,
            qrCodeImage: response.data.qrCodeImage
          };
          return acc;
        }, {});
        console.log('Traceability Data:', traceMap);

        setShopkeepers(allShopkeepers);
        setTraceabilityData(traceMap);
      } catch (err) {
        setError('Failed to fetch consumer data: ');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsumerData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const hasConfirmedOrders = shopkeepers.some(shopkeeper =>
    shopkeeper.inventory.some(item => item.status === 'confirmed' && item.ipfsHash)
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6">Consumer Traceability</h1>
      {hasConfirmedOrders ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shopkeepers.map((shopkeeper: Shopkeeper) => (
            shopkeeper.inventory
              .filter((item: InventoryItem) => item.status === 'confirmed' && item.ipfsHash)
              .map((item: InventoryItem) => {
                const traceKey = `${shopkeeper._id}-${item._id}`;
                const trace = traceabilityData[traceKey];
                if (!trace) return null;

                return (
                  <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-emerald-700 mb-4">{item.productName} - Traceability</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-emerald-600">Farmer</h3>
                        <p><strong>Name:</strong> {trace.data.farmer.name}</p>
                        <p><strong>Crop:</strong> {trace.data.farmer.cropType}</p>
                        <p><strong>Quantity:</strong> {trace.data.farmer.quantity}</p>
                        <p><strong>Start Date:</strong> {new Date(trace.data.farmer.startDate).toLocaleDateString()}</p>
                        <p><strong>Harvest Date:</strong> {new Date(trace.data.farmer.harvestDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-emerald-600">Distributor</h3>
                        <p><strong>Name:</strong> {trace.data.distributor.name}</p>
                        <p><strong>Price:</strong> ₹{trace.data.distributor.negotiationPrice}</p>
                        <p><strong>Delivery Date:</strong> {new Date(trace.data.distributor.deliveryDate).toLocaleDateString()}</p>
                        {trace.data.distributor.warehouse && (
                          <div className="mt-2">
                            <p><strong>Warehouse:</strong></p>
                            <p>Product: {trace.data.distributor.warehouse.productId}</p>
                            <p>Quantity: {trace.data.distributor.warehouse.quantity}</p>
                            <p>Best Before: {new Date(trace.data.distributor.warehouse.bestBefore).toLocaleDateString()}</p>
                            <p>Batch: {trace.data.distributor.warehouse.batchNumber}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-emerald-600">Shopkeeper</h3>
                        <p><strong>Shop:</strong> {trace.data.shopkeeper.name}</p>
                        <p><strong>Owner:</strong> {trace.data.shopkeeper.fullName}</p>
                        <p><strong>Address:</strong> {trace.data.shopkeeper.address}</p>
                        <p><strong>Quantity:</strong> {trace.data.shopkeeper.quantity}</p>
                        <p><strong>Price:</strong> ₹{trace.data.shopkeeper.price}</p>
                        <p><strong>Confirmed:</strong> {new Date(trace.data.shopkeeper.confirmedDate).toLocaleString()}</p>
                      </div>
                    </div>
                    {trace.qrCodeImage && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium text-emerald-600 mb-2">Scan for Details</h3>
                        <img src={trace.qrCodeImage} alt="QR Code" className="w-32 h-32" />
                      </div>
                    )}
                  </div>
                );
              })
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No confirmed orders with traceability data available.</p>
      )}
    </div>
  );
};

export default ConsumerPage;