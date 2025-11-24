'use client'

import { X } from 'lucide-react'
import { ScientificReference } from '@/types/scientific'

interface ReferencePopoverProps {
  references: ScientificReference[]
  onClose: () => void
  title: string
}

export default function ReferencePopover({ references, onClose, title }: ReferencePopoverProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Referências para {title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4">
          {references.length > 0 ? (
            references.map((ref) => (
              <div key={ref.id || ref.doi} className="border-b border-gray-100 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-900">{ref.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {ref.authors} ({ref.year})
                </p>
                {ref.doi && (
                  <a
                    href={`https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    DOI: {ref.doi}
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma referência específica encontrada para este parâmetro.</p>
          )}
        </div>
      </div>
    </div>
  )
}
