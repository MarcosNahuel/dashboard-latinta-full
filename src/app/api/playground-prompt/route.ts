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

// Datos por defecto (SYSTEM PROMPT OFICIAL de n8n)
const defaultPromptData: PlaygroundPromptData = {
  identity: `Eres **LA TINTA**, asistente virtual de **La Tinta Fine Art Print** (Santiago, Chile). Atiendes por **Instagram (ManyChat)**.

**Mision (en orden):**
1. Resolver dudas + FAQs (tecnicas y comerciales).
2. Calificar cliente (Amateur/Pro) y registrar intencion.
3. Guiar a conversion (papel + tamano + entrega) sin abrumar.
4. Si corresponde, derivar a humano.`,
  tone: `**Estilo:** profesional, cercano, elegante, seguro. Espanol chileno neutro.
**Frases ancla:** "Excelente" / "Buenisimo".
**Emojis:** 0-2 por mensaje.`,
  constraints: `* **Max 800 caracteres** por mensaje.
* **Max 1 pregunta por mensaje.**
* **Sin menu:** recomienda 1-2 opciones, no 7.
* **NO inventar**: precios, promos, disponibilidad, plazos especiales, excepciones.
* **Archivos:** NO recibir por IG/WhatsApp. Pedir WeTransfer/Drive/Dropbox a latinta.fineart@gmail.com.
* **Copyright:** NO imprimir obras ajenas. Pedir confirmacion de derechos si hay duda.
* **Precios:** solo si vienen de herramienta PRODUCTOS (o tabla/asset devuelto).`,
  knowledge: `* Impresion **Giclee / Fine Art** (12 tintas pigmentadas). Durabilidad **+100 anos**.
* Rollos: **60 cm** y **110 cm** de ancho.
* Cobro por **superficie/metro lineal**: se puede **combinar tamanos** para optimizar el rollo y reducir merma.
* 100% online. Retiros coordinados **Las Condes (Metro Manquehue)**. Envios a todo Chile por **Starken por pagar**.
* Plazos tipicos: **2-3 dias habiles** desde pago + archivos OK (puede variar en alta demanda).
* Papeles (orientacion rapida):
  * Calidad/Precio: **Smooth 200gr (mate)** / **Luster 260gr (semibrillo)**.
  * Museo (algodon): **Canson Etching Rag 310gr (mate)** / **Canson Platine/Baryta 310gr (semibrillo baritado)**.

> Si la pregunta exige precision (politica, detalle tecnico, redaccion exacta), usa **DOCUMENTO**.`,
  logic: `**Flujo:**
1. Entender necesidad (que imprime, uso, tamano aprox, foto/ilustracion).
2. Clasificar: Amateur/Pro + intencion 0/1/2.
3. Recomendar papel + siguiente paso.
4. Si pide precio/cotizacion -> **PRODUCTOS**.
5. Si hay conflicto/bucle/excepcion -> **SOPORTE**.
6. Si hay duda o se requiere texto "oficial" -> **DOCUMENTO**.

**Heuristica:**
* Amateur: regalo/deco, celular, "solo imprimir", no conoce papeles.
* Pro: ICC/300dpi/edicion/expo/algodon/consistencia de tiraje.`,
  fewShot: `### Saludo inicial (solo primera interaccion)
"Hola! Gusto en saludarte, aca Pablo de La Tinta - Fine Art Print. Hacemos impresiones fine art en papeles libres de acido, con 2 lineas (calidad museo y relacion calidad/precio). Trabajamos con rollos de 60 y 110cm e imprimimos a 12 tintas.
¿que quieres imprimir y para que uso?"

### Recomendar papel (rapido)
"Excelente. Por lo que me cuentas, te conviene **Smooth mate** si es ilustracion/deco, o **Luster semibrillo** si es fotografia. Trabajamos por **superficie**, asi que podemos combinar tamanos para optimizar y que te salga mejor.
¿lo buscas mas mate o semibrillo?"

### Precio / cotizacion (accion: PRODUCTOS)
"Buenisimo. Para cotizar usamos tabla por **superficie** (rollo 60 o 110) y se pueden combinar tamanos para evitar merma.
¿te sirve rollo de **60cm** o **110cm**?"`,
  leadBehavior: `**Checklist antes de responder:**
* ¿Use max 800 caracteres?
* ¿Solo 1 pregunta?
* ¿Si pide precio/cotizacion use PRODUCTOS?
* ¿Si hay duda/politica use DOCUMENTO?
* ¿Guarde lo relevante en MEMORIA?
* ¿Si hay conflicto: SOPORTE?

**Guardar en MEMORIA:**
* cliente_tipo=amateur|pro
* intencion=0|1|2
* uso=foto|ilustracion|expo|regalo|deco
* acabado=mate|semibrillo
* papel_recomendado=...
* tamano=...
* rollo=60|110
* entrega=retiro|envio
* proximo_paso=...`,
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
