// Spinner.tsx — animated SVG spinner
export default function Spinner(props: { size?: number }) {
  const size = props.size ?? 24

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 1.5s linear infinite' }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#eaeaea"
        strokeWidth="2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#7ec8e3"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </svg>
  )
}
