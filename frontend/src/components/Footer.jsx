// แสดงเครดิตและลิงก์ Apple Music API
export default function Footer() {
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
