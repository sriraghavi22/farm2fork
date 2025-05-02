import React from 'react';
import { Receipt, Package, IndianRupee } from 'lucide-react';
import { Purchase } from '../types';

interface PurchasesSummaryProps {
  purchases: Purchase[];
  onClose: () => void;
}

export function PurchasesSummary({ purchases, onClose }: PurchasesSummaryProps) {
  const totalCost = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  console.log("purchases", purchases);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="h-6 w-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Confirmed Orders Summary</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-auto">
          {purchases.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No confirmed orders yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {purchase.product.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(purchase.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Distributor: {purchase.brokerName}
                    </p>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-sm">
                        <p>Quantity: {purchase.quantity} {purchase.product.unit}</p>
                        <p className="font-medium text-emerald-600">
                          Cost: ₹{purchase.totalCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {purchase.qrCodeImage && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Traceability QR Code:</p>
                        <img
                          src={purchase.qrCodeImage}
                          alt="Traceability QR Code"
                          className="w-24 h-24 mx-auto mt-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Confirmed Orders Cost
                  </span>
                  <div className="flex items-center gap-2 text-xl font-bold text-emerald-600">
                    <IndianRupee className="h-5 w-5" />
                    {totalCost.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}