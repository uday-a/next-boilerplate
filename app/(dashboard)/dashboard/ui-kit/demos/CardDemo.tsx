'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function CardDemo() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle className="text-base">Deploy to production</CardTitle>
        <CardDescription>web-app · main · 3 commits ahead</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">The last deploy finished 2 hours ago with no errors.</CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Deploy</Button>
        <Button size="sm" variant="outline">View diff</Button>
      </CardFooter>
    </Card>
  )
}
