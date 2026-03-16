"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"

type Props<T> = {
  items: T[]
  labelField: keyof T
  onSelect: (item: T) => void
  placeholder?: string
}

export default function AutocompleteInput<T extends { id?: number }>({
  items,
  labelField,
  onSelect,
  placeholder
}: Props<T>) {

  const [query,setQuery] = useState("")
  const [results,setResults] = useState<T[]>([])
  const [show,setShow] = useState(false)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(()=>{

    if(debounceRef.current)
      clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(()=>{

      if(!query){
        setResults([])
        return
      }

      const q = query.toLowerCase()

      const filtered = items
        .filter(i => String(i[labelField]).toLowerCase().includes(q))
        .slice(0,10)

      setResults(filtered)

    },300)

  },[query,items,labelField])

  function handleSelect(item:T){
    onSelect(item)
    setQuery(String(item[labelField]))
    setShow(false)
  }

  return (
    <div className="relative">

      <Input
        value={query}
        placeholder={placeholder}
        onChange={(e)=>{
          setQuery(e.target.value)
          setShow(true)
        }}
      />

      {show && results.length > 0 && (

        <div className="absolute z-50 bg-white border rounded shadow w-full max-h-60 overflow-y-auto">

          {results.map((item,index)=>(
            <div
              key={index}
              onClick={()=>handleSelect(item)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {String(item[labelField])}
            </div>
          ))}

        </div>

      )}

    </div>
  )
}