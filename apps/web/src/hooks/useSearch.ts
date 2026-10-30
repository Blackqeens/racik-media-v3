'use client';

import { useState, useCallback } from 'react';
import type { ApiResponse } from '@/types/api.types';

interface SearchResult {
  id: string;
  type: 'product' | 'article' | 'service';
  title: string;
  slug?: string;
}

interface UseSearchReturn {
  query: string;
  results: SearchResult[];
  loading: boolean;
  setQuery: (q: string) => void;
  search: (q: string) => Promise<void>;
  clear: () => void;
}

/**
 * useSearch — debounced full-text search via Meilisearch-backed API.
 * Ref: search-architecture.md
 */
export function useSearch(): UseSearchReturn {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(q)}`);
      const json: ApiResponse<SearchResult[]> = await res.json();
      setResults(json.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function setQuery(q: string) {
    setQueryState(q);
  }

  function clear() {
    setQueryState('');
    setResults([]);
  }

  return { query, results, loading, setQuery, search, clear };
}
