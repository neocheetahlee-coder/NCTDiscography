import { useEffect, useState } from 'react';
import {
  formatDate,
  getMemberFlag,
  getMemberImageSources,
} from '../utils/memberHelpers.js';

function getInstagramDetails(instagram) {
  if (!instagram) return null;

  const isFullUrl = /^https?:\/\//i.test(instagram);
  const trimmedInstagram = instagram.replace(/\/+$/, '');
  const username = trimmedInstagram.split('/').pop();

  return {
    href: isFullUrl
      ? instagram
      : `https://www.instagram.com/${encodeURIComponent(instagram)}`,
    username,
  };
}

export default function MemberModal({ member, onClose }) {
  const [photoSourceIndex, setPhotoSourceIndex] = useState(0);
  const [albums, setAlbums] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [albumsError, setAlbumsError] = useState('');

  useEffect(() => {
    if (!member?.soloAlbums?.length) {
      setAlbums([]);
      setAlbumsLoading(false);
      setAlbumsError('');
      return undefined;
    }

    const controller = new AbortController();

    async function loadMemberLinks() {
      setAlbums([]);
      setAlbumsError('');
      setAlbumsLoading(true);

      try {
        const response = await fetch(
          `/api/members/${encodeURIComponent(member.id)}/solo-albums`,
          { signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Request failed with status ${response.status}`);
        }
        if (!Array.isArray(data.albums)) {
          throw new Error('The solo albums response has an invalid format');
        }
        setAlbums(data.albums);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAlbumsError(error.message || 'Could not load Solo Albums');
        }
      } finally {
        if (!controller.signal.aborted) {
          setAlbumsLoading(false);
        }
      }
    }

    loadMemberLinks();
    return () => controller.abort();
  }, [member]);

  useEffect(() => {
    if (!member) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [member, onClose]);

  if (!member) {
    return <div className="modal-overlay" id="memberModal" />;
  }

  const instagram = getInstagramDetails(member.instagram);
  const photoSources = getMemberImageSources(member.image);

  return (
    <div
      className="modal-overlay active"
      id="memberModal"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content member-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="memberModalName"
      >
        <button className="close-btn" type="button" onClick={onClose} aria-label="Close dialog">
          ×
        </button>
        <div className="member-modal-header">
          {photoSourceIndex < photoSources.length ? (
            <img
              src={photoSources[photoSourceIndex]}
              alt={member.name}
              className="member-modal-photo"
              onError={() => setPhotoSourceIndex((index) => index + 1)}
            />
          ) : (
            <div className="member-modal-photo-placeholder" aria-label={`${member.name} photo unavailable`}>
              <i className="fa-solid fa-user" aria-hidden="true" />
            </div>
          )}
          <div className="member-modal-details">
            <h3 className="member-modal-name" id="memberModalName">{member.name}</h3>
            <div className="member-modal-meta">
              🎂 <span className="member-modal-birth-date">{formatDate(member.birthDate)}</span>
              {' | '}
              <span className="member-modal-age">
                Age {member.age}
                {getMemberFlag(member) && (
                  <span className="member-nationality-flag" role="img" aria-label={`${member.name} flag`}>
                    {getMemberFlag(member)}
                  </span>
                )}
              </span>
            </div>
            <div className="member-modal-units">
              {(member.units || []).map((unit) => (
                <span className="member-unit-badge" key={unit}>{unit}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="member-modal-links">
          {instagram && (
            <a
              href={instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ig-btn"
            >
              <i className="fa-brands fa-instagram" aria-hidden="true" />
              @{instagram.username}
            </a>
          )}

          {member.soloAlbums?.length > 0 && (
            <>
              <div className="solo-section-title">
                <i className="fa-brands fa-apple" aria-hidden="true" /> Solo Albums
              </div>
              {albumsLoading ? (
                <p className="member-modal-message">Loading albums...</p>
              ) : albumsError ? (
                <p className="member-modal-message" role="alert">
                  Could not load Solo Albums. Please try again.
                </p>
              ) : albums.length > 0 ? (
                albums.map((album) => (
                  <div className="solo-album-card" key={`${album.albumTitle}-${album.releaseYear}`}>
                    <div className="solo-album-info">
                      <div className="solo-album-title">{album.albumTitle}</div>
                      <div className="solo-album-track">
                        ▶ {album.titleTrack} &middot; {album.releaseYear}
                      </div>
                    </div>
                    <a
                      href={album.appleMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="solo-apple-btn"
                    >
                      <i className="fa-brands fa-apple" aria-hidden="true" /> Listen
                    </a>
                  </div>
                ))
              ) : (
                <p className="member-modal-message">No Solo Albums found in Apple Music.</p>
              )}
            </>
          )}

          {!instagram && !member.soloAlbums?.length && (
            <p className="member-modal-message">No social links available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
