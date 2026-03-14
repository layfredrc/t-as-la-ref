'use client'

import { cn } from '@/lib/utils'
import type { Tag } from '@/lib/types'

type TagSelectorProps = {
  tags: Tag[]
  selected: string | null
  onChange: (id: string) => void
  label: string
}

export function TagSelector({ tags, selected, onChange, label }: TagSelectorProps) {
  return (
    <div className='flex flex-col gap-3'>
      <p className='text-sm font-medium text-foreground'>{label}</p>
      <div className='flex flex-wrap gap-2'>
        {tags.map((tag) => (
          <button
            key={tag.id}
            type='button'
            onClick={() => onChange(tag.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
              'hover:border-purple-500 hover:bg-purple-500/10',
              selected === tag.id
                ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-medium'
                : 'border-border bg-muted/30 text-muted-foreground',
            )}
          >
            <span>{tag.emoji}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
