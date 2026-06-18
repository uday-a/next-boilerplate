'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Check,
  Copy,
  CreditCard,
  Fingerprint,
  Hash,
  Home,
  Loader2,
  Mail,
  Palette,
  Search,
  Settings,
  User,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PinInput, PinInputGroup, PinInputSeparator, PinInputSlot } from '@/components/ui/pin-input'
import { KpiGrid } from '@/components/ui/kpi-grid'
import { DataList, DataListItem } from '@/components/ui/data-list'
import { SectionCard } from '@/components/ui/section-card'
import { IconBox } from '@/components/ui/icon-box'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ThemeSwitch } from '@/components/ui/theme-switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { OverlayScroll } from '@/components/ui/overlay-scroll'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const kpiItems = [
  { label: 'Total Revenue', value: '$84,230', change: '+12.5%' },
  { label: 'Active Users', value: '2,420', change: '+8.2%' },
  { label: 'Conversion Rate', value: '3.24%', change: '-0.4%' },
  { label: 'Avg. Order Value', value: '$64.50', change: '+2.1%' },
]

export default function UiKitPage() {
  const [otpValue, setOtpValue] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sliderValue, setSliderValue] = useState([65])
  const [loadingDemo, setLoadingDemo] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoadingDemo(false), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">UI Kit</h1>
        <p className="text-muted-foreground text-sm">Every primitive demonstrated in realistic contexts.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Breadcrumb</CardTitle>
          <CardDescription>Navigation hierarchy with links and current page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">
                    <Home className="size-3.5" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/settings">Settings</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>UI Kit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">KpiGrid</CardTitle>
          <CardDescription>Metric tiles with trend indicators.</CardDescription>
        </CardHeader>
        <CardContent>
          <KpiGrid>
            {kpiItems.map((item) => (
              <Card key={item.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
                </CardHeader>
                <CardFooter>
                  <Badge variant="secondary">{item.change}</Badge>
                </CardFooter>
              </Card>
            ))}
          </KpiGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Command</CardTitle>
          <CardDescription>Keyboard-driven command palette for search and actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Command className="rounded-lg border shadow-sm">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem value="calendar">
                  <Hash className="mr-2 size-4" />
                  Calendar
                </CommandItem>
                <CommandItem value="search">
                  <Search className="mr-2 size-4" />
                  Search Emoji
                </CommandItem>
                <CommandItem value="calculator">
                  <CreditCard className="mr-2 size-4" />
                  Calculator
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Settings">
                <CommandItem value="profile">
                  <User className="mr-2 size-4" />
                  Profile
                </CommandItem>
                <CommandItem value="billing">
                  <CreditCard className="mr-2 size-4" />
                  Billing
                </CommandItem>
                <CommandItem value="settings">
                  <Settings className="mr-2 size-4" />
                  Settings
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dialog</CardTitle>
            <CardDescription>Modal overlay for critical actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Open dialog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm action</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the selected item. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDialogOpen(false)}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sheet</CardTitle>
            <CardDescription>Slide-in panel for detail views.</CardDescription>
          </CardHeader>
          <CardContent>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  Open sheet
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Details</SheetTitle>
                  <SheetDescription>View and edit item details.</SheetDescription>
                </SheetHeader>
                <div className="space-y-3 py-4">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input defaultValue="Acme Inc" />
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input defaultValue="hello@acme.com" />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => setSheetOpen(false)}>
                  Save
                </Button>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Popover + Tooltip</CardTitle>
            <CardDescription>Contextual menus and hover hints.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Popover
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <p className="text-sm font-medium">Quick actions</p>
                <p className="text-muted-foreground text-xs mt-1">Choose an action for this item.</p>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent">
                    <Copy className="size-3" />
                    Copy
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent text-destructive">
                    <X className="size-3" />
                    Remove
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <AlertCircle className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More information about this feature</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>View</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Form controls</CardTitle>
          <CardDescription>Inputs, selects, toggles, and validation states.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Text input</Label>
            <Input placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" defaultValue="secret123" />
          </div>
          <div className="space-y-2">
            <Label>Select</Label>
            <Select defaultValue="pro">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Textarea</Label>
            <Textarea placeholder="Enter your message..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ui-kit-slider">Slider ({sliderValue[0]}%)</Label>
            <Slider id="ui-kit-slider" value={sliderValue} onValueChange={setSliderValue} min={0} max={100} step={1} aria-label="Demo slider" />
          </div>
          <div className="space-y-2">
            <Label>Pin Input</Label>
            <PinInput value={otpValue} onChange={setOtpValue} maxLength={6} className="flex gap-2">
              <PinInputGroup>
                <PinInputSlot index={0} />
                <PinInputSlot index={1} />
                <PinInputSlot index={2} />
                <PinInputSeparator />
                <PinInputSlot index={3} />
                <PinInputSlot index={4} />
                <PinInputSlot index={5} />
              </PinInputGroup>
            </PinInput>
          </div>
          <div className="space-y-3">
            <Label>Checkbox</Label>
            <div className="flex items-center gap-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm font-normal">
                Accept terms
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="news" defaultChecked />
              <Label htmlFor="news" className="text-sm font-normal">
                Newsletter
              </Label>
            </div>
          </div>
          <div className="space-y-3">
            <Label>Switch</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="ui-kit-switch-notifications" className="text-sm font-normal">
                Notifications
              </Label>
              <Switch id="ui-kit-switch-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ui-kit-switch-dark-mode" className="text-sm font-normal">
                Dark mode
              </Label>
              <Switch id="ui-kit-switch-dark-mode" />
            </div>
          </div>
          <div className="space-y-3">
            <Label>Radio group</Label>
            <RadioGroup defaultValue="comfortable">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="compact" />
                <Label className="text-sm font-normal">Compact</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="comfortable" />
                <Label className="text-sm font-normal">Comfortable</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="spacious" />
                <Label className="text-sm font-normal">Spacious</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Toggle</CardTitle>
            <CardDescription>Binary state button.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Toggle>
              <Bold className="size-4" />
            </Toggle>
            <Toggle>
              <Italic className="size-4" />
            </Toggle>
            <Toggle>
              <Underline className="size-4" />
            </Toggle>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ToggleGroup</CardTitle>
            <CardDescription>Exclusive or multiple selection.</CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup type="single" defaultValue="list">
              <ToggleGroupItem value="list">
                <List className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="ordered">
                <ListOrdered className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="link">
                <LinkIcon className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="image">
                <ImageIcon className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
            <CardDescription>Visual completion indicator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Uploading</span>
                <span>78%</span>
              </div>
              <Progress value={78} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Processing</span>
                <span>42%</span>
              </div>
              <Progress value={42} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Complete</span>
                <span>100%</span>
              </div>
              <Progress value={100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skeleton</CardTitle>
            <CardDescription>Loading placeholder shimmer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingDemo ? (
              <>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-2 w-24" />
                    <Skeleton className="h-2 w-32" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-3/4" />
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="size-10">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs">john@example.com</p>
                  </div>
                </div>
                <p>Content loaded successfully.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ThemeSwitch</CardTitle>
            <CardDescription>Light / dark / system toggle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ThemeSwitch value="light" variant="cards" />
            <ThemeSwitch value="dark" variant="icons" />
            <ThemeSwitch value="system" variant="pill" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accordion</CardTitle>
            <CardDescription>Collapsible content sections.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern for accordions.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I customize styles?</AccordionTrigger>
                <AccordionContent>Absolutely. All components are built with Tailwind and expose class props.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it SSR-friendly?</AccordionTrigger>
                <AccordionContent>Yes. Components work with Next.js SSR and hydration.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Collapsible</CardTitle>
            <CardDescription>Show/hide content with animation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Collapsible>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">@peduarte starred 3 repos</p>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Toggle
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="rounded-md border px-3 py-2 text-xs font-mono">@radix-ui/primitives</div>
                <div className="rounded-md border px-3 py-2 text-xs font-mono">@radix-ui/colors</div>
                <div className="rounded-md border px-3 py-2 text-xs font-mono">@radix-ui/react-slot</div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard title="Account details" description="Your workspace identity">
          <DataList>
            <DataListItem>
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="secondary">Active</Badge>
            </DataListItem>
            <DataListItem>
              <span className="text-sm text-muted-foreground">Region</span>
              <span className="text-sm">us-east-1</span>
            </DataListItem>
            <DataListItem>
              <span className="text-sm text-muted-foreground">Plan</span>
              <Badge>Pro</Badge>
            </DataListItem>
            <DataListItem>
              <span className="text-sm text-muted-foreground">Seats</span>
              <span className="text-sm">8 of 25</span>
            </DataListItem>
          </DataList>
        </SectionCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">IconBox + OverlayScroll</CardTitle>
            <CardDescription>Icon containers and custom scrollbars.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <IconBox icon={Mail} />
              <IconBox icon={Settings} variant="muted" />
              <IconBox icon={Palette} variant="muted" />
              <IconBox icon={Fingerprint} variant="custom" />
            </div>
            <OverlayScroll className="h-24 rounded-md border p-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <p key={i} className="text-xs py-1">
                  Scrollable content line {i + 1}
                </p>
              ))}
            </OverlayScroll>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">RichTextEditor</CardTitle>
          <CardDescription>Tiptap-based editor with formatting toolbar.</CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor className="min-h-[160px]" />
        </CardContent>
      </Card>
    </div>
  )
}