import React from 'react';
import { Phone, MapPin, Star } from 'lucide-react';
import { Distributor } from '../types';

interface BrokerCardProps {
  distributor: Distributor;
  onViewProducts: () => void;
}

export function BrokerCard({ distributor, onViewProducts }: BrokerCardProps) {
  const successfulDeals = Math.floor(Math.random() * 200) + 50; // Mock data - replace with actual data

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{distributor.fullName}</h3>
          <p className="text-sm text-gray-500">{distributor.businessName}</p>
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-yellow-700">
            {(Math.random() * (5 - 4) + 4).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="text-sm">{distributor.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{distributor.businessAddress}</span>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        {successfulDeals} successful deals
      </div>

      <button
        onClick={onViewProducts}
        className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        View Products
      </button>
    </div>
  );
}