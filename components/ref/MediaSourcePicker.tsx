'use client'

import { cn } from '@/lib/utils'
import type { MediaSourceType } from '@/lib/types'

// ─── SVG Logos (inline, no external deps) ────────────────────────────────────

function TikTokLogo() {
  return (
    <svg viewBox='0 0 352.28 398.67' className='w-full h-full'>
      <path
        d='M137.17 156.98v-15.56c-5.34-.73-10.76-1.18-16.29-1.18C54.23 140.24 0 194.47 0 261.13c0 40.9 20.43 77.09 51.61 98.97-20.12-21.6-32.46-50.53-32.46-82.31 0-65.7 52.69-119.28 118.03-120.81Z'
        fill='#25f4ee'
      />
      <path
        d='M140.02 333c29.74 0 54-23.66 55.1-53.13l.11-263.2h48.08a71.04 71.04 0 0 1-1.55-16.67h-65.67l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-9.24 0-17.95-2.31-25.61-6.34C105.3 323.9 121.6 333 140.02 333ZM333.13 106V91.37c-18.34 0-35.43-5.45-49.76-14.8 12.76 14.65 30.09 25.22 49.76 29.43Z'
        fill='#25f4ee'
      />
      <path
        d='M283.38 76.57c-13.98-16.05-22.47-37-22.47-59.91h-17.59c4.63 25.02 19.48 46.49 40.06 59.91ZM120.88 205.92c-30.44 0-55.21 24.77-55.21 55.21 0 21.2 12.03 39.62 29.6 48.86-6.55-9.08-10.45-20.18-10.45-32.2 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-67.05c-5.34-.73-10.76-1.18-16.29-1.18-.96 0-1.9.05-2.85.07v51.49c-5.16-1.61-10.61-2.55-16.29-2.55Z'
        fill='#fe2c55'
      />
      <path
        d='M333.13 106v51.04c-34.05 0-65.61-10.89-91.37-29.38v133.47c0 66.66-54.23 120.88-120.88 120.88-25.76 0-49.64-8.12-69.28-21.91 22.08 23.71 53.54 38.57 88.42 38.57 66.66 0 120.88-54.23 120.88-120.88V144.33c25.76 18.49 57.32 29.38 91.37 29.38v-65.68c-6.57 0-12.97-.71-19.14-2.03Z'
        fill='#fe2c55'
      />
      <path d='M241.76 261.13V127.66c25.76 18.49 57.32 29.38 91.37 29.38V106c-19.67-4.21-37-14.77-49.76-29.43-20.58-13.42-35.43-34.88-40.06-59.91h-48.08l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-18.42 0-34.72-9.1-44.75-23.01-17.57-9.25-29.6-27.67-29.6-48.86 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-51.49C71.83 158.5 19.14 212.08 19.14 277.78c0 31.78 12.34 60.71 32.46 82.31C71.23 373.87 95.12 382 120.88 382c66.65 0 120.88-54.23 120.88-120.88Z' />
    </svg>
  )
}

function YouTubeLogo() {
  return (
    <svg viewBox='0 0 24 24' className='w-full h-full'>
      <path
        d='M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.97 24 12 24 12s0-3.97-.5-5.81z'
        fill='#FF0000'
      />
      <path d='M9.75 15.52V8.48L15.83 12l-6.08 3.52z' fill='#fff' />
    </svg>
  )
}

function InstagramLogo() {
  return (
    <svg viewBox='0 0 24 24' className='w-full h-full'>
      <defs>
        <linearGradient id='ig-msp' x1='0%' y1='100%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor='#FFC107' />
          <stop offset='25%' stopColor='#F44336' />
          <stop offset='65%' stopColor='#E91E63' />
          <stop offset='100%' stopColor='#9C27B0' />
        </linearGradient>
      </defs>
      <path
        d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'
        fill='url(#ig-msp)'
      />
    </svg>
  )
}

