
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

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  ingredientId?: string;
  productId?: string;
  isSubtask: boolean;
  parentTemplateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'cancelled';
export type TaskType = 'manual' | 'automatic';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  parentTaskId?: string;
  orderId?: string;
  ingredientId?: string;
  productId?: string;
  taskType?: TaskType;
  deadline?: Date;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
  productName?: string;
  ingredientName?: string;
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
  categoryId?: string;
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

export type Customer = {
  id: string;
  name: string;
  contact?: string;
  address?: string;
  email?: string;
  phone?: string;
  company?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
