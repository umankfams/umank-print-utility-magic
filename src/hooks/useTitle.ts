
import { useEffect } from 'react';

/**
 * Hook to dynamically update the page title
 * @param title The title to set for the page
 */
export function useTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    
    // Restore the original title when the component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
