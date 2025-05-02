import React, { useEffect, useState } from 'react';
import { Store, Search, MapPin, Eye, Receipt } from 'lucide-react';
import { BrokerCard } from './components/BrokerCard';
import { ShopProfile } from './components/ShopProfile';
import { PurchasesSummary } from './components/PurchasesSummary';
import { ProductList } from './components/ProductList';
import api from './api';
import { Link } from 'react-router-dom';
import { Distributor, Shop, CatalogItem, Purchase } from './types';

function ShopkeeperDashboard() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [shop, setShop] = useState<Shop | null>(null); // Dynamic shop data
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showPurchases, setShowPurchases] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

  // Fetch shop data, distributors, and purchases
  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopkeeperId = localStorage.getItem('userId') || '67c1525e352f563f2d6075a7'; // Fallback ID

        // Fetch shop data
        const shopResponse = await api.get(`http://localhost:5000/api/shopkeeper/${shopkeeperId}`);
        const shopData = shopResponse.data;
        setShop({
          id: shopData._id,
          name: shopData.shopName,
          ownerName: shopData.fullName,
          phoneNumber: shopData.phoneNumber,
          location: shopData.businessAddress,
          businessType: "General Store", // Assuming this as static since not in your model
          registrationNumber: "REG123456", // Assuming this as static since not in your model
        });

        // Fetch distributors
        const distributorsResponse = await api.get("http://localhost:5000/api/shopkeeper/distributors");
        setDistributors(distributorsResponse.data);

        // Fetch shopkeeper's inventory (purchases)
        const inventoryResponse = await api.get(`http://localhost:5000/api/shopkeeper/${shopkeeperId}/inventory`);
        console.log("inventory response", inventoryResponse.data);
        const inventoryData = inventoryResponse.data || [];
        console.log("inventory data", inventoryData);
        // Transform inventory into Purchase type
        const confirmedPurchases = inventoryData
          .filter((item: any) => item.status === "confirmed")
          .map((item: any) => ({
            id: item._id,
            product: {
              name: item.productName,
              unit: item.unit,
              organic: false, // Adjust if you have this data
            },
            quantity: item.quantity,
            totalCost: item.price,
            brokerName: item.distributorName,
            date: item.requestDate,
            distributorId: item.distributorId,
          }));

        setPurchases(confirmedPurchases);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewProducts = async (distributor: Distributor) => {
    try {
      setLoading(true);
      const response = await api.get(`http://localhost:5000/api/catalog/distributor/${distributor._id}`);
      const productsData = Array.isArray(response.data) ? response.data : 
                         (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      const filteredProducts = productsData.filter((product: CatalogItem) => 
        product.distributorId === distributor._id
      );
      
      setCatalogItems(filteredProducts);
      setSelectedDistributor(distributor);
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const locations = Array.from(new Set(distributors.map(dist => dist.businessAddress)));

  const filteredDistributors = React.useMemo(() => {
    let filtered = distributors;
    if (selectedLocation) {
      filtered = filtered.filter((dist) => dist.businessAddress === selectedLocation);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((dist) =>
        dist.businessName.toLowerCase().includes(query) || dist.fullName.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [searchQuery, selectedLocation, distributors]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Shopkeeper Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPurchases(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <Receipt className="h-5 w-5" />
                View Purchases
              </button>
              {/* <Link
                to="/consumer"
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <Eye className="h-5 w-5" />
                Consumer Page
              </Link> */}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        {shop ? <ShopProfile shop={shop} /> : <div>Loading shop data...</div>}

        {selectedDistributor ? (
          <ProductList
            shopkeeperId={localStorage.getItem('userId') || '67c1525e352f563f2d6075a7'}
            distributorName={selectedDistributor.businessName}
            products={catalogItems}
            onBack={() => setSelectedDistributor(null)}
          />
        ) : (
          <>
            <div className="mb-6 space-y-4 md:space-y-0 md:flex md:gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search for distributors (e.g., name)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative max-w-xs">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Available Brokers</h2>
              <span className="text-sm text-gray-600">
                Showing {filteredDistributors.length} {filteredDistributors.length === 1 ? 'broker' : 'brokers'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDistributors.map((distributor) => (
                <BrokerCard 
                  key={distributor._id} 
                  distributor={distributor}
                  onViewProducts={() => handleViewProducts(distributor)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {showPurchases && (
        <PurchasesSummary
          purchases={purchases}
          onClose={() => setShowPurchases(false)}
        />
      )}
    </div>
  );
}

export default ShopkeeperDashboard;