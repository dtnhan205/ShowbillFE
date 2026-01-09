import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import styles from './ClientFilters.module.css';
import type { Category, ObVersion } from '../../types/adminMeta';

type Props = {
  obVersion: string;
  category: string;
  onChange: (next: { obVersion: string; category: string }) => void;
  onRefresh?: () => void;
};

const ClientFilters: React.FC<Props> = ({ obVersion, category, onChange, onRefresh }) => {
  const [obs, setObs] = useState<ObVersion[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [o, c] = await Promise.all([
          api.get<ObVersion[]>('/obs'),
          api.get<Category[]>('/categories'),
        ]);
        setObs(Array.isArray(o.data) ? o.data : []);
        setCats(Array.isArray(c.data) ? c.data : []);
      } catch (e) {
        // ignore (filters still usable without options)
      }
    };

    void load();
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <select
          className={styles.select}
          value={obVersion}
          onChange={(e) => onChange({ obVersion: e.target.value, category })}
        >
          <option value="">Tất cả OB</option>
          {obs
            .filter((x) => x.isActive)
            .map((x) => (
              <option key={x._id} value={x.slug}>
                {x.name}
              </option>
            ))}
        </select>

        <select
          className={styles.select}
          value={category}
          onChange={(e) => onChange({ obVersion, category: e.target.value })}
        >
          <option value="">Tất cả Category</option>
          {cats
            .filter((x) => x.isActive)
            .map((x) => (
              <option key={x._id} value={x.slug}>
                {x.name}
              </option>
            ))}
        </select>

        <button type="button" className={styles.btn} onClick={onRefresh}>
          Refresh
        </button>
      </div>
    </div>
  );
};

export default ClientFilters;

