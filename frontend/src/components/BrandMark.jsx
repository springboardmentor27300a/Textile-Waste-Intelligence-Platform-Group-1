export default function BrandMark({ size = 34 }) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="18" stroke="#8A9A5B" strokeWidth="1.4" strokeDasharray="2.5 3.2" />
      <path
        d="M13 24C13 18 16 14 20 14C24 14 27 17 27 20C27 23 24.5 25 22 24C19.5 23 20 19.5 22.5 19.5"
        stroke="#F4EFE2"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="22.5" cy="19.5" r="1.6" fill="#B5652D" />
    </svg>
  );
}
