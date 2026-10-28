import { useEffect } from 'react';

/**
 * Sets document title with format: "${title} — ABC"
 * Restores previous title upon unmount.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return;

    const previousTitle = document.title;
    document.title = `${title} — ABC`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
