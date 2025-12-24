'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Download, RotateCcw, Sparkles, Eye, Save, Link2, ExternalLink } from 'lucide-react';
import PromptSection from './PromptSection';
import ToolsDisplay from './ToolsDisplay';
import MagicEditModal from './MagicEditModal';

// Tipos
interface PromptData {
  identity: string;
  tone: string;
  constraints: string;
  knowledge: string;
  logic: string;
  fewShot: string;
  leadBehavior: string;
}

interface SectionConfig {
  id: keyof PromptData;
  title: string;
  icon: string;
  description: string;
}

// Configuracion de secciones
const sections: SectionConfig[] = [
  {
    id: 'identity',
    title: 'Identidad y Rol',
    icon: '🤖',
    description: 'Quien es el agente y su mision principal',
  },
  {
    id: 'tone',
    title: 'Tonalidad',
    icon: '🎭',
    description: 'Estilo de respuesta y personalidad',
  },
  {
    id: 'constraints',
    title: 'Reglas de Oro',
    icon: '⚖️',
    description: 'Restricciones y limites del agente',
  },
  {
    id: 'knowledge',
    title: 'Conocimiento Fijo',
    icon: '📚',
    description: 'Datos duros del negocio',
  },
  {
    id: 'logic',
    title: 'Cadena de Razonamiento',
    icon: '🧠',
    description: 'Como debe pensar antes de responder',
  },
  {
    id: 'fewShot',
    title: 'Few-Shot Examples',
    icon: '💬',
    description: 'Ejemplos de conversaciones ideales',
  },
  {
    id: 'leadBehavior',
    title: 'Documento de Comportamiento',
    icon: '📋',
    description: 'Instrucciones de tratamiento de leads',
  },
];

// Data inicial (del workflow de n8n)
const defaultPromptData: PromptData = {
  identity: `Eres LA TINTA, asistente virtual de La Tinta Fine Art Print (Santiago, Chile). Atiendes por Instagram (ManyChat). Mision: Resolver dudas, calificar cliente (Amateur/Pro) y guiar a conversion.`,
  tone: `Estilo: profesional, cercano, elegante, seguro. Espanol chileno neutro. Frases ancla: 'Excelente' / 'Buenisimo'.`,
  constraints: `- Max 800 caracteres por mensaje.
- Max 1 pregunta por mensaje.
- Sin menu: recomienda 1-2 opciones.
- NO inventar precios ni plazos.
- Copyright: NO imprimir obras ajenas sin permiso.`,
  knowledge: `- Impresion Giclee / Fine Art (12 tintas).
- Rollos: 60 cm y 110 cm.
- Cobro por superficie lineal.
- 100% online, retiros en Las Condes.
- Papeles: Smooth (mate), Luster (semi), Canson Etching (museo).`,
  logic: `1. Entender necesidad.
2. Clasificar Amateur/Pro.
3. Recomendar papel.
4. Si pide precio -> Tool PRODUCTOS.
5. Si hay duda -> Tool DOCUMENTO.`,
  fewShot: `CLIENTE: "Hola, quiero imprimir unas fotos de mi viaje"
AGENTE: "Hola! Excelente, me encanta ayudarte. Para fotos de viaje te recomiendo el Felix Schoeller Smooth 200g, tiene acabado mate profesional y colores precisos. Que tamano estas pensando?"

CLIENTE: "Cuanto sale imprimir en 30x40?"
AGENTE: "El 30x40 en Smooth esta $24.990. Es donde realmente luce una foto, el impacto visual es otro nivel. Tienes la imagen lista para enviar?"`,
  leadBehavior: `Priorizar cierre de venta. Si el cliente es Amateur, educar suavemente. Si es Pro, hablar tecnicamente. Usar heuristica para detectar intencion de compra:
- 0: Solo curiosidad, nutrir con contenido
- 1: Interes medio, ofrecer descuento primera compra
- 2: Listo para comprar, facilitar proceso inmediato`,
};

