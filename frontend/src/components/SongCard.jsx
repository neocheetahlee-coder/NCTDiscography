import getHighResImage from '../utils/getHighResImage.js';

// การ์ดเพลงที่เปิดรายละเอียดได้ด้วยเมาส์หรือคีย์บอร์ด
export default function SongCard({ song, rank, onClick }) {
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
