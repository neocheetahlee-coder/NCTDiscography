// ปุ่มกรองเพลงตามยูนิต
export default function UnitTabs({ currentUnit, onUnitChange }) {
  const units = ['ALL', 'NCT 127', 'NCT DREAM', 'NCT U', 'NCT WISH', 'WayV'];

  return (
    <div id="discographyNav">
      <div className="unit-tabs" id="unitTabs">
        {units.map((unit) => (
          <button
            className={`tab-btn${currentUnit === unit ? ' active' : ''}`}
            data-unit={unit}
            key={unit}
            type="button"
            aria-pressed={currentUnit === unit}
            onClick={() => onUnitChange(unit)}
          >
            {unit === 'ALL' ? 'All Units' : unit}
          </button>
        ))}
      </div>
    </div>
  );
}
