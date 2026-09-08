export function Mark({ size = 18 }: { size?: number }) {
  const cell = Math.max(2, Math.round(size / 7));
  const gap = Math.max(2, Math.round(size / 9));
  const colors = [
    '#ffffff',
    '#ffffff',
    '#FFDE58',
    '#ffffff',
    '#ffffff',
    '#8A8A8A',
    '#ffffff',
    '#ffffff',
    '#6B7280',
  ];

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(3, ${cell}px)`,
        gap,
        width: size,
        height: size,
      }}
    >
      {colors.map((fill, index) => (
        <span
          key={index}
          style={{
            width: cell,
            height: cell,
            borderRadius: '50%',
            background: fill,
          }}
        />
      ))}
    </span>
  );
}
