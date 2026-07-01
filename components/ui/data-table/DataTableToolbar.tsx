'use client'

import * as React from 'react'
import type { Table } from '@tanstack/react-table'
import type { DateRange } from 'react-day-picker'
import {
  CalendarIcon,
  Check,
  ChevronDown,
  Download,
  ListFilter,
  Plus,
  Rows3,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { DataTableFilterPopover } from './DataTableFilterPopover'
import { type FilterDefinition, resolveOption } from './types'

export interface DataTableToolbarProps {
  table: Table<any>
  filterColumn: string
  filterPlaceholder: string
  filters: FilterDefinition[]
  filterMode: 'inline' | 'modal' | 'popover'
  enableSearch?: boolean
  enableColumnVisibility?: boolean
  enableExport?: boolean
  enableDensityToggle?: boolean
  density?: 'compact' | 'cozy' | 'comfortable'
  borderless?: boolean
  activeFilterCount: number
  isAnyFilterActive: boolean
  isServerSide: boolean
  getMultiSelectValue: (column: string) => string[]
  getDateRangeValue: (column: string) => { from?: string; to?: string }
  getFilterSelectedLabels: (filter: FilterDefinition) => string[]
  formatDateRange: (column: string) => string
  getCalendarModel: (column: string) => DateRange | undefined
  onSearch: (value: string) => void
  onOpenFilterSheet: () => void
  onApplyFilters: () => void
  onClearAllFilters: () => void
  onToggleMultiselect: (column: string, value: string) => void
  onClearFilter: (filter: FilterDefinition) => void
  onClearDateFilter: (filter: FilterDefinition) => void
  onCalendarUpdate: (column: string, value: DateRange | undefined) => void
  onTextFilterUpdate: (column: string, value: string | undefined) => void
  onCommitFilters: (draft: Record<string, any>) => void
  onExportCsv: () => void
  onExportJson: () => void
  onDensityChange: (value: 'compact' | 'cozy' | 'comfortable') => void
  toolbarExtra?: React.ReactNode
  customFilters?: React.ReactNode
}

export function DataTableToolbar({
  table,
  filterColumn,
  filterPlaceholder,
  filters,
  filterMode,
  enableSearch = true,
  enableColumnVisibility = true,
  enableExport = false,
  enableDensityToggle = false,
  density = 'cozy',
  borderless = false,
  activeFilterCount,
  isAnyFilterActive,
  isServerSide,
  getMultiSelectValue,
  getDateRangeValue,
  getFilterSelectedLabels,
  formatDateRange,
  getCalendarModel,
  onSearch,
  onOpenFilterSheet,
  onApplyFilters: _onApplyFilters,
  onClearAllFilters,
  onToggleMultiselect,
  onClearFilter,
  onClearDateFilter,
  onCalendarUpdate,
  onTextFilterUpdate,
  onCommitFilters,
  onExportCsv,
  onExportJson,
  onDensityChange,
  toolbarExtra,
  customFilters,
}: DataTableToolbarProps) {
  return (
    <div className={['flex flex-col gap-2 py-3', borderless ? '' : 'border-b px-4'].join(' ')}>
      <div className="flex items-center gap-2">
        {/* Search only renders when filterColumn maps to an actual column. */}
        {enableSearch && filterColumn && table.getColumn(filterColumn) && (
          <Input
            className="h-9 max-w-xs"
            placeholder={filterPlaceholder}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
            onChange={(e) => onSearch(e.target.value)}
          />
        )}

        {/* ── INLINE filter mode ── */}
        {filterMode === 'inline' &&
          filters.map((filter) => {
            if (filter.type === 'multiselect' || filter.type === 'select') {
              const multi = getMultiSelectValue(filter.column)
              return (
                <Popover key={filter.column}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-dashed">
                      <Plus className="size-4" aria-hidden="true" />
                      {filter.label}
                      {multi.length > 0 && (
                        <>
                          <Separator orientation="vertical" className="mx-1 h-4" />
                          <div className="flex gap-1">
                            {multi.length > 2 ? (
                              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                {multi.length} selected
                              </Badge>
                            ) : (
                              getFilterSelectedLabels(filter).map((label) => (
                                <Badge key={label} variant="secondary" className="rounded-sm px-1 font-normal">
                                  {label}
                                </Badge>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-0" align="start">
                    <Command>
                      <CommandInput placeholder={`Search ${filter.label.toLowerCase()}...`} />
                      <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        <CommandGroup>
                          {filter.options?.map((rawOpt) => {
                            const opt = resolveOption(rawOpt)
                            const OptIcon = opt.icon
                            return (
                              <CommandItem
                                key={opt.value}
                                value={opt.label}
                                onSelect={() => onToggleMultiselect(filter.column, opt.value)}
                              >
                                <div
                                  className={[
                                    'border-primary flex size-4 shrink-0 items-center justify-center rounded-sm border',
                                    multi.includes(opt.value)
                                      ? 'bg-primary text-primary-foreground'
                                      : 'opacity-50 [&_svg]:invisible',
                                  ].join(' ')}
                                >
                                  <Check className="size-3" />
                                </div>
                                {OptIcon && <OptIcon className="text-muted-foreground size-4" />}
                                <span>{opt.label}</span>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                        {multi.length > 0 && (
                          <>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                value="__clear__"
                                className="justify-center text-center"
                                onSelect={() => onClearFilter(filter)}
                              >
                                Clear filter
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )
            }

            if (filter.type === 'date') {
              const dr = getDateRangeValue(filter.column)
              const hasDate = !!(dr.from || dr.to)
              return (
                <Popover key={filter.column}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-dashed">
                      <CalendarIcon className="size-4" aria-hidden="true" />
                      {filter.label}
                      {hasDate && (
                        <>
                          <Separator orientation="vertical" className="mx-1 h-4" />
                          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                            {formatDateRange(filter.column)}
                          </Badge>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <RangeCalendar
                      selected={getCalendarModel(filter.column)}
                      numberOfMonths={2}
                      onSelect={(range) => onCalendarUpdate(filter.column, range)}
                    />
                    {hasDate && (
                      <div className="border-t p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-full text-xs"
                          onClick={() => onClearDateFilter(filter)}
                        >
                          Clear dates
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )
            }

            if (filter.type === 'text') {
              const textValue = table.getColumn(filter.column)?.getFilterValue() as string | undefined
              return (
                <Popover key={filter.column}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-dashed">
                      <Plus className="size-4" aria-hidden="true" />
                      {filter.label}
                      {textValue && (
                        <>
                          <Separator orientation="vertical" className="mx-1 h-4" />
                          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                            {textValue}
                          </Badge>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-3" align="start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{filter.label}</p>
                      <Input
                        placeholder={`Filter by ${filter.label.toLowerCase()}...`}
                        value={(table.getColumn(filter.column)?.getFilterValue() as string) ?? ''}
                        className="h-8 text-sm"
                        onChange={(e) => onTextFilterUpdate(filter.column, e.target.value || undefined)}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              )
            }

            return null
          })}

        {/* ── MODAL filter mode (Sheet from the right) ── */}
        {filterMode === 'modal' && (
          <Button
            variant="outline"
            size="sm"
            className={[
              'h-9',
              activeFilterCount > 0 ? 'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10' : '',
            ].join(' ')}
            onClick={onOpenFilterSheet}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="bg-primary text-primary-foreground ml-0.5 size-5 rounded-full p-0 text-xs font-semibold">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {/* ── POPOVER filter mode ── */}
        {filterMode === 'popover' && filters.length > 0 && (
          <DataTableFilterPopover
            table={table}
            filters={filters}
            activeFilterCount={activeFilterCount}
            isAnyFilterActive={isAnyFilterActive}
            isServerSide={isServerSide}
            getMultiSelectValue={getMultiSelectValue}
            getDateRangeValue={getDateRangeValue}
            formatDateRange={formatDateRange}
            getCalendarModel={getCalendarModel}
            onCommitDraft={(d) => onCommitFilters(d)}
            onClearAll={onClearAllFilters}
            customFilters={customFilters}
          />
        )}

        {/* Inline custom filters (when filterMode === 'inline') */}
        {filterMode === 'inline' && customFilters}

        {/* Toolbar extras (e.g. group-by selector, density toggle) */}
        {toolbarExtra}

        {/* Reset button */}
        {isAnyFilterActive && (
          <Button variant="ghost" size="sm" className="h-9" onClick={onClearAllFilters}>
            Reset
            <X className="size-4" aria-hidden="true" />
          </Button>
        )}

        {/* Export (CSV / JSON) */}
        {enableExport && (
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Download className="size-3.5" />
                  Export
                  <ChevronDown className="size-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onExportCsv}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onSelect={onExportJson}>Export as JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Density toggle */}
        {enableDensityToggle && (
          <div className={enableExport ? '' : 'ml-auto'}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9" aria-label={`Row density: ${density}`}>
                  <Rows3 className="size-4" aria-hidden="true" />
                  <span className="capitalize">{density}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={density}
                  onValueChange={(v) => onDensityChange(v as 'compact' | 'cozy' | 'comfortable')}
                >
                  <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cozy">Cozy</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Column Visibility */}
        {enableColumnVisibility && (
          <div className={enableExport || enableDensityToggle ? '' : 'ml-auto'}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <ListFilter className="size-4" aria-hidden="true" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}
