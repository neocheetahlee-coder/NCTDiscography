import { useEffect } from 'react';
import { unitMembers } from '../constants/unitMembers.js';
import getHighResImage from '../utils/getHighResImage.js';

// แสดงรายละเอียดเพลง และปิดได้ด้วย Escape หรือคลิกพื้นหลัง
export default function SongModal({ song, onClose }) {
  useEffect(() => {
    if (!song) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [song, onClose]);

  if (!song) {
    return <div className="modal-overlay" id="modal" />;
  }

  const duration = formatDuration(song.trackTimeMillis);

  return (
    <div
      className="modal-overlay active"
      id="modal"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTrack">
        <button className="close-btn" type="button" onClick={onClose} aria-label="Close dialog">
          ×
        </button>
        <div className="modal-header">
          <img src={getHighResImage(song.artworkUrl100)} alt={`${song.collectionName} cover`} />
          <div>
            <h3 className="modal-title" id="modalTrack">{song.trackName}</h3>
            <p className="modal-sub" id="modalArtist">{song.artistName}</p>
            <p
              className="modal-sub"
              id="modalCollection"
              style={{ color: 'var(--text-sub)', fontSize: '13px' }}
            >
              {song.collectionName}
            </p>
          </div>
        </div>
        <div className="modal-data">
          <div>Genre: <span>{song.primaryGenreName || 'Unknown'}</span></div>
          <div>Duration: <span>{duration}</span></div>
          <div>Members: <span>{unitMembers[song.artistName] || 'NCT Members'}</span></div>
          <div>
            Release Date:{' '}
            <span>
              {song.releaseDate ? new Date(song.releaseDate).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>
        <a
          href={song.trackViewUrl || '#'}
          className="apple-btn"
          target="_blank"
          rel="noreferrer"
        >
          Listen on Apple Music
        </a>
      </div>
    </div>
  );
}

function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds)) return 'Unknown';
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
