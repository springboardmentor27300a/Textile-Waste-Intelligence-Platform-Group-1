/**
 * The signature element: circularity drawn as cloth.
 *
 * Warp threads are fixed — every batch has the same potential. The weft is what
 * the score earns: a high-scoring batch weaves up tight and opaque, a low one
 * leaves the warp exposed and reads, correctly, as something coming apart.
 */
export default function WeaveMeter({ score = 0, size = 132, label }) {
  const warpCount = 15;
  const maxWeft = 15;
  const weftCount = Math.round((Math.max(0, Math.min(100, score)) / 100) * maxWeft);
  const step = size / (warpCount + 1);

  const colour = score >= 70 ? "#10B981" : score >= 50 ? "#5EEAD4"
    : score >= 30 ? "#F59E0B" : "#F05252";

  return (
    <figure className="inline-flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Circularity ${score.toFixed(0)} out of 100`}
      >
        <rect width={size} height={size} rx="10" fill="#0E1729" />
        {Array.from({ length: warpCount }, (_, i) => (
          <line
            key={`warp-${i}`}
            x1={step * (i + 1)}
            y1={3}
            x2={step * (i + 1)}
            y2={size - 3}
            stroke="#E8EEF7"
            strokeOpacity={0.16}
            strokeWidth={1.5}
          />
        ))}
        {Array.from({ length: weftCount }, (_, i) => (
          <line
            key={`weft-${i}`}
            x1={3}
            y1={step * (i + 1)}
            x2={size - 3}
            y2={step * (i + 1)}
            stroke={colour}
            strokeWidth={4.5}
            strokeLinecap="butt"
          />
        ))}
        <rect x={0.5} y={0.5} width={size - 1} height={size - 1} rx="10" fill="none" stroke="#22304A" />
      </svg>
      <figcaption className="text-center">
        <div className="font-display text-2xl font-bold tnum leading-none">{score.toFixed(0)}</div>
        <div className="eyebrow mt-1">{label || "Circularity"}</div>
      </figcaption>
    </figure>
  );
}
