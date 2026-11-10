// แถบข้อความเลื่อนตกแต่งหน้าเว็บ
export default function Marquee() {
  const text = 'Neo got my back Culture things tech tech on my mind';

  return (
    <div className="marquee-container" aria-label={text}>
      <div className="marquee-content" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index}>{text}&nbsp;&nbsp;&nbsp;&nbsp;</span>
        ))}
      </div>
    </div>
  );
}
