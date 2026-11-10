import SearchInput from './SearchInput.jsx';
import ThemeToggle from './ThemeToggle.jsx';

// รวมส่วนควบคุมการค้นหา เรียงเพลง และเปลี่ยนธีม
export default function Header({
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