function FacebookLogo() {
  return (
    <svg viewBox='0 0 24 24' className='w-full h-full'>
      <circle cx='12' cy='12' r='12' fill='#1877F2' />
      <path
        d='M16.5 8h-2c-.6 0-1 .4-1 1v2h3l-.5 3h-2.5v7h-3v-7H9v-3h1.5V9c0-2.2 1.3-3.5 3.5-3.5h2.5V8z'
        fill='white'
      />
    </svg>
  )
}

function TwitterXLogo() {
  return (
    <svg viewBox='0 0 24 24' className='w-full h-full'>
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L2.25 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
    </svg>
  )
}

function SpotifyLogo() {
  return (
    <svg viewBox='0 0 24 24' className='w-full h-full'>
      <path
        d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z'
        fill='#1DB954'
      />
    </svg>
  )
}

function SoundCloudLogo() {
  return (
    <svg viewBox='0 0 24 16' className='w-full h-full'>
      <path
        d='M0 11.5a2.5 2.5 0 0 0 2.5 2.5h17a3 3 0 0 0 .545-5.952A4 4 0 0 0 12.5 4.5a4.01 4.01 0 0 0-1.356.235A3.5 3.5 0 0 0 5.05 7.14 3 3 0 0 0 0 10v1.5z'
        fill='#FF5500'
      />
      <rect x='1' y='9' width='1' height='4' rx='.5' fill='#FF3300' opacity='.6' />
      <rect x='3.2' y='7.5' width='1' height='5.5' rx='.5' fill='#FF3300' opacity='.7' />
    </svg>
  )
}

function GoogleMapsLogo() {
  return (
    <svg viewBox='0 0 92.3 132.3' className='w-full h-full'>
      <path
        fill='#1a73e8'
        d='M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z'
      />
      <path
        fill='#ea4335'
        d='M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z'
      />
      <path
        fill='#4285f4'
        d='M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3'
      />
      <path
        fill='#fbbc04'
        d='M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3'
      />
      <path
        fill='#34a853'
        d='M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2'
      />
    </svg>
  )
}

// ─── Illustrations ────────────────────────────────────────────────────────────

/** Deux bulles de speech qui se chevauchent — pour Mot/Expression */
function SpeechBubbles() {
  return (
    <svg viewBox='0 0 52 40' fill='none' className='w-full h-full'>
      {/* Bulle arrière (crème) */}
      <path
        d='M2 2h28a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H18l-6 7V23H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z'
        fill='var(--accent2)'
        stroke='var(--fg)'
        strokeWidth='1.5'
        strokeOpacity='.35'
      />
      {/* Bulle avant (corail) */}
      <path
        d='M21 12h26a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H35l-5 6V30H24a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z'
        fill='var(--accent1)'
      />
      {/* Points de parole */}
      <circle cx='31' cy='21' r='2.5' fill='white' />
      <circle cx='37' cy='21' r='2.5' fill='white' />
      <circle cx='43' cy='21' r='2.5' fill='white' />
    </svg>
  )
}

/** Troll face simplifié — pour Image/Meme */
function TrollFace() {
  return (
    <svg viewBox='0 0 44 46' fill='none' className='w-full h-full'>
      {/* Visage */}
      <ellipse cx='22' cy='22' rx='20' ry='18' fill='#d4a76a' />
      {/* Menton proéminent */}
      <ellipse cx='22' cy='36' rx='11' ry='5.5' fill='#c8a060' />
      {/* Sourcils inclinés vers l'intérieur */}
      <path
        d='M10 14 Q16 10 20 13'
        stroke='#7a5c10'
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
      />
      <path
        d='M24 13 Q28 10 34 14'
        stroke='#7a5c10'
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
      />
      {/* Yeux */}
      <ellipse cx='16' cy='19' rx='4' ry='4.5' fill='white' />
      <ellipse cx='28' cy='19' rx='4' ry='4.5' fill='white' />
      <circle cx='16' cy='19.5' r='2.5' fill='#222' />
      <circle cx='28' cy='19.5' r='2.5' fill='#222' />
      {/* Grand sourire rectangulaire (le troll grin) */}
      <rect x='9' y='30' width='26' height='11' rx='2' fill='#3a2a1a' />
      {/* Dents */}
      <rect x='11' y='30' width='4.5' height='8' rx='.5' fill='white' />
      <rect x='16.5' y='30' width='4' height='9' rx='.5' fill='white' />
      <rect x='21.5' y='30' width='4' height='9' rx='.5' fill='white' />
      <rect x='26.5' y='30' width='4.5' height='8' rx='.5' fill='white' />
      {/* Joues */}
      <ellipse cx='8' cy='27' rx='4' ry='3' fill='#e09060' opacity='.4' />
      <ellipse cx='36' cy='27' rx='4' ry='3' fill='#e09060' opacity='.4' />
    </svg>
  )
}

