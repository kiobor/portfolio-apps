import { useEffect } from "react";

/** Titolo della scheda per ogni schermata: in una SPA il browser non lo cambia da solo. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
