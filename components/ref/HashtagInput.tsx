'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type HashtagSuggestion = { label: string; count: number }

type HashtagInputProps = {
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
}

const GHOST_SUGGESTIONS = ['deepfake', 'montage', 'parodie', 'edit']

function normalizeTag(raw: string): string {
  return raw.replace(/^#+/, '').trim().toLowerCase()
}

export function HashtagInput({ value, onChange, maxTags = 10 }: HashtagInputProps) {
  const [inputText, setInputText] = useState('')
  const [suggestions, setSuggestions] = useState<HashtagSuggestion[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const atMax = value.length >= maxTags

  const addTag = useCallback(
    (raw: string) => {
      const tag = normalizeTag(raw)
      if (!tag || value.includes(tag) || value.length >= maxTags) return
      onChange([...value, tag])
    },
    [value, onChange, maxTags],
  )

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (inputText.trim()) {
        addTag(inputText)
        setInputText('')
        setSuggestions([])
        setDropdownOpen(false)
      }
    }
    if (e.key === 'Escape') {
      setDropdownOpen(false)
    }
    if (e.key === 'Backspace' && inputText === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }

  // Debounced autocomplete fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = normalizeTag(inputText)
    if (q.length < 2) {
      setSuggestions([])
      setDropdownOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/hashtags?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        const results: HashtagSuggestion[] = data.hashtags ?? []
        // Filter out already-added tags
        const filtered = results.filter((s) => !value.includes(s.label))
        setSuggestions(filtered)
        setDropdownOpen(filtered.length > 0)
      } catch {
        setSuggestions([])
        setDropdownOpen(false)
      }
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [inputText, value])

  const handleSuggestionClick = (label: string) => {
    addTag(label)
    setInputText('')
    setSuggestions([])
    setDropdownOpen(false)
    inputRef.current?.focus()
  }

  const handleBlur = () => {
    setTimeout(() => setDropdownOpen(false), 150)
  }

  return (
    <div className='flex flex-col gap-2'>
      <label className='text-sm font-medium text-[var(--fg)]'>
        Hashtags{' '}
        <span className='text-[var(--fg)]/40 font-normal font-supplymono'>(optionnel)</span>
      </label>
      <p className='text-xs text-[var(--fg)]/50 -mt-1'>
        Ajoute des précisions que les catégories ne couvrent pas
      </p>

      <div
        ref={containerRef}
        className={cn(
          'relative flex flex-wrap gap-1.5 min-h-10 p-2 rounded-lg border border-border bg-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0',
          atMax && 'opacity-60',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Pills */}
        {value.map((tag) => (
          <span
            key={tag}
            className='flex items-center gap-1.5 bg-[var(--fg)] text-[var(--bg)] border border-[var(--fg)] rounded-full px-2.5 py-0.5 text-xs font-supplymono'
          >
            #{tag}
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className='hover:opacity-60 transition-opacity'
              aria-label={`Retirer #${tag}`}
            >
              <X className='w-3 h-3' />
            </button>
          </span>
        ))}

        {/* Ghost suggestions — shown when empty */}
        {value.length === 0 && inputText === '' && (
          <span className='flex items-center gap-1.5 pointer-events-none select-none'>
            {GHOST_SUGGESTIONS.map((g) => (
              <span
                key={g}
                className='flex items-center gap-1 border border-dashed border-[var(--fg)]/20 text-[var(--fg)]/30 rounded-full px-2.5 py-0.5 text-xs font-supplymono'
              >
                #{g}
              </span>
            ))}
          </span>
        )}

        {/* Input */}
        {!atMax && (
          <input
            ref={inputRef}
            type='text'
            value={inputText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={value.length === 0 ? 'Tape un mot + Espace' : ''}
            className='flex-1 min-w-24 bg-transparent outline-none text-sm text-[var(--fg)] placeholder:text-[var(--fg)]/30'
            aria-label='Ajouter un hashtag'
          />
        )}

        {/* Dropdown */}
        {dropdownOpen && suggestions.length > 0 && (
          <div className='absolute left-0 top-full mt-1 z-50 w-full max-w-xs bg-background border border-border rounded-lg shadow-lg overflow-hidden'>
            {suggestions.map((s) => (
              <button
                key={s.label}
                type='button'
                onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                onClick={() => handleSuggestionClick(s.label)}
                className='flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-[var(--bg2)] transition-colors text-left'
              >
                <span className='font-supplymono text-[var(--fg)]'>#{s.label}</span>
                <span className='text-xs text-[var(--fg)]/40 tabular-nums'>{s.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {atMax && (
        <p className='text-xs text-[var(--fg)]/40'>Maximum {maxTags} hashtags atteint.</p>
      )}
    </div>
  )
}
