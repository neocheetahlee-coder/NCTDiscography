// สวิตช์เปลี่ยนธีมสว่าง/มืด
export default function ThemeToggle({ checked, onChange }) {
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