/** Cintre — pour Vêtement/Look */
function HangerIcon() {
  return (
    <svg
      viewBox='0 0 40 36'
      fill='none'
      className='w-full h-full'
      stroke='currentColor'
      strokeWidth='2.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      {/* Crochet */}
      <path d='M20 3 Q26 3 26 9 Q26 14 20 16' />
      {/* Corps triangle */}
      <path d='M20 16 L3 30' />
      <path d='M20 16 L37 30' />
      {/* Barre basse */}
      <path d='M1 30 Q1 33 3 33 L37 33 Q39 33 39 30' />
    </svg>
  )
}

// ─── LogoStack ────────────────────────────────────────────────────────────────

interface LogoItem {
  logo: React.ReactNode
  label: string
}

function LogoStack({ logos }: { logos: LogoItem[] }) {
  return (
    <div className='flex items-center'>
      {logos.map((item, i) => (
        <div
          key={i}
          className={cn(
            'relative w-8 h-8 rounded-full bg-white border border-black/10',
            'flex items-center justify-center overflow-hidden p-[5px]',
            i > 0 && '-ml-2',
          )}
          style={{ zIndex: logos.length - i }}
          title={item.label}
        >
          {item.logo}
        </div>
      ))}
    </div>
  )
}

// ─── Sources config ───────────────────────────────────────────────────────────

type SourceConfig = {
  type: MediaSourceType
  label: string
  hint: string
  description: string
  glowColor: string
  visual: React.ReactNode
  size: 'wide' | 'normal'
}

const SOURCES: SourceConfig[] = [
  {
    type: 'video',
    size: 'wide',
    label: 'Vidéo / Short',
    hint: 'TikTok · YouTube · Reels · Facebook',
    description:
      "Une vidéo qui a buzzé, lancé un trend ou fait le tour d'internet. Shorts, Reels, TikToks — peu importe la plateforme.",
    glowColor: '#FF0050',
    visual: (
      <LogoStack
        logos={[
          { logo: <TikTokLogo />, label: 'TikTok' },
          { logo: <YouTubeLogo />, label: 'YouTube' },
          { logo: <InstagramLogo />, label: 'Instagram' },
          { logo: <FacebookLogo />, label: 'Facebook' },
        ]}
      />
    ),
  },
  {
    type: 'tweet',
    size: 'normal',
    label: 'Tweet / Post',
    hint: 'Un post X qui a fait le tour',
    description: '',
    glowColor: '#E7E9EA',
    visual: <LogoStack logos={[{ logo: <TwitterXLogo />, label: 'Twitter/X' }]} />,
  },
  {
    type: 'audio',
    size: 'normal',
    label: 'Son / Musique',
    hint: 'Spotify · SoundCloud · son viral',
    description: '',
    glowColor: '#1DB954',
    visual: (
      <LogoStack
        logos={[
          { logo: <SpotifyLogo />, label: 'Spotify' },
          { logo: <SoundCloudLogo />, label: 'SoundCloud' },
        ]}
      />
    ),
  },
  {
    type: 'expression',
    size: 'wide',
    label: 'Mot / Expression',
    hint: 'Un mot, une vanne, une phrase culte',
    description:
      "Ce truc qu'on dit depuis un tweet il y a 3 ans sans savoir pourquoi. Verlan, punchline, running gag \u2014 les mots qui font partie du lexique.",
    glowColor: '#ed6a5a',
    visual: <SpeechBubbles />,
  },
  {
    type: 'location',
    size: 'wide',
    label: 'Lieu / IRL',
    hint: 'Un spot, un quartier, une adresse',
    description:
      "Un endroit qui a marqu\u00e9 la culture \u2014 le quartier dont tout le monde parle, le spot l\u00e9gendaire, l'adresse qui a fait l'histoire.",
    glowColor: '#4285F4',
    visual: <LogoStack logos={[{ logo: <GoogleMapsLogo />, label: 'Google Maps' }]} />,
  },
  {
    type: 'image',
    size: 'wide',
    label: 'Image / Meme',
    hint: 'Le format qui revient tous les 6 mois',
    description:
      "Le meme que t'as screenshot 12 fois, le template recycl\u00e9 \u00e0 l'infini, le visuel qui r\u00e9sume une situation mieux que mille mots.",
    glowColor: '#C13584',
    visual: <TrollFace />,
  },
  {
    type: 'outfit',
    size: 'wide',
    label: 'Vêtement / Look',
    hint: 'La pièce, le style, la collab iconic',
    description:
      "Le v\u00eatement qui d\u00e9finissait une \u00e9poque, la collab qui a tout vendu en 2 minutes, le look qu'on reconna\u00eet au premier coup d'\u0153il.",
    glowColor: '#b6a6fe',
    visual: (
      <div className='w-10 h-10 text-[var(--accent4)]'>
        <HangerIcon />
      </div>
    ),
  },
]

