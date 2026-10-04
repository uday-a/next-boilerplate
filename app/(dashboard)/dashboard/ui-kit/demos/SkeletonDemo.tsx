'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonDemo() {
  const [loading, setLoading] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const replay = useCallback(() => {
    setLoading(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setLoading(false), 2000)
  }, [])

  useEffect(() => {
    timer.current = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer.current)
  }, [])

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-2 w-24" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-3/4" />
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Avatar className="size-10">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-muted-foreground text-xs">john.doe@example.com</p>
            </div>
          </div>
          <p className="text-muted-foreground">Content loaded.</p>
        </div>
      )}
      <Button variant="outline" size="sm" onClick={replay}>Replay</Button>
    </div>
  )
}
