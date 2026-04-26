import { data, max } from './chart.state'

export default function Chart() {
  const width  = 400
  const height = 200
  const pad    = 20

  return (
    <svg width={width} height={height} style={{ overflow: 'visible', ...{ background: '#fcfcfc', borderRadius: '12px', border: '1px solid #eaeaea' } }}>

      {/* grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = pad + (height - pad * 2) * (1 - ratio)
        return (
          <line
            key={i}
            x1={pad}
            y1={y}
            x2={width - pad}
            y2={y}
            stroke="#eaeaea"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )
      })}

      {/* bars */}
      {data.map((point, i) => {
        const barW  = (width - pad * 2) / data.length - 12
        const barH  = ((point.value / max) * (height - pad * 2))
        const x     = pad + i * ((width - pad * 2) / data.length) + 6
        const y     = height - pad - barH

        return (
          <rect
            key={point.id}
            x={x}
            y={y}
            width={barW}
            height={barH}
            fill="#7ec8e3"
            rx="4"
            style={{ transition: 'all 0.3s ease-out' }}
          />
        )
      })}

      {/* labels */}
      {data.map((point, i) => {
        const x = pad + i * ((width - pad * 2) / data.length) +
                  ((width - pad * 2) / data.length) / 2
        return (
          <text
            key={`label-${point.id}`}
            x={x}
            y={height - 4}
            textAnchor="middle"
            fontSize="11"
            fill="#666"
            fontFamily="system-ui"
          >
            {point.label}
          </text>
        )
      })}

    </svg>
  )
}
