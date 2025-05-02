export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phoneNumber: string;
  location: string;
  businessType: string;
  registrationNumber: string;
}

export interface Broker {
  id: string;
  name: string;
  phoneNumber: string;
  location: string;
  rating: number;
  totalDeals: number;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  farmerId: string;
  farmerName: string;
  farmerRating: number;
  organic: boolean;
  qualityGrade: 'A' | 'B' | 'C';
}

export interface Purchase {
  id: string;
  date: string;
  product: Product;
  quantity: number;
  totalCost: number;
  brokerName: string;
  qrCodeImage?: string;
}

// Distributor Dashboard Types
export interface Farmer {
  _id: string;
  id: string;
  fullName: string;
  photo?: string;
  products: Product[];
  location?: string;
  phoneNumber?: string;
  sustainabilityBadge?: string;
  rating?: number;
}

// export interface Shopkeeper {
//   id: string;
//   shopName: string;
//   ownerName: string;
//   location: string;
//   phoneNumber: string;
//   inventory: {
//     productName: string;
//     quantity: number;
//     unit: string;
//     price: number;
//     accepted: boolean;
//   }[];
// }
export interface CatalogItem {
  _id: string;
  id: string;
  farmerId: string;
  farmerName: string;
  distributorId: string;
  cropName: string;
  quantity: number;
  negotiationPrice: number;
  negotiatedDate: string;
  deliveryDate: string;
  farmerRating: number;
  pricePerUnit?: number;
  availableQuantity?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseItem {
  warehouseId: {
    _id: string;
    name: string;
    location: string;
  };
  productId: string;
  quantity: number;
  bestBefore: string;
  packaging: string;
  batchNumber: string;
  distanceTravelled: number;
}
export interface Distributor {
  _id: string;
  fullName: string;
  businessName: string;
  phoneNumber: string;
  businessAddress: string;
  sustainabilityScore: number;
  sustainabilityBadge: string;
  createdAt: string;
  updatedAt: string;
}

// src/types.ts
export interface InventoryRequest {
  _id: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'delivered';
  requestDate: string;
}

export interface Shopkeeper {
  _id: string;
  fullName: string;
  shopName: string;
  phoneNumber: string;
  businessAddress: string;
  inventory: InventoryRequest[];
  activeOrders: number;
}