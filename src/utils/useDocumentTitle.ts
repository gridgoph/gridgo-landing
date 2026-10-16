import { useEffect } from 'react';

/** Sets the browser tab title while a page is shown, and restores it after. */
export function useDocumentTitle(documentTitle: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = documentTitle;
    return () => {
      document.title = previous;
    };
  }, [documentTitle]);
}
