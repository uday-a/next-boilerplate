'use client'

import * as React from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type CommentItem } from '@/lib/use-kanban'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { UserAvatar } from './UserAvatar'

export function CommentList({
  comments,
  compact = false,
  onAdd,
}: {
  comments: CommentItem[]
  compact?: boolean
  onAdd?: (text: string) => void
}) {
  const [newComment, setNewComment] = React.useState('')

  function submit() {
    const stripped = newComment.replace(/<[^>]*>/g, '').trim()
    if (!stripped) return
    onAdd?.(newComment)
    setNewComment('')
  }

  return (
    <>
      {comments.length ? (
        <div className={compact ? 'space-y-3' : 'space-y-4'}>
          {comments.map((comment) => (
            <div key={comment.id} className={compact ? 'flex gap-2.5' : 'flex gap-3'}>
              <UserAvatar name={comment.author} color={comment.authorColor} size={compact ? 'xs' : 'sm'} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className={compact ? 'text-[12px] font-semibold' : 'text-[13px] font-semibold'}>
                    {compact ? comment.author.split(' ')[0] : comment.author}
                  </span>
                  <span
                    className={
                      compact ? 'text-muted-foreground text-[10px]' : 'text-muted-foreground text-[11px]'
                    }
                  >
                    {comment.time}
                  </span>
                </div>
                <div
                  className={cn(
                    'rich-text-content prose prose-sm dark:prose-invert mt-0.5 max-w-none',
                    compact
                      ? 'text-muted-foreground text-[12px] leading-relaxed'
                      : 'text-muted-foreground text-[13px] leading-relaxed',
                  )}
                  dangerouslySetInnerHTML={{ __html: comment.text }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={compact ? 'text-muted-foreground text-[12px]' : 'text-muted-foreground text-sm'}>
          No comments yet.
        </p>
      )}

      <div className={compact ? 'mt-3 flex gap-2' : 'mt-4 flex gap-3 border-t pt-4'}>
        <div className={compact ? 'mt-1' : 'mt-1.5'}>
          <UserAvatar name="Admin User" color="bg-chart-1/15 text-chart-1" size={compact ? 'xs' : 'sm'} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <RichTextEditor
            value={newComment}
            onValueChange={setNewComment}
            placeholder="Write a comment..."
            minHeight={compact ? '60px' : '80px'}
            className={compact ? 'text-[12px]' : 'text-[13px]'}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              className={compact ? 'h-7 gap-1 text-[11px]' : 'h-8 gap-1.5 text-xs'}
              disabled={!newComment.replace(/<[^>]*>/g, '').trim()}
              onClick={submit}
            >
              <Send className="size-3" />
              Comment
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}