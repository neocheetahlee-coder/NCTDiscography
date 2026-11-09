import { useCallback, useEffect, useState } from 'react';
import {
  BackToTop,
  Footer,
  Header,
  MainNav,
  Marquee,
  SongGrid,
  SongModal,
  UnitTabs,
} from './components.jsx';
import HighlightsSection from './components/HighlightsSection.jsx';
import MembersView from './components/MembersView.jsx';
import useDebounce from './hooks/useDebounce.js';
import useTheme from './hooks/useTheme.js';
import './styles/global.css';
import './styles/app-overrides.css';

function App() {
  const [currentUnit, setCurrentUnit] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('discography');
  const [songs, setSongs] = useState([]);
  const [top3, setTop3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const debouncedSearch = useDebounce(search, 300);
  const [isDark, toggleTheme] = useTheme();
  const closeModal = useCallback(() => setSelectedSong(null), []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError('');

      const query = [
        `unit=${encodeURIComponent(currentUnit)}`,
        `sort=${encodeURIComponent(sort)}`,
        `search=${encodeURIComponent(debouncedSearch)}`,
      ].join('&');

      try {
        const response = await fetch(`/api/songs?${query}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Could not load songs (HTTP ${response.status})`);
        }

        const data = await response.json();
        if (!Array.isArray(data.songs) || !Array.isArray(data.top3)) {
          throw new Error('The songs response has an invalid format');
        }
        setSongs(data.songs);
        setTop3(data.top3);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Could not load songs');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => controller.abort();
  }, [currentUnit, sort, debouncedSearch]);

  return (
    <>
      <Header
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        showSongControls={view === 'discography'}
      />
      <Marquee />
      <MainNav view={view} onViewChange={setView} />

      {view === 'discography' && (
        <>
          <UnitTabs currentUnit={currentUnit} onUnitChange={setCurrentUnit} />
          <div className="track-count" aria-live="polite">
            Found {songs.length} tracks
          </div>
        </>
      )}
      <div
        className={`container highlights-container${view === 'members' ? ' highlights-container-hidden' : ''}`}
      >
        <HighlightsSection visible={view === 'discography' && currentUnit === 'ALL'} />
      </div>

      {view === 'members' ? <MembersView /> : (
        <>
          <main className="container">
            {error && (
              <p className="request-error" role="alert">
                {error}
              </p>
            )}

            <h2 className="section-title">Top 3 Most Streamed</h2>
            <SongGrid
              songs={top3}
              isTop3
              loading={loading}
              onSongSelect={setSelectedSong}
            />

            <h2 className="section-title">Discography</h2>
            <SongGrid
              songs={songs}
              loading={loading}
              onSongSelect={setSelectedSong}
            />
          </main>
        </>
      )}

      <SongModal song={selectedSong} onClose={closeModal} />
      <Footer />
      <BackToTop />
    </>
  );
}

export default App;
