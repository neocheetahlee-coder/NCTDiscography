import { useCallback, useEffect, useState } from 'react';
import BackToTop from './components/BackToTop.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import HighlightsSection from './components/HighlightsSection.jsx';
import MainNav from './components/MainNav.jsx';
import Marquee from './components/Marquee.jsx';
import MembersView from './components/MembersView.jsx';
import SongGrid from './components/SongGrid.jsx';
import SongModal from './components/SongModal.jsx';
import UnitTabs from './components/UnitTabs.jsx';
import useDebounce from './hooks/useDebounce.js';
import useTheme from './hooks/useTheme.js';
import navigationGraph from './navigation/navigationGraph.js';
import './styles/global.css';
import './styles/app-overrides.css';

function App() {
  // เก็บค่าตัวกรองและข้อมูลที่ใช้แสดงหน้า Discography
  const [currentUnit, setCurrentUnit] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('discography');
  const [songs, setSongs] = useState([]);
  const [top3, setTop3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ควบคุมเพลงที่เลือกเปิดใน modal และสถานะธีม
  const [selectedSong, setSelectedSong] = useState(null);
  const debouncedSearch = useDebounce(search, 300);
  const [isDark, toggleTheme] = useTheme();
  const closeModal = useCallback(() => setSelectedSong(null), []);

  // เปลี่ยนหน้าได้เมื่อมีเส้นทางเชื่อมถึงกันใน navigation graph
  const navigateToView = useCallback((targetView) => {
    if (navigationGraph.findPath(view, targetView)) {
      setView(targetView);
    }
  }, [view]);

  // โหลดเพลงใหม่เมื่อเปลี่ยนยูนิต การเรียง หรือคำค้นหา
  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError('');

      // เข้ารหัสค่าก่อนประกอบเป็น query string
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
        // อัปเดตเพลงทั้งหมดและอันดับ 3 จาก API
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
    // ยกเลิก request เก่าเมื่อ dependencies เปลี่ยนหรือ component ถูกถอดออก
    return () => controller.abort();
  }, [currentUnit, sort, debouncedSearch]);

  return (
    <>
      {/* ส่วนหัวรวมช่องค้นหา ตัวเลือกเรียง และสลับธีม */}
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
      {/* เมนูหลักรับรายการหน้าและเส้นทางจาก navigation graph */}
      <MainNav
        view={view}
        pages={navigationGraph.getPages()}
        onViewChange={navigateToView}
      />

      {/* ตัวกรองยูนิตและจำนวนเพลงแสดงเฉพาะหน้า Discography */}
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
        {/* ซ่อน Highlights เมื่อเลือกหน้า Members หรือกรองเฉพาะยูนิต */}
        <HighlightsSection visible={view === 'discography' && currentUnit === 'ALL'} />
      </div>

      {/* เลือกแสดงหน้าสมาชิกหรือรายการเพลงตามเมนูที่ใช้งาน */}
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

      {/* modal เพลงและส่วนท้ายที่ใช้ร่วมกันทุกหน้า */}
      <SongModal song={selectedSong} onClose={closeModal} />
      <Footer />
      <BackToTop />
    </>
  );
}

export default App;