export default function PromptBuilder() {
  const [promptData, setPromptData] = useState<PromptData>(defaultPromptData);
  const [copied, setCopied] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [magicModal, setMagicModal] = useState<{
    isOpen: boolean;
    sectionId: keyof PromptData | null;
    sectionTitle: string;
    currentValue: string;
  }>({
    isOpen: false,
    sectionId: null,
    sectionTitle: '',
    currentValue: '',
  });
  const [suggestion, setSuggestion] = useState<string>('');

  // Cargar prompt guardado al iniciar
  useEffect(() => {
    loadSavedPrompt();
  }, []);

  const loadSavedPrompt = async () => {
    try {
      const res = await fetch('/api/playground-prompt?format=sections');
      const data = await res.json();
      if (data.success && data.sections) {
        setPromptData(data.sections);
        if (data.updatedAt) {
          setLastSaved(data.updatedAt);
        }
      }
    } catch (error) {
      console.log('Usando valores por defecto');
    }
  };

  // Guardar prompt al endpoint
  const saveToEndpoint = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/playground-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: promptData }),
      });
      const data = await res.json();
      if (data.success) {
        setLastSaved(data.updatedAt);
        toast.success('Prompt guardado! Disponible en el endpoint para n8n');
      } else {
        toast.error(data.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error de conexion');
    } finally {
      setIsSaving(false);
    }
  };

  // Copiar URL del endpoint
  const copyEndpointUrl = async () => {
    const url = `${window.location.origin}/api/playground-prompt?format=raw`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedEndpoint(true);
      toast.success('URL del endpoint copiada!');
      setTimeout(() => setCopiedEndpoint(false), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  // Actualizar una seccion
  const updateSection = useCallback((id: keyof PromptData, value: string) => {
    setPromptData((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Abrir modal de Magic Edit
  const handleMagicEdit = useCallback((sectionId: string, currentValue: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      setMagicModal({
        isOpen: true,
        sectionId: sectionId as keyof PromptData,
        sectionTitle: section.title,
        currentValue,
      });
      setSuggestion('');
    }
  }, []);

  // Llamar a la API de Gemini
  const handleMagicApply = async (instruction: string) => {
    if (!magicModal.sectionId) return;

    setLoadingSection(magicModal.sectionId);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentText: magicModal.currentValue,
          instruction,
          sectionType: magicModal.sectionTitle,
        }),
      });

      const data = await response.json();

      if (data.success && data.improvedText) {
        setSuggestion(data.improvedText);
        updateSection(magicModal.sectionId, data.improvedText);
        toast.success('Texto mejorado con IA!');
        setMagicModal((prev) => ({ ...prev, isOpen: false }));
      } else {
        toast.error(data.error || 'Error al procesar con IA');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      toast.error('Error de conexion con la IA');
    } finally {
      setLoadingSection(null);
    }
  };

  // Generar el prompt compilado
  const compiledPrompt = useMemo(() => {
    return `# SYSTEM PROMPT - AGENTE LA TINTA FINE ART PRINT

## IDENTIDAD Y ROL
${promptData.identity}

## TONALIDAD
${promptData.tone}

## REGLAS DE ORO (CONSTRAINTS)
${promptData.constraints}

## CONOCIMIENTO FIJO
${promptData.knowledge}

## CADENA DE RAZONAMIENTO (Chain of Thought)
${promptData.logic}

## EJEMPLOS DE CONVERSACION (Few-Shot)
${promptData.fewShot}

## COMPORTAMIENTO CON LEADS
${promptData.leadBehavior}

---
Generado con Agent Playground - La Tinta Dashboard`;
  }, [promptData]);

  // Copiar al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(compiledPrompt);
      setCopied(true);
      toast.success('Prompt copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  // Descargar como archivo
  const downloadPrompt = () => {
    const blob = new Blob([compiledPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-prompt-latinta.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Archivo descargado!');
  };

  // Reset a valores por defecto
  const resetToDefault = () => {
    if (confirm('Estas seguro de resetear a los valores por defecto?')) {
      setPromptData(defaultPromptData);
      toast.info('Prompt reseteado');
    }
  };

  return (
    <div className="min-h-screen playground-container">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--playground-accent)] to-[#ff6b6b] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Agent Playground</h1>
              <p className="text-gray-400 text-sm">
                Construye y modifica el System Prompt de tu agente de IA
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-[var(--playground-accent)]" />
                Editor de Prompt
              </h2>
              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Resetear
              </button>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              {sections.map((section) => (
                <PromptSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  icon={section.icon}
                  description={section.description}
                  value={promptData[section.id]}
                  onChange={(value) => updateSection(section.id, value)}
                  onMagicEdit={handleMagicEdit}
                  isLoading={loadingSection === section.id}
                />
              ))}
            </div>

            {/* Tools Display */}
            <ToolsDisplay />
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
            <div className="preview-panel">
              <div className="preview-header">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-sm text-gray-400">system-prompt.md</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {compiledPrompt.length} caracteres
                  </span>
                </div>
              </div>
              <div className="preview-content">
                {compiledPrompt}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 btn-accent flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Prompt Final
                  </>
                )}
              </button>
              <button
                onClick={downloadPrompt}
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-[var(--playground-border)] text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            {/* Endpoint para n8n */}
            <div className="playground-card bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-400" />
                  Endpoint para n8n
                </h4>
                {lastSaved && (
                  <span className="text-xs text-gray-500">
                    Guardado: {new Date(lastSaved).toLocaleString('es-CL')}
                  </span>
                )}
              </div>

              <div className="bg-black/30 rounded-lg p-3 mb-3">
                <code className="text-sm text-purple-300 break-all">
                  GET /api/playground-prompt?format=raw
                </code>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveToEndpoint}
                  disabled={isSaving}
                  className="flex-1 btn-accent flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar para n8n
                    </>
                  )}
                </button>
                <button
                  onClick={copyEndpointUrl}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--playground-border)] text-gray-300 hover:bg-white/10 transition-colors"
                  title="Copiar URL del endpoint"
                >
                  {copiedEndpoint ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="playground-card">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span>💡</span> Tips de uso
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--playground-accent)]">•</span>
                  Usa el boton "Mejorar con IA" para optimizar cada seccion
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--playground-accent)]">•</span>
                  Guarda el prompt y usa el endpoint en n8n con HTTP Request
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--playground-accent)]">•</span>
                  El formato "raw" devuelve solo texto plano para el agente
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Magic Edit Modal */}
      <MagicEditModal
        isOpen={magicModal.isOpen}
        sectionTitle={magicModal.sectionTitle}
        currentValue={magicModal.currentValue}
        onClose={() => setMagicModal((prev) => ({ ...prev, isOpen: false }))}
        onApply={handleMagicApply}
        isLoading={loadingSection !== null}
        suggestion={suggestion}
      />
    </div>
  );
}
