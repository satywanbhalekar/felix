export interface ServiceInput {
    entityId: string;
    name: string;
    description?: string;
    price: number;
    currency?: string; // Default 'BD'
  }
  
  export interface Service {
    id: string;
    entityId: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    createdAt: string;
  }
  