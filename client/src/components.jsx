import { useEffect, useState } from 'react';
import { unitMembers } from './constants/unitMembers.js';
import getHighResImage from './utils/getHighResImage.js';

export function Header({
  search,
  onSearchChange,
  sort,
  onSortChange,
  isDark,
  onThemeToggle,
  showSongControls,
}) {
  return (
    <header>
      <h1>NCT Discography</h1>
      <div className="controls">
        {showSongControls && (
          <>
            <SearchInput value={search} onChange={onSearchChange} />
            <select
              id="sortSelect"
              aria-label="Sort songs"
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
            >
              <option value="newest">Date : Newest</option>
              <option value="oldest">Date : Oldest</option>
              <option value="az">Name : A - Z</option>
              <option value="za">Name : Z - A</option>
            </select>
          </>
        )}
        <ThemeToggle checked={isDark} onChange={onThemeToggle} />
      </div>
    </header>
  );
}

export function SearchInput({ value, onChange }) {
  return (
    <div
      className="search-wrapper"
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <input
        id="searchInput"
        type="text"
        placeholder="Search"
        aria-label="Search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <i className="fa-solid fa-magnifying-glass search-icon" aria-hidden="true" />
    </div>
  );
}

export function ThemeToggle({ checked, onChange }) {
  return (
    <div
      className="theme-switch-wrapper"
      style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '15px' }}
    >
      <label
        className="theme-switch"
        style={{ position: 'relative', display: 'inline-block', width: '56px', height: '28px' }}
        aria-label="Toggle dark mode"
      >
        <input
          type="checkbox"
          id="themeToggle"
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          className="slider"
          style={{
            cursor: 'pointer',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#ccc',
            transition: '.4s',
            borderRadius: '34px',
          }}
        />
      </label>
    </div>
  );
}

export function Marquee() {
  const text = 'Neo got my back Culture things tech tech on my mind';

  return (
    <div className="marquee-container" aria-label={text}>
      <div className="marquee-content" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index}>{text}&nbsp;&nbsp;&nbsp;&nbsp;</span>
        ))}
      </div>
    </div>
  );
}

export function MainNav({ view, onViewChange }) {
  return (
    <nav className="main-nav" id="mainNav" aria-label="Main navigation">
      <button
        className={`main-nav-btn${view === 'discography' ? ' active' : ''}`}
        id="navDiscography"
        type="button"
        aria-pressed={view === 'discography'}
        onClick={() => onViewChange('discography')}
      >
        <i className="fa-solid fa-music" aria-hidden="true" /> Discography
      </button>
      <button
        className={`main-nav-btn${view === 'members' ? ' active' : ''}`}
        id="navMembers"
        type="button"
        aria-pressed={view === 'members'}
        onClick={() => onViewChange('members')}
      >
        <i className="fa-solid fa-users" aria-hidden="true" /> Members
      </button>
    </nav>
  );
}

export function UnitTabs({ currentUnit, onUnitChange }) {
  const units = ['ALL', 'NCT 127', 'NCT DREAM', 'NCT U', 'NCT WISH', 'WayV'];

  return (
    <div id="discographyNav">
      <div className="unit-tabs" id="unitTabs">
        {units.map((unit) => (
          <button
            className={`tab-btn${currentUnit === unit ? ' active' : ''}`}
            data-unit={unit}
            key={unit}
            type="button"
            aria-pressed={currentUnit === unit}
            onClick={() => onUnitChange(unit)}
          >
            {unit === 'ALL' ? 'All Units' : unit}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SongGrid({ songs, isTop3 = false, loading, onSongSelect }) {
  const gridId = isTop3 ? 'top3Grid' : 'songsGrid';

  return (
    <div className="grid" id={gridId} aria-live="polite">
      {loading && songs.length === 0 ? (
        <p className="empty-state">Loading songs...</p>
      ) : songs.length === 0 ? (
        <p className="empty-state">No results found.</p>
      ) : (
        songs.map((song, index) => (
          <SongCard
            key={song.trackId}
            song={song}
            rank={isTop3 ? index + 1 : null}
            onClick={() => onSongSelect(song)}
          />
        ))
      )}
    </div>
  );
}

export function SongCard({ song, rank, onClick }) {
  const imageUrl = getHighResImage(song.artworkUrl100);

  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {rank !== null && <div className={`rank-badge rank-${rank}`}>{rank}</div>}
      <img src={imageUrl} alt={`${song.collectionName} cover`} loading="lazy" />
      <div className="card-info">
        <div
          className="track-name"
          style={{ fontFamily: "'Ubuntu', sans-serif", fontWeight: 500 }}
        >
          {song.trackName}
        </div>
        <div className="artist-name" style={{ fontFamily: "'Geist Mono', monospace" }}>
          {song.artistName}
        </div>
      </div>
    </div>
  );
}

export function SongModal({ song, onClose }) {
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

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <p>Developed by กัญญ์กณิษฐ์ เชื้อฉลาด 681310001</p>
        <p>
          Powered by{' '}
          <a
            href="https://developer.apple.com/apple-music/api/"
            target="_blank"
            rel="noreferrer"
            className="apple-link"
          >
            <i className="fa-brands fa-apple" aria-hidden="true" /> Apple Music API
          </a>
        </p>
      </div>
    </footer>
  );
}

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsVisible(window.scrollY > 300);
    }

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  return (
    <button
      id="backToTopBtn"
      className={isVisible ? 'show' : ''}
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <i className="fa-solid fa-arrow-up" aria-hidden="true" />
    </button>
  );
}

function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds)) return 'Unknown';
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
