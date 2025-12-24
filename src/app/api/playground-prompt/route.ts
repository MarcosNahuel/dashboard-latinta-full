import { NextRequest, NextResponse } from 'next/server';

// Estructura del prompt del playground
interface PlaygroundPromptData {
  identity: string;
  tone: string;
  constraints: string;
  knowledge: string;
  logic: string;
  fewShot: string;
  leadBehavior: string;
}

// Datos por defecto (los mismos que en el frontend)
const defaultPromptData: PlaygroundPromptData = {
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

// Storage en memoria (en produccion usar Redis/DB)
let savedPromptData: PlaygroundPromptData = { ...defaultPromptData };
let lastUpdated: string | null = null;

// Funcion para compilar el prompt completo
function compileSystemPrompt(data: PlaygroundPromptData): string {
  return `# SYSTEM PROMPT - AGENTE LA TINTA FINE ART PRINT

## IDENTIDAD Y ROL
${data.identity}

## TONALIDAD
${data.tone}

## REGLAS DE ORO (CONSTRAINTS)
${data.constraints}

## CONOCIMIENTO FIJO
${data.knowledge}

## CADENA DE RAZONAMIENTO (Chain of Thought)
${data.logic}

## EJEMPLOS DE CONVERSACION (Few-Shot)
${data.fewShot}

## COMPORTAMIENTO CON LEADS
${data.leadBehavior}

---
Generado con Agent Playground - La Tinta Dashboard`;
}

// GET: Obtener el system prompt compilado para n8n
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'full';

  try {
    if (format === 'raw') {
      // Devuelve solo el texto del prompt (para n8n)
      return new NextResponse(compileSystemPrompt(savedPromptData), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    if (format === 'sections') {
      // Devuelve las secciones individuales
      return NextResponse.json({
        success: true,
        sections: savedPromptData,
        updatedAt: lastUpdated,
      });
    }

    // Default: formato completo con metadata
    return NextResponse.json({
      success: true,
      systemPrompt: compileSystemPrompt(savedPromptData),
      sections: savedPromptData,
      updatedAt: lastUpdated,
      metadata: {
        business: 'La Tinta Fine Art Print',
        channel: 'Instagram/ManyChat',
        version: '1.0',
        generatedBy: 'Agent Playground',
      },
    });
  } catch (error) {
    console.error('Error en GET /api/playground-prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo prompt' },
      { status: 500 }
    );
  }
}

// POST: Guardar el prompt desde el playground
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections } = body;

    if (!sections) {
      return NextResponse.json(
        { success: false, error: 'Secciones requeridas' },
        { status: 400 }
      );
    }

    // Validar que todas las secciones existan
    const requiredKeys: (keyof PlaygroundPromptData)[] = [
      'identity',
      'tone',
      'constraints',
      'knowledge',
      'logic',
      'fewShot',
      'leadBehavior',
    ];

    for (const key of requiredKeys) {
      if (typeof sections[key] !== 'string') {
        return NextResponse.json(
          { success: false, error: `Seccion '${key}' invalida o faltante` },
          { status: 400 }
        );
      }
    }

    // Guardar
    savedPromptData = { ...sections };
    lastUpdated = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: 'Prompt guardado correctamente',
      updatedAt: lastUpdated,
      endpoint: '/api/playground-prompt?format=raw',
    });
  } catch (error) {
    console.error('Error en POST /api/playground-prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Error guardando prompt' },
      { status: 500 }
    );
  }
}
