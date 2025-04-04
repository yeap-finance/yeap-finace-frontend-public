"use client"

import { useState, useEffect } from "react"
import { X, Check, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type FilterOption = {
  value: string
  label: string
}

export type FilterConfig = {
  key: string
  label: string
  options: FilterOption[]
  searchable?: boolean
  multiSelect?: boolean
}

export type FilterState = {
  [key: string]: string[]
}

interface VaultFilterProps {
  filters: FilterConfig[]
  onChange: (filters: FilterState) => void
}

export function VaultFilter({ filters, onChange }: VaultFilterProps) {
  const [activeFilters, setActiveFilters] = useState<FilterState>({})
  const [searchQueries, setSearchQueries] = useState<{ [key: string]: string }>({})

  // 格式化过滤器显示文本
  const formatFilterDisplay = (key: string, values: string[]) => {
    const filterConfig = filters.find((f) => f.key === key)
    if (!filterConfig) return ""

    const getLabel = (value: string) => {
      const option = filterConfig.options.find((o) => o.value === value)
      return option ? option.label : value
    }

    const valueLabels = values.map(getLabel)

    if (valueLabels.length === 0) return ""
    if (valueLabels.length === 1) return `${filterConfig.label} is ${valueLabels[0]}`
    if (valueLabels.length === 2) return `${filterConfig.label} is ${valueLabels[0]} and ${valueLabels[1]}`
    if (valueLabels.length === 3)
      return `${filterConfig.label} is ${valueLabels[0]}, ${valueLabels[1]} and ${valueLabels[2]}`

    return `${filterConfig.label} is ${valueLabels[0]}, ${valueLabels[1]} and ${valueLabels.length - 2} more`
  }

  // 处理过滤器变化
  const handleFilterChange = (key: string, values: string[]) => {
    const newFilters = {
      ...activeFilters,
      [key]: values,
    }

    // 如果没有选中的值，则删除该过滤器
    if (values.length === 0) {
      delete newFilters[key]
    }

    setActiveFilters(newFilters)
  }

  // 清除单个过滤器
  const clearFilter = (key: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[key]
    setActiveFilters(newFilters)
  }

  // 清除所有过滤器
  const clearAllFilters = () => {
    setActiveFilters({})
  }

  // 处理搜索查询变化
  const handleSearchChange = (key: string, query: string) => {
    setSearchQueries({
      ...searchQueries,
      [key]: query,
    })
  }

  // 当过滤器变化时通知父组件
  useEffect(() => {
    onChange(activeFilters)
  }, [activeFilters, onChange])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Popover key={filter.key}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "border-dashed",
                  activeFilters[filter.key]?.length > 0 && "border-primary bg-primary/10 text-primary",
                )}
              >
                {activeFilters[filter.key]?.length > 0
                  ? formatFilterDisplay(filter.key, activeFilters[filter.key])
                  : filter.label}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">{filter.label}</h4>

                {filter.searchable && (
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search${filter.label}...`}
                      className="pl-8"
                      value={searchQueries[filter.key] || ""}
                      onChange={(e) => handleSearchChange(filter.key, e.target.value)}
                    />
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filter.options
                    .filter((option) => {
                      if (!searchQueries[filter.key]) return true
                      return option.label.toLowerCase().includes(searchQueries[filter.key].toLowerCase())
                    })
                    .map((option) => {
                      const isSelected = activeFilters[filter.key]?.includes(option.value)

                      return (
                        <div
                          key={option.value}
                          className={cn(
                            "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-700",
                            isSelected && "bg-primary/10",
                          )}
                          onClick={() => {
                            if (filter.multiSelect) {
                              const currentValues = activeFilters[filter.key] || []
                              if (isSelected) {
                                handleFilterChange(
                                  filter.key,
                                  currentValues.filter((v) => v !== option.value),
                                )
                              } else {
                                handleFilterChange(filter.key, [...currentValues, option.value])
                              }
                            } else {
                              handleFilterChange(filter.key, [option.value])
                            }
                          }}
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      )
                    })}
                </div>

                {activeFilters[filter.key]?.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => clearFilter(filter.key)}>
                    Clear
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        ))}

        {Object.keys(activeFilters).length > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearAllFilters}>
            Clear All
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, values]) =>
            values.map((value) => {
              const filterConfig = filters.find((f) => f.key === key)
              if (!filterConfig) return null

              const option = filterConfig.options.find((o) => o.value === value)
              if (!option) return null

              return (
                <Badge key={`${key}-${value}`} variant="secondary" className="px-3 py-1">
                  {filterConfig.label}: {option.label}
                  <X
                    className="ml-2 h-3 w-3 cursor-pointer"
                    onClick={() => {
                      const newValues = activeFilters[key].filter((v) => v !== value)
                      handleFilterChange(key, newValues)
                    }}
                  />
                </Badge>
              )
            }),
          )}
        </div>
      )}
    </div>
  )
}

