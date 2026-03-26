import React from 'react';
import styles from './DownloadButton.module.css';

interface Props {
  onClick: () => void;
  title?: string;
}

const DownloadButton: React.FC<Props> = ({ onClick, title = 'Download CSV' }) => (
  <button
    className={styles.downloadBtn}
    onClick={onClick}
    aria-label={title}
    title={title}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 16l6-6h-4V4H10v6H6l6 6zm-7 2h14v2H5v-2z" />
    </svg>
  </button>
);

export default DownloadButton;
