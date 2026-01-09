import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import ClientHeader from '../components/ClientHeader';
import ClientSearch from '../components/ClientSearch';
import ClientProductGrid from '../components/ClientProductGrid';
import ClientFilters from '../components/ClientFilters/ClientFilters';
import type { Product } from '../types';

const Client: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [query, setQuery] = useState('');
  const [obVersion, setObVersion] = useState('');
  const [category, setCategory] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get<Product[]>('/products');
      const visible = (Array.isArray(data) ? data : []).filter((p) => !p.isHidden);
      setProducts(visible);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      if (q && !(p.name || '').toLowerCase().includes(q)) return false;
      if (obVersion && (p.obVersion || '').toLowerCase() !== obVersion.toLowerCase()) return false;
      if (category && (p.category || '').toLowerCase() !== category.toLowerCase()) return false;
      return true;
    });
  }, [category, obVersion, products, query]);

  const handleSearch = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
  }, []);

  const handleFilterChange = useCallback((next: { obVersion: string; category: string }) => {
    setObVersion(next.obVersion);
    setCategory(next.category);
  }, []);

  if (loading) {
    return <div style={{ padding: 24, color: 'rgba(229,231,235,0.7)' }}>Đang tải sản phẩm...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: '#ef4444' }}>
        {error}
        <div style={{ marginTop: 12 }}>
          <button onClick={() => void fetchProducts()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ClientHeader />
      <ClientSearch onSearch={handleSearch} onRefresh={() => void fetchProducts()} />
      <ClientFilters
        obVersion={obVersion}
        category={category}
        onChange={handleFilterChange}
        onRefresh={() => void fetchProducts()}
      />
      <ClientProductGrid products={filtered} />
    </div>
  );
};

export default Client;
