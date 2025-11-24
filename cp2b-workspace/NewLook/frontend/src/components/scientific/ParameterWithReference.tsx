'use client'

import { useState, useCallback } from 'react'
import { BookOpen } from 'lucide-react'
import { ScientificReference } from '@/types/scientific'
import { getReferencesForParameter } from '@/services/scientificApi'
import ReferencePopover from './ReferencePopover'

interface ParameterWithReferenceProps {
  residueId: number
  parameterType: string
  label: string
  value: string | number
  unit?: string
}

export default function ParameterWithReference({
  residueId,
  parameterType,
  label,
  value,
  unit,
}: ParameterWithReferenceProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [references, setReferences] = useState<ScientificReference[]>([])

  const handleFetchReferences = useCallback(async () => {
    // If we already have the references, just open the popover
    if (references.length > 0) {
      setIsOpen(true)
      return
    }

    setIsLoading(true)
    try {
      const fetchedReferences = await getReferencesForParameter(residueId, parameterType)
      setReferences(fetchedReferences)
    } catch (error) {
      console.error(`Error fetching references for ${parameterType}:`, error)
    } finally {
      setIsLoading(false)
      setIsOpen(true) // Open popover after fetching
    }
  }, [residueId, parameterType, references.length])

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{label}</span>
        <button
          onClick={handleFetchReferences}
          className="text-gray-400 hover:text-gray-600 disabled:text-gray-300"
          title={`Ver referências para ${label}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          ) : (
            <BookOpen className="h-4 w-4" />
          )}
        </button>
      </div>
      <span className="font-mono font-semibold text-gray-900">
        {value} {unit}
      </span>

      {isOpen && (
        <ReferencePopover
          references={references}
          onClose={() => setIsOpen(false)}
          title={label}
        />
      )}
    </div>
  )
}
