export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  userId: string;
  imageIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
}
