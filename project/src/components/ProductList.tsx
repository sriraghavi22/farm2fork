import React, { useState } from 'react';
import { ArrowLeft, Star, Trophy, Loader2 } from 'lucide-react';
import { CatalogItem } from '../types';
import api from '../api';

interface ProductListProps {
  shopkeeperId: string;
  distributorName?: string;
  products: CatalogItem[];
  onBack: () => void;
  onPurchaseSuccess?: () => void;
  // shopkeeperId: string;
}

interface PurchaseState {
  loading: boolean;
  productId: string | null;
  error: string | null;
}

export function ProductList({ 
  distributorName = '',
  products = [],
  onBack,
  onPurchaseSuccess,
  shopkeeperId
}: ProductListProps) {
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    loading: false,
    productId: null,
    error: null
  });

  const handlePurchase = async (productId: string) => {
    if (!productId) {
      setPurchaseState({
        loading: false,
        productId: null,
        error: 'Invalid product selected.'
      });
      return;
    }
    console.log(shopkeeperId)
    // Validate shopkeeperId before making the request
    if (!shopkeeperId) {

      setPurchaseState({
        loading: false,
        productId: null,
        error: 'Missing shopkeeper ID. Please log in again.'
      });
      return;
    }

    setPurchaseState({
      loading: true,
      productId,
      error: null
    });

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await api.post(
        'http://localhost:5000/api/shopkeeper/purchase', // Use relative path instead of full URL
        {
          shopkeeperId,
          productId,
          quantity: 1,
          requestedDeliveryDate: new Date(Date.now() + 7*24*60*60*1000)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPurchaseState({
          loading: false,
          productId: null,
          error: null
        });

        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
      } else {
        throw new Error(response.data.message || 'Purchase request failed');
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setPurchaseState({
        loading: false,
        productId: null,
        error: error instanceof Error ? error.message : 'Failed to complete purchase. Please try again.'
      });
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'bg-gray-50 text-gray-700';
    
    const gradeColors: Record<string, string> = {
      'A': 'bg-green-50 text-green-700',
      'B': 'bg-blue-50 text-blue-700',
      'C': 'bg-yellow-50 text-yellow-700',
      'D': 'bg-red-50 text-red-700'
    };
    return gradeColors[grade] || 'bg-gray-50 text-gray-700';
  };

  console.log("Rendering products:", products);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Brokers
            </button>
            <h2 className="text-xl font-semibold">
              {distributorName ? `Products from ${distributorName}` : 'Products'}
            </h2>
          </div>
        </div>

        {/* Error Message */}
        {purchaseState.error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {purchaseState.error}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(products) && products.map((product) => (
            <div 
              key={product._id} 
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-emerald-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{product.cropName}</h3>
                {/* Grade display disabled as it's not in your data
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getGradeColor(product.grade)}`}>
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm">Grade {product.grade || 'B'}</span>
                </div> */}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Farmer: {product.farmerName}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {product.farmerRating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-emerald-600 font-semibold">
                  ₹{product.pricePerUnit?.toLocaleString('en-IN') || 0}/kg
                </span>
                <span className="text-sm text-gray-600">
                  Available: {product.availableQuantity?.toLocaleString('en-IN') || 0} kg
                </span>
              </div>

              <button
                onClick={() => handlePurchase(product._id)}
                disabled={purchaseState.loading && purchaseState.productId === product._id}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-300 disabled:cursor-not-allowed"
              >
                {purchaseState.loading && purchaseState.productId === product._id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Purchase'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(!Array.isArray(products) || products.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available from this distributor.</p>
          </div>
        )}
      </div>
    </div>
  );
}