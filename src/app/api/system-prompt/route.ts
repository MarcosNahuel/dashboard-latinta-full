import { NextResponse } from 'next/server';
import { getSystemPromptResponse, saveStrategies } from '@/lib/storage';
import { Strategy } from '@/lib/data';

// GET: Obtener system prompt para n8n
export async function GET() {
  try {
    const response = await getSystemPromptResponse();
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en GET /api/system-prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo estrategias' },
      { status: 500 }
    );
  }
}

// POST: Actualizar estrategias desde el dashboard
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const strategies: Strategy[] = body.strategies;

    if (!strategies || !Array.isArray(strategies)) {
      return NextResponse.json(
        { success: false, error: 'Estrategias invalidas' },
        { status: 400 }
      );
    }

    const saved = await saveStrategies(strategies);

    if (!saved) {
      // Si no hay Redis, simular exito pero informar
      return NextResponse.json({
        success: true,
        message: 'Estrategias actualizadas (modo local)',
        source: 'local'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Estrategias guardadas en Upstash',
      source: 'upstash'
    });
  } catch (error) {
    console.error('Error en POST /api/system-prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Error guardando estrategias' },
      { status: 500 }
    );
  }
}
