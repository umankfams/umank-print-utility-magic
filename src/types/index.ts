
export type PrintJobStatus = 'pending' | 'printing' | 'completed' | 'failed';

export interface PrintJob {
  id: string;
  name: string;
  fileUrl?: string;
  fileName: string;
  createdAt: Date;
  status: PrintJobStatus;
  pages: number;
  copies: number;
  color: boolean;
  doubleSided: boolean;
}

export interface PrintSettings {
  defaultPrinter: string;
  defaultColor: boolean;
  defaultDoubleSided: boolean;
  defaultCopies: number;
}

export type IngredientUnit = 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'box' | 'batch';

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  stock: number;
  pricePerUnit: number;
  unit: IngredientUnit | string;
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: TaskTemplate[];
}

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  ingredientId?: string;
  productId?: string;
  isSubtask: boolean;
  parentTemplateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  parentTaskId?: string;
  orderId?: string;
  ingredientId?: string;
  productId?: string;
  taskType?: 'manual' | 'automatic';
  deadline?: Date;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductIngredient {
  id: string;
  productId: string;
  ingredientId: string;
  ingredient?: Ingredient;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minOrder: number;
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients?: ProductIngredient[];
  tasks?: TaskTemplate[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerId?: string;
  orderDate: Date;
  deliveryDate?: Date;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface Customer {
  id: string;
  name: string;
  contact?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
