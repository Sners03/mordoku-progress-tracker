import { useEffect, useRef } from 'react'

const GLYPHS: GlyphName[] = [
  'knife',
  'house',
  'wine',
  'car',
  'paper',
  'diary',
  'cigarette',
  'splatter',
  'pistol',
  'glass',
  'hat',
  'key',
  'grid',
  'letter',
  'eye',
  'lock',
  'pipe',
  'bottle',
  'compass',
  'camera',
  'book',
  'badge',
  'lantern',
  'hourglass',
  'watch',
  'foot',
  'note',
  'piece',
  'specs',
  'candle',
  'cup',
  'map',
  'bulb',
  'mark',
  'pencil',
  'cuff',
]

const BLOOD_GLYPHS = new Set<GlyphName>(['splatter', 'knife', 'pistol'])

function scatter(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const MOTIFS: { top: string; left: string; size: number; rotate: number; blood?: boolean; glyph: GlyphName }[] = (() => {
  const rand = scatter(20261113)
  const motifs: { top: string; left: string; size: number; rotate: number; blood?: boolean; glyph: GlyphName }[] = []
  const clear = new Set<GlyphName>(['car', 'pistol', 'splatter', 'knife'])
  const cols = 6
  const rows = 12
  const cellW = 100 / cols
  const cellH = 100 / rows
  const cells = Array.from({ length: rows * cols }, (_, index) => ({
    col: index % cols,
    row: Math.floor(index / cols),
  }))

  const seen = new Set<string>()
  const pairs: { col: number; row: number }[][] = []
  for (const cell of cells) {
    const key = `${cell.col},${cell.row}`
    if (seen.has(key)) continue
    const partner = { col: (cell.col + 3) % cols, row: (cell.row + 6) % rows }
    seen.add(key)
    seen.add(`${partner.col},${partner.row}`)
    pairs.push([cell, partner])
  }

  const order = [...GLYPHS]
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rand() * (index + 1))
    const current = order[index]
    order[index] = order[swap]
    order[swap] = current
  }

  const spot = (cell: { col: number; row: number }) => ({
    x: Math.min(96, Math.max(1.5, (cell.col + 0.5) * cellW + (rand() - 0.5) * cellW * 1.85)),
    y: Math.min(97.5, Math.max(1, (cell.row + 0.5) * cellH + (rand() - 0.5) * cellH * 4.6)),
  })

  order.forEach((glyph, index) => {
    const pair = pairs[index]
    if (!pair) return
    for (const cell of pair) {
      const { x, y } = spot(cell)
      const roll = rand()
      const size = clear.has(glyph)
        ? Math.round(58 + rand() * 34)
        : Math.round(roll < 0.22 ? 26 + rand() * 12 : roll < 0.72 ? 40 + rand() * 26 : 72 + rand() * 36)
      motifs.push({
        top: `${y.toFixed(2)}%`,
        left: `${x.toFixed(2)}%`,
        size,
        rotate: Math.round((rand() * 26 - 13) * 10) / 10,
        blood: BLOOD_GLYPHS.has(glyph) || rand() < 0.2,
        glyph,
      })
    }
  })

  return motifs
})()


type GlyphName =
  | 'glass'
  | 'hat'
  | 'mark'
  | 'key'
  | 'foot'
  | 'grid'
  | 'note'
  | 'pencil'
  | 'letter'
  | 'bulb'
  | 'piece'
  | 'eye'
  | 'watch'
  | 'specs'
  | 'candle'
  | 'cup'
  | 'map'
  | 'lock'
  | 'pipe'
  | 'badge'
  | 'cuff'
  | 'bottle'
  | 'compass'
  | 'lantern'
  | 'hourglass'
  | 'camera'
  | 'book'
  | 'knife'
  | 'splatter'
  | 'pistol'
  | 'car'
  | 'paper'
  | 'diary'
  | 'house'
  | 'cigarette'
  | 'wine'

