import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { AssetIcon } from "@/components/ui/asset-icon"

export interface Token {
    asset_type: string,
    symbol: string
    name: string
    icon_uri?: string
    network?: string
}

interface TokenSelectProps {
    value: string
    options: Token[]
    onChange: (token: string) => void
    disabled?: boolean
}

export function TokenSelect({ value: selected, options, onChange, disabled = false }: TokenSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (id: string) => {
        onChange(id)
        setIsOpen(false)
    }

    const value = options.find((option) => option.asset_type === selected) || {}

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:bg-slate-700 py-1 px-2 rounded-md transition-colors"
            >
                <AssetIcon name={value.name} symbol={value.symbol} icon={value.icon_uri} size="sm" />
                <span>
                    {value.symbol} {value.network ? `${value.network}` : ''}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute z-10 left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-md shadow-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto py-1">
                        {options.map((token, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelect(token.asset_type)}
                                className="flex items-center w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors"
                            >
                                <AssetIcon name={token.name} symbol={token.symbol} icon={token.icon_uri} size="sm" />
                                <span className="ml-2">
                                    {token.symbol} {token.network && <span className="text-slate-400">{token.network}</span>}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}