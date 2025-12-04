'use client';

import { Save, HelpCircle } from 'lucide-react';

/**
 * Toolbar for the Technology Routes page
 * Simplified version for MVP - full save/share functionality to be added later
 */
export default function RouteToolbar() {
  const handleSave = () => {
    // TODO: Implement save functionality
    alert('Funcionalidade de salvar será implementada em breve!');
  };

  const handleHelp = () => {
    alert(
      'Como usar:\n\n' +
      '1. Arraste tecnologias da barra lateral para o canvas\n' +
      '2. Conecte as tecnologias arrastando de um nó para outro\n' +
      '3. Clique em um nó para ver referências científicas\n' +
      '4. Use a busca e filtros para encontrar tecnologias\n\n' +
      'Esta é uma ferramenta educacional - não realiza cálculos.'
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left - Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Rotas Tecnológicas</h1>
          <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
            Ferramenta Educacional
          </span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            title="Salvar rota (em breve)"
          >
            <Save size={18} />
            <span>Salvar</span>
          </button>

          <button
            onClick={handleHelp}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ajuda"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
