import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export async function POST(request: NextRequest) {
  try {
    const { currentText, instruction, sectionType } = await request.json();

    if (!currentText || !instruction) {
      return NextResponse.json(
        { success: false, error: 'Faltan parametros requeridos' },
        { status: 400 }
      );
    }

    // Si no hay API key, usar modo simulado para desarrollo
    if (!GEMINI_API_KEY) {
      console.log('[Gemini API] Modo simulado - No hay API key configurada');

      // Simulacion de mejora basica
      const simulatedResponse = simulateImprovement(currentText, instruction, sectionType);

      return NextResponse.json({
        success: true,
        improvedText: simulatedResponse,
        mode: 'simulated',
      });
    }

    // Llamada real a Gemini API
    const prompt = buildGeminiPrompt(currentText, instruction, sectionType);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Gemini API] Error:', errorData);
      return NextResponse.json(
        { success: false, error: 'Error en la API de Gemini' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Extraer el texto de la respuesta
    const improvedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!improvedText) {
      return NextResponse.json(
        { success: false, error: 'No se pudo generar una respuesta' },
        { status: 500 }
      );
    }

    // Limpiar el texto (remover markdown code blocks si existen)
    const cleanedText = improvedText
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^[\s\n]+|[\s\n]+$/g, '')
      .trim();

    return NextResponse.json({
      success: true,
      improvedText: cleanedText,
      mode: 'live',
    });
  } catch (error) {
    console.error('[Gemini API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function buildGeminiPrompt(currentText: string, instruction: string, sectionType: string): string {
  return `Eres un experto en diseño de System Prompts para agentes de IA de ventas.

CONTEXTO:
- Negocio: La Tinta Fine Art Print (impresión fine art en Santiago, Chile)
- Canal: Instagram/WhatsApp via ManyChat
- Objetivo del agente: Convertir leads en clientes

SECCION A MEJORAR: ${sectionType}

TEXTO ACTUAL:
${currentText}

INSTRUCCION DEL USUARIO:
${instruction}

REGLAS:
1. Mantén el formato y estructura similar al original
2. Usa español chileno neutro y profesional
3. Sé conciso pero efectivo
4. No agregues información que no esté en el contexto
5. Si es una sección de constraints, mantén formato de lista
6. Responde SOLO con el texto mejorado, sin explicaciones

TEXTO MEJORADO:`;
}

function simulateImprovement(currentText: string, instruction: string, sectionType: string): string {
  // Simulaciones basicas para modo desarrollo sin API key
  const lowerInstruction = instruction.toLowerCase();

  if (lowerInstruction.includes('profesional') || lowerInstruction.includes('formal')) {
    return currentText
      .replace(/Hola!/g, 'Estimado cliente,')
      .replace(/Buenisimo/g, 'Excelente')
      .replace(/te cuento/g, 'le informamos')
      .replace(/tenes/g, 'tiene')
      .replace(/queres/g, 'desea');
  }

  if (lowerInstruction.includes('conciso') || lowerInstruction.includes('corto')) {
    // Acortar manteniendo esencia
    const lines = currentText.split('\n').filter((line) => line.trim());
    return lines.slice(0, Math.max(3, Math.ceil(lines.length * 0.7))).join('\n');
  }

  if (lowerInstruction.includes('persuasivo') || lowerInstruction.includes('ventas')) {
    return currentText + '\n\nRecuerda: cada interacción es una oportunidad de venta. Usa urgencia y beneficios claros.';
  }

  if (lowerInstruction.includes('amigable') || lowerInstruction.includes('cercano')) {
    return currentText
      .replace(/Estimado/g, 'Hola!')
      .replace(/le informamos/g, 'te cuento')
      .replace(/tiene/g, 'tienes')
      + '\n\n*Tip: Usa emojis con moderación para crear cercanía*';
  }

  // Default: pequeña mejora
  return `${currentText}\n\n[Mejorado segun: "${instruction}"]`;
}
