import SongCard from './SongCard.jsx';

// แสดงสถานะโหลด/ผลลัพธ์ และสร้างการ์ดเพลง
export default function SongGrid({ songs, isTop3 = false, loading, onSongSelect }) {
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
