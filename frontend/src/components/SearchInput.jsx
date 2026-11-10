// ช่องรับคำค้นหาและแสดงไอคอนค้นหา
export default function SearchInput({ value, onChange }) {
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