function Glyph({ name }: { name: GlyphName }) {
  const common = {
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg className="block h-auto w-full" viewBox="0 0 24 24" aria-hidden="true" shapeRendering="geometricPrecision">
      <g {...common} stroke="var(--motif-edge)" strokeWidth="2.7">
        <MotifShape name={name} />
      </g>
      <g {...common} stroke="currentColor" strokeWidth="1.45">
        <MotifShape name={name} />
      </g>
    </svg>
  )
}
function MotifShape({ name }: { name: GlyphName }) {
  return (
    <>
      {name === 'glass' && (
        <>
          <circle cx="10" cy="10" r="5.5" />
          <path d="M14.2 14.2 20 20" />
        </>
      )}
      {name === 'hat' && (
        <>
          <path d="M2.2 16.4c2.6-1.1 5.4-1.7 9.8-1.7s7.2.6 9.8 1.7c-2.4 1.6-5.6 2.5-9.8 2.5s-7.4-.9-9.8-2.5Z" />
          <path d="M8 14.8c.15-4.6 1.7-8 4-8s3.85 3.4 4 8" />
          <path d="M8.5 12h7" />
        </>
      )}
      {name === 'mark' && (
        <>
          <path d="M9.2 8.4a2.8 2.8 0 1 1 4.2 2.4c-.8.5-1.4 1.1-1.4 2.1" />
          <path d="M12 16.6h.1" />
        </>
      )}
      {name === 'key' && (
        <>
          <circle cx="8" cy="9.2" r="3.3" />
          <circle cx="8" cy="9.2" r="1.15" />
          <path d="M11 10.6 19.2 16.4" />
          <path d="M15.4 14.2v2.2" />
          <path d="M17.6 15.6v2.2" />
        </>
      )}
      {name === 'foot' && (
        <>
          <ellipse cx="12" cy="15.5" rx="3.2" ry="4.2" />
          <circle cx="8.2" cy="9.2" r="1.1" />
          <circle cx="11" cy="7.4" r="1.1" />
          <circle cx="14" cy="7.8" r="1.1" />
          <circle cx="16.2" cy="10" r="1" />
        </>
      )}
      {name === 'grid' && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16" />
        </>
      )}
      {name === 'note' && (
        <>
          <path d="M7 4.5h8l3 3V19.5H7z" />
          <path d="M15 4.5V8h3" />
          <path d="M9.5 12h5M9.5 15.5h4" />
        </>
      )}
      {name === 'pencil' && (
        <>
          <path d="M14 5.5 18.5 10 9 19.5H4.5V15z" />
          <path d="M12.5 7 17 11.5" />
        </>
      )}
      {name === 'letter' && (
        <>
          <rect x="3.5" y="6" width="17" height="12" rx="1.2" />
          <path d="M4 7.2 12 13l8-5.8" />
        </>
      )}
      {name === 'bulb' && (
        <>
          <path d="M9 17.5h6" />
          <path d="M9.5 19.5h5" />
          <path d="M8.2 14a4.8 4.8 0 1 1 7.6 0c-.6.7-1.1 1.4-1.2 2.3H9.4c-.1-.9-.6-1.6-1.2-2.3Z" />
        </>
      )}
      {name === 'piece' && (
        <>
          <path d="M8 4.5h3.1c.1 1.5 1.1 2.5 2.4 2.5s2.3-1 2.4-2.5H19V8c-1.5.1-2.5 1.1-2.5 2.4s1 2.3 2.5 2.4v3.7h-3.1c-.1-1.5-1.1-2.5-2.4-2.5s-2.3 1-2.4 2.5H8V4.5z" />
        </>
      )}
      {name === 'eye' && (
        <>
          <path d="M3 12s3.5-5.5 9-5.5S21 12 21 12s-3.5 5.5-9 5.5S3 12 3 12Z" />
          <circle cx="12" cy="12" r="2.2" />
        </>
      )}
      {name === 'watch' && (
        <>
          <circle cx="12" cy="13" r="5.2" />
          <path d="M12 13V10.2" />
          <path d="M12 13h2.4" />
          <path d="M10 5.2h4l-.6 2.2h-2.8zM10 18.8h4l-.6-2.2h-2.8z" />
        </>
      )}
      {name === 'specs' && (
        <>
          <circle cx="7.5" cy="12" r="3.2" />
          <circle cx="16.5" cy="12" r="3.2" />
          <path d="M10.7 12h2.6" />
          <path d="M4.3 12H3M21 12h-1.3" />
        </>
      )}
      {name === 'candle' && (
        <>
          <path d="M9 21h6" />
          <path d="M10 21V11h4v10" />
          <path d="M12 8.5c.8-1.2.8-2.2 0-3.5-.8 1.3-.8 2.3 0 3.5Z" />
        </>
      )}
      {name === 'cup' && (
        <>
          <path d="M6 8h10v5.5a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z" />
          <path d="M16 9.5h2.2a2 2 0 0 1 0 4H16" />
          <path d="M8 4.8c.4.8.4 1.4 0 2.2M11 4.8c.4.8.4 1.4 0 2.2" />
        </>
      )}
      {name === 'map' && (
        <>
          <path d="M8 5.5 4.5 7v11L8 16.5l4 2 4-2 3.5 1.5V7L16 5.5l-4 2z" />
          <path d="M8 5.5v11M12 7.5v11" />
        </>
      )}
      {name === 'lock' && (
        <>
          <rect x="6" y="10.5" width="12" height="8" rx="1.4" />
          <path d="M8.5 10.5V8.2a3.5 3.5 0 0 1 7 0v2.3" />
        </>
      )}
      {name === 'pipe' && (
        <>
          <path d="M2.4 13.2h10.2" />
          <path d="M12.6 8.8v4.6c0 3.4 2.2 5.2 4.4 5.2 2.6 0 4.4-1.8 4.4-4.4V8.8" />
          <path d="M15.4 8.6c.5-1.5 1.4-2.4 2.6-2.4" />
        </>
      )}
      {name === 'badge' && (
        <>
          <path d="M12 3.2 19 6v5.2c0 4.2-2.8 7.2-7 9.2-4.2-2-7-5-7-9.2V6Z" />
          <path d="M12 8.2v4.2M10 10.3h4" />
        </>
      )}
      {name === 'cuff' && (
        <>
          <circle cx="7.2" cy="10" r="3.1" />
          <circle cx="16.2" cy="14.2" r="3.1" />
          <path d="M10 11.2c1.2.6 2.2 1.4 2.8 2.4" />
        </>
      )}
      {name === 'book' && (
        <>
          <path d="M4.5 6.2c1.2-.8 3.2-1.2 7.5-1.2s6.3.4 7.5 1.2v12.2c-1.2-.7-3.2-1-7.5-1s-6.3.3-7.5 1Z" />
          <path d="M12 5v12.4" />
        </>
      )}
      {name === 'knife' && (
        <path
          fill="currentColor"
          d="M2.2 12.2c0-.7.6-1.2 1.3-1.2h4.4V9.6h2.4v1.4h.8L21.6 6.2l.6 2L11.4 13.4h-.6v1.2H8V16H3.5c-.7 0-1.3-.5-1.3-1.2v-2.6Z"
        />
      )}
      {name === 'splatter' && (
        <>
          <path
            fill="currentColor"
            d="M11.2 7.4c1.6-2.2 4.2-.4 3.6 1.8 1.8-.2 3.2 1.6 2.2 3.2 1.6 1 .8 3.2-1.1 3.8.6 1.8-1.4 3.4-3.1 2.6-1 1.8-3.4 1.6-4.2-.2-2 .6-3.6-1.2-2.8-3.2-1.8-.8-2.2-3.2-.4-4.2-.6-1.8.8-3.6 2.4-3.4.6-1.2 1.8-1.8 3.4-.4Z"
          />
          <path fill="currentColor" d="M5.6 6.2c1-.8 2.2.4 1.4 1.6-1 .8-2.2-.2-1.4-1.6Z" />
          <path fill="currentColor" d="M17.8 5.2c1.1.2 1.4 1.6.3 2.2-1.2.4-2-.8-1.2-1.8.2-.2.6-.4.9-.4Z" />
          <path fill="currentColor" d="M18.6 13.6c.8 1.6-.6 3-2 2.2-.8-.6-.2-2 .6-2.6.6-.2 1 .0 1.4.4Z" />
          <path fill="currentColor" d="M6.8 15.4c-.2 1.5 1.4 2.4 2.2 1.1.6-.9-.1-2.1-1.2-2-.6.1-.9.4-1 .9Z" />
        </>
      )}
      {name === 'pistol' && (
        <>
          <path
            fill="currentColor"
            d="M3.2 8.2h11.4l1.3-2h5.3v3.1h-3.2v1.5H12.4l-.8 1.5L10 19.4H6.4l2.1-7.2H3.2V8.2Z"
          />
          <path d="M12.2 12.6c2.2.3 3.2 1.5 2.7 3" />
        </>
      )}
      {name === 'car' && (
        <>
          <path fill="currentColor" d="M2.4 15.2 5.2 10.4h6.4l2.8-3.8h4.4l2.6 4H21.6v4.8H2.4Z" />
          <path d="M8.4 10.4 10.6 6.8" />
          <circle cx="7.2" cy="17.5" r="2.05" />
          <circle cx="16.8" cy="17.5" r="2.05" />
        </>
      )}
      {name === 'paper' && (
        <>
          <path d="M6 4.2h11.2A1.4 1.4 0 0 1 18.6 5.6v11.6a1.6 1.6 0 0 0 1.6 1.6H7.2A2.2 2.2 0 0 1 5 16.6V6.2A2 2 0 0 1 7 4.2" />
          <rect x="8.2" y="6.6" width="7.2" height="3.6" rx="0.4" />
          <path d="M8.2 12.2h7.2M8.2 14.6h5" />
        </>
      )}
      {name === 'diary' && (
        <>
          <path d="M6.2 4.4h10.6A1.4 1.4 0 0 1 18.2 5.8v12.4a1.4 1.4 0 0 1-1.4 1.4H7.4A2 2 0 0 1 5.4 17.6V6.2A1.8 1.8 0 0 1 7.2 4.4" />
          <path d="M5.4 7.2h2.2M5.4 12h2.2M5.4 16.8h2.2" />
          <rect x="13.2" y="10.2" width="2.6" height="3.4" rx="0.4" />
        </>
      )}
      {name === 'house' && (
        <>
          <path d="M3.6 11.2 12 4.2l8.4 7" />
          <path d="M6 10.4V19.4h12V10.4" />
          <path d="M10.2 19.4v-4.8h3.6v4.8" />
        </>
      )}
      {name === 'cigarette' && (
        <>
          <rect x="6.2" y="14.2" width="13" height="3.2" rx="1.5" />
          <path d="M15.4 14.2v3.2" />
          <path d="M8.8 12.2c.7-.8.7-1.5 0-2.4" />
          <path d="M11.4 11.4c.8-.9.8-1.8 0-2.8" />
          <path d="M13.8 10.2c.6-.7.6-1.4 0-2.2" />
        </>
      )}
      {name === 'wine' && (
        <>
          <path d="M8 3.6h8c-.2 3-.8 5-2.2 6.4A3.6 3.6 0 0 1 12 12.2 3.6 3.6 0 0 1 10.2 10C8.8 8.6 8.2 6.6 8 3.6Z" />
          <path d="M12 12.2V18.6" />
          <path d="M8.4 19.6h7.2" />
        </>
      )}
      {name === 'bottle' && (
        <>
          <path d="M10.2 3.4h3.6V6l1.8 2.2v9.2a1.6 1.6 0 0 1-1.6 1.6h-4a1.6 1.6 0 0 1-1.6-1.6V8.2L10.2 6Z" />
          <path d="M8.6 12.4h6.8" />
        </>
      )}
      {name === 'compass' && (
        <>
          <circle cx="12" cy="12" r="7.2" />
          <path d="M14.8 9.2 13 13l-3.8 1.8L11 11Z" />
          <path d="M12 4.8v1.4M12 17.8v1.4M4.8 12h1.4M17.8 12h1.4" />
        </>
      )}
      {name === 'lantern' && (
        <>
          <path d="M9.5 5.2h5" />
          <path d="M10.2 5.2 9 8h6l-1.2-2.8" />
          <rect x="7.5" y="8" width="9" height="9.2" rx="1.4" />
          <path d="M12 17.2v2.2M9.5 19.4h5" />
        </>
      )}
      {name === 'hourglass' && (
        <>
          <path d="M7.2 4.4h9.6" />
          <path d="M7.2 19.6h9.6" />
          <path d="M8.2 4.4 12 12 8.2 19.6" />
          <path d="M15.8 4.4 12 12 15.8 19.6" />
        </>
      )}
      {name === 'camera' && (
        <>
          <path d="M8 7.2h2.2l1.2-1.6h2.2L15 7.2H18a1.4 1.4 0 0 1 1.4 1.4v8.2A1.4 1.4 0 0 1 18 18.2H6a1.4 1.4 0 0 1-1.4-1.4V8.6A1.4 1.4 0 0 1 6 7.2Z" />
          <circle cx="12" cy="12.4" r="2.6" />
        </>
      )}
    </>
  )
}

