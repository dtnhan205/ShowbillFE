import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './ClientSearch.module.css';

type Props = {
  onSearch: (query: string) => void;
  onRefresh?: () => void;
};

const ClientSearch: React.FC<Props> = ({ onSearch, onRefresh }) => {
  const [query, setQuery] = useState('');

  // Live filter: whenever query changes, filter immediately.
  useEffect(() => {
    onSearch(query);
  }, [onSearch, query]);

  const handleRefresh = () => {
    setQuery('');
    // Force reset immediately (in case effect batching/caching delays)
    onSearch('');
    onRefresh?.();
  };

  return (
    <motion.div
      className={styles.wrap}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className={styles.form}>
        <input
          type="text"
          placeholder="Tìm laptop, màn hình, tai nghe..."
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            // Force update on every keystroke, including clearing
            onSearch(v);
          }}
          className={styles.input}
        />
        {query && (
          <motion.button
            type="button"
            className={styles.clearButton}
            onClick={handleRefresh}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon name="close" size={16} color="rgba(255, 255, 255, 0.9)" />
          </motion.button>
        )}
        <button type="button" className={styles.secondaryButton} onClick={handleRefresh}>
          Refresh
        </button>
      </div>
    </motion.div>
  );
};

export default ClientSearch;
