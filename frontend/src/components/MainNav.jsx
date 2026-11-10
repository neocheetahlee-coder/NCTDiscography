// สร้างเมนูหลักจากหน้าและเส้นทางใน navigation graph
export default function MainNav({ view, pages, onViewChange }) {
  return (
    <nav className="main-nav" id="mainNav" aria-label="Main navigation">
      {pages.map((page) => (
        <button
          className={`main-nav-btn${view === page.id ? ' active' : ''}`}
          id={`nav${page.id[0].toUpperCase()}${page.id.slice(1)}`}
          key={page.id}
          type="button"
          aria-pressed={view === page.id}
          onClick={() => onViewChange(page.id)}
        >
          <i className={`fa-solid ${page.icon}`} aria-hidden="true" /> {page.label}
        </button>
      ))}
    </nav>
  );
}
