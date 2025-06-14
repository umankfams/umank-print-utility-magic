
import { useState, useEffect } from "react";

export interface ProductCategory {
  id: string;
  key: string;
  label: string;
  icon: string;
  color: string;
}

const defaultCategories: ProductCategory[] = [
  { id: '1', key: 'kartu-nama', label: 'Kartu Nama', icon: 'card', color: '#3B82F6' },
  { id: '2', key: 'brosur', label: 'Brosur', icon: 'file', color: '#10B981' },
  { id: '3', key: 'flyer', label: 'Flyer', icon: 'file', color: '#F59E0B' },
  { id: '4', key: 'poster', label: 'Poster', icon: 'image', color: '#EF4444' },
  { id: '5', key: 'banner', label: 'Banner', icon: 'image', color: '#8B5CF6' },
  { id: '6', key: 'stiker', label: 'Stiker', icon: 'tag', color: '#EC4899' },
  { id: '7', key: 'undangan', label: 'Undangan', icon: 'calendar', color: '#06B6D4' },
  { id: '8', key: 'kalender', label: 'Kalender', icon: 'calendar', color: '#84CC16' },
  { id: '9', key: 'amplop', label: 'Amplop', icon: 'folder', color: '#F97316' },
  { id: '10', key: 'nota', label: 'Nota', icon: 'clipboard', color: '#64748B' },
  { id: '11', key: 'kop-surat', label: 'Kop Surat', icon: 'file', color: '#0EA5E9' },
  { id: '12', key: 'yasin', label: 'Yasin', icon: 'book', color: '#22C55E' },
  { id: '13', key: 'lainnya', label: 'Lainnya', icon: 'folder', color: '#6B7280' },
];

export function useProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>(defaultCategories);

  return {
    categories,
    isLoading: false,
    error: null,
  };
}
