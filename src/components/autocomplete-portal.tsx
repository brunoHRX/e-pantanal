"use client"

import * as Portal from "@radix-ui/react-portal"
import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useRef, useState } from "react"

type Props<T> = {
    id: string
    items: T[]
    labelField: keyof T
    value?: string
    placeholder?: string
    onChange?: (value: string) => void
    onSelect: (item: T) => void
    maxItems?: number
}

export default function AutocompletePortal<T extends { id?: number }>({
    id,
    items,
    labelField,
    value,
    placeholder,
    onChange,
    onSelect,
    maxItems = 10
}: Props<T>) {

    const inputRef = useRef<HTMLInputElement | null>(null)

    const [query, setQuery] = useState(value ?? "")
    const [open, setOpen] = useState(false)
    const [highlight, setHighlight] = useState(0)

    const filtered = useMemo(() => {

        const q = query.trim().toLowerCase()

        if (!q) return items.slice(0, maxItems)

        return items
            .filter(i =>
                String(i[labelField]).toLowerCase().includes(q)
            )
            .slice(0, maxItems)

    }, [query, items, labelField, maxItems])

    useEffect(() => {
        setQuery(value ?? "")
    }, [value])

    function selectItem(item: T) {

        const label = String(item[labelField])

        setQuery(label)
        setOpen(false)

        onChange?.(label)
        onSelect(item)

    }

    function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {

        if (!open) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlight(h => Math.min(h + 1, filtered.length - 1))
        }

        if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlight(h => Math.max(h - 1, 0))
        }

        if (e.key === "Enter") {
            e.preventDefault()
            const item = filtered[highlight]
            if (item) selectItem(item)
        }

        if (e.key === "Escape") {
            setOpen(false)
        }

    }

    const rect = inputRef.current?.getBoundingClientRect()

    return (
        <>
            <Input
                ref={inputRef}
                id={id}
                value={query}
                placeholder={placeholder}
                onChange={(e) => {

                    const v = e.target.value

                    setQuery(v)
                    onChange?.(v)

                    setOpen(true)
                    setHighlight(0)

                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKey}
                autoComplete="off"
            />

            {open && filtered.length > 0 && rect && (

                <Portal.Root>

                    <div
                        style={{
                            position: "absolute",
                            top: rect.bottom + window.scrollY + 4,
                            left: rect.left + window.scrollX,
                            width: rect.width,
                            zIndex: 9999
                        }}
                        className="bg-white border rounded-md shadow-md max-h-60 overflow-y-auto"
                    >

                        {filtered.map((item, i) => {

                            const label = String(item[labelField])

                            return (

                                <div
                                    key={i}
                                    onMouseDown={() => selectItem(item)}
                                    className={`px-3 py-2 cursor-pointer ${i === highlight
                                            ? "bg-gray-100"
                                            : "hover:bg-gray-100"
                                        }`}
                                >

                                    {label}

                                </div>

                            )

                        })}

                    </div>

                </Portal.Root>

            )}
        </>
    )

}