export default function BackgroundMotifs() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const heading = document.querySelector('h1')
    if (!root || !heading) return

    const clearHeading = () => {
      const box = heading.getBoundingClientRect()
      const pad = 14
      for (const node of root.querySelectorAll<HTMLElement>('[data-glyph]')) {
        const rect = node.getBoundingClientRect()
        const overlaps =
          rect.left < box.right + pad &&
          rect.right > box.left - pad &&
          rect.top < box.bottom + pad &&
          rect.bottom > box.top - pad
        node.style.visibility = overlaps ? 'hidden' : ''
      }
    }

    clearHeading()
    document.fonts?.ready.then(clearHeading).catch(() => {})
    window.addEventListener('resize', clearHeading)
    return () => window.removeEventListener('resize', clearHeading)
  }, [])

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {MOTIFS.map((motif) => (
        <span
          key={`${motif.glyph}-${motif.top}-${motif.left}`}
          data-glyph={motif.glyph}
          className={`motif absolute ${motif.blood ? 'motif-blood' : ''}`}
          style={{
            top: motif.top,
            left: motif.left,
            width: motif.size,
            transform: `rotate(${motif.rotate}deg)`,
          }}
        >
          <Glyph name={motif.glyph} />
        </span>
      ))}
    </div>
  )
}
