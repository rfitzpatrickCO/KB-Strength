import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'fs'

// Kettlebell on orange rounded-square background
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Orange background with rounded corners -->
  <rect width="512" height="512" rx="96" fill="#CC1F1F"/>

  <!-- Kettlebell handle (thick outer arch) -->
  <path d="M152,290 L152,218 C152,130 360,130 360,218 L360,290"
        fill="none" stroke="white" stroke-width="56"
        stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Cut out the inside of the handle to make it hollow -->
  <path d="M184,290 L184,224 C184,172 328,172 328,224 L328,290"
        fill="none" stroke="#CC1F1F" stroke-width="28"
        stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Kettlebell body (large circle) -->
  <circle cx="256" cy="358" r="134" fill="white"/>

  <!-- Flat base -->
  <rect x="164" y="454" width="184" height="36" rx="18" fill="white"/>

  <!-- Subtle shading line on ball for depth -->
  <circle cx="256" cy="358" r="134" fill="none"
          stroke="#CC1F1F" stroke-width="0"/>
</svg>
`

const ICONS = [
  { filename: 'public/apple-touch-icon.png', size: 180 },
  { filename: 'public/pwa-192.png',          size: 192 },
  { filename: 'public/pwa-512.png',          size: 512 },
  { filename: 'public/favicon-32.png',       size: 32  },
]

for (const { filename, size } of ICONS) {
  const resvg = new Resvg(SVG, {
    fitTo: { mode: 'width', value: size },
  })
  const png = resvg.render().asPng()
  writeFileSync(filename, png)
  console.log(`✓ ${filename} (${size}×${size})`)
}
