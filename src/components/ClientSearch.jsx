import { useMemo, useState } from 'react';
import styles from './ClientSearch.module.css';

const ClientSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className={styles.wrap}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Tìm laptop, màn hình, tai nghe..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={!canSearch}>
          Tìm kiếm
        </button>
      </form>
    </div>
  );
};

export default ClientSearch;