// ─── MediaSourcePicker ────────────────────────────────────────────────────────

interface MediaSourcePickerProps {
  onSelect: (type: MediaSourceType) => void
  selected?: MediaSourceType | null
}

export function MediaSourcePicker({ onSelect, selected }: MediaSourcePickerProps) {
  return (
    <>
      <style>{`
        @property --msp-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes msp-spin {
          to { --msp-angle: 360deg; }
        }
        @keyframes msp-card-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msp-card {
          animation: msp-card-in 0.4s ease both;
        }
        .msp-card[data-selected] {
          animation: msp-spin 2s linear infinite !important;
        }
      `}</style>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {SOURCES.map((source, i) => {
          const isSelected = selected === source.type
          const isWide = source.size === 'wide'

          return (
            <button
              key={source.type}
              type='button'
              data-selected={isSelected ? '' : undefined}
              onClick={() => onSelect(source.type)}
              className={cn(
                'msp-card group flex flex-col justify-between rounded-2xl text-left transition-all duration-200',
                isWide ? 'col-span-2 p-5 min-h-[120px]' : 'col-span-1 p-4 min-h-[100px]',
                isSelected && 'scale-[1.015]',
              )}
              style={
                {
                  animationDelay: `${i * 50}ms`,
                  background: isSelected
                    ? `linear-gradient(var(--bg2), var(--bg)) padding-box,
                     conic-gradient(from var(--msp-angle), ${source.glowColor} 0deg, transparent 60deg, transparent 300deg, ${source.glowColor} 360deg) border-box`
                    : 'var(--bg)',
                  border: isSelected ? '2px solid transparent' : '2px solid rgba(20,20,20,0.08)',
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (!isSelected) {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = `${source.glowColor}80`
                  el.style.boxShadow = `0 0 16px 2px ${source.glowColor}25`
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = ''
                  el.style.boxShadow = ''
                }
              }}
            >
              {/* Visual */}
              <div className={cn('flex items-center', isWide ? 'h-10 mb-4' : 'h-8 mb-3')}>
                {source.visual}
              </div>

              {/* Text */}
              <div className='flex flex-col gap-1'>
                <span
                  className={cn(
                    'font-pprader uppercase font-bold leading-none text-[var(--fg)]',
                    isWide ? 'text-base' : 'text-sm',
                  )}
                >
                  {source.label}
                </span>
                {isWide && source.description ? (
                  <span
                    className='font-supplymono text-[10px] leading-[1.4]'
                    style={{ color: 'rgba(20,20,20,0.5)' }}
                  >
                    {source.description}
                  </span>
                ) : (
                  <span
                    className='font-supplymono text-[10px] leading-tight'
                    style={{ color: 'rgba(20,20,20,0.5)' }}
                  >
                    {source.hint}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
