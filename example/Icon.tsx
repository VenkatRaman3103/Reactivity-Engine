// Icon.tsx
export default function Icon(props: {
  name?:  string
  size?:  number
  color?: string
  children?: any
}) {
  const size  = props.size  ?? 24
  const color = props.color ?? 'currentColor'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {props.children}
    </svg>
  )
}
