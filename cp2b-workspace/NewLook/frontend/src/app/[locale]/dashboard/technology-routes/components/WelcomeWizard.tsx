'use client';

import { useState } from 'react';
import { X, Lightbulb, ArrowRight, CheckCircle2, Workflow, Sparkles } from 'lucide-react';

interface WelcomeWizardProps {
  onClose: () => void;
}

const steps = [
  {
    title: 'Bem-vindo ao Construtor de Rotas Tecnológicas!',
    description: 'Uma ferramenta visual para aprender sobre processos de produção de biogás',
    icon: <Sparkles className="h-8 w-8 text-cp2b-green" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Esta ferramenta foi desenvolvida para ajudar você a entender e visualizar
          as diferentes rotas tecnológicas para produção de biogás a partir de diversos resíduos.
        </p>
        <div className="bg-cp2b-lime-light/30 border border-cp2b-lime rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-cp2b-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-cp2b-dark-green mb-1">
                Ferramenta Educacional
              </p>
              <p className="text-sm text-gray-700">
                Sem cálculos! Foque apenas em organizar visualmente as tecnologias
                e entender como elas se conectam.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Como Funciona?',
    description: 'Siga um processo simples e intuitivo',
    icon: <Workflow className="h-8 w-8 text-cp2b-green" />,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          {[
            {
              step: '1',
              title: 'Escolha um Resíduo',
              desc: 'Comece selecionando a matéria-prima (vinhaça, bagaço, dejetos animais, etc.)',
              color: 'bg-cp2b-green',
            },
            {
              step: '2',
              title: 'Adicione Processos',
              desc: 'Arraste tecnologias de pré-tratamento, digestão e upgrade para o canvas',
              color: 'bg-cp2b-green-light',
            },
            {
              step: '3',
              title: 'Defina o Uso Final',
              desc: 'Selecione como o biogás será utilizado (energia, combustível, etc.)',
              color: 'bg-cp2b-lime',
            },
            {
              step: '4',
              title: 'Conecte as Etapas',
              desc: 'As conexões são automáticas! Basta arrastar de uma tecnologia para outra',
              color: 'bg-emerald-500',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-cp2b-lime transition-colors"
            >
              <div
                className={`flex-shrink-0 w-8 h-8 ${item.color} text-white rounded-full flex items-center justify-center font-bold text-sm`}
              >
                {item.step}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Dicas Importantes',
    description: 'Maximize seu aprendizado',
    icon: <CheckCircle2 className="h-8 w-8 text-cp2b-green" />,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          {[
            {
              title: 'Rotas Padrão vs. Personalizadas',
              desc: 'Conexões permitidas seguem regras técnicas. Se uma conexão não for possível, você verá um aviso.',
              icon: '✅',
            },
            {
              title: 'Referências Científicas',
              desc: 'Clique em qualquer tecnologia para ver artigos e estudos que fundamentam sua aplicação.',
              icon: '📚',
            },
            {
              title: 'Salve Suas Rotas',
              desc: 'Use o botão "Salvar" no toolbar para guardar suas rotas e compartilhar com colegas.',
              icon: '💾',
            },
            {
              title: 'Explore Livremente',
              desc: 'Não há respostas certas ou erradas - explore diferentes combinações e aprenda!',
              icon: '🔬',
            },
          ].map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-2xl flex-shrink-0">{tip.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{tip.title}</h4>
                <p className="text-sm text-gray-600">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-cp2b-green/10 to-cp2b-lime/10 border border-cp2b-green/30 rounded-lg">
          <p className="text-center text-sm text-gray-700">
            <strong className="text-cp2b-dark-green">Pronto para começar?</strong>
            <br />
            Clique no botão abaixo e comece a construir sua primeira rota!
          </p>
        </div>
      </div>
    ),
  },
];

export default function WelcomeWizard({ onClose }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header with CP2B Gradient */}
        <div className="bg-gradient-to-r from-cp2b-green to-cp2b-lime px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step.icon}
              <div>
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                <p className="text-sm text-white/90">{step.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-cp2b-dark-green bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-cp2b-green to-cp2b-lime'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Passo {currentStep + 1} de {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {step.content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Pular Tutorial
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-cp2b-green to-cp2b-lime hover:from-cp2b-dark-green hover:to-cp2b-green rounded-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Começar
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
