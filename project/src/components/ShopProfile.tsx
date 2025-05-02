import React from 'react';
import { Store, Phone, MapPin } from 'lucide-react';
import { Shop } from '../types';

interface ShopProfileProps {
  shop: Shop;
}

export function ShopProfile({ shop }: ShopProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <Store className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{shop.name}</h2>
          <p className="text-sm text-gray-600">Owner: {shop.ownerName}</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="h-4 w-4" />
          <span className="text-sm">{shop.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{shop.location}</span>
        </div>
      </div>
    </div>
  );
}