export interface Product {
  id: string;
  name: string;
  currentQuantity: number;
  storeId: string;
}

export interface Store {
  id: string;
  name: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "STOCK_IN" | "SALE" | "MANUAL_REMOVAL";
  quantity: number;
  timestamp: string;
  storeId: string;
  product: {
    name: string;
  };
}