
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate selling price based on cost price and markup percentage
 * @param costPrice - The cost price of the product
 * @param markupPercentage - The percentage markup to apply (1-100)
 */
export const calculateSellingPrice = (costPrice: number, markupPercentage: number): number => {
  const markup = (markupPercentage / 100) * costPrice;
  return costPrice + markup;
};
