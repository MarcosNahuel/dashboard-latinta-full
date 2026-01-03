import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateAgentPrompt, defaultAgentConfig, AgentPromptConfig } from '@/lib/agentPrompt';

// Crear cliente Supabase
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
  : null;

// Obtener config del agente desde Supabase o usar default
async function getAgentConfig(): Promise<AgentPromptConfig> {
  if (!supabase) {
    return defaultAgentConfig;
  }

  try {
    const { data, error } = await supabase
      .from('latinta_agent_config')
      .select('config')
      .eq('id', 'main')
      .single();

    if (error || !data) {
      return defaultAgentConfig;
    }

    return data.config as AgentPromptConfig;
  } catch {
    return defaultAgentConfig;
  }
}

// GET: Obtener system prompt para n8n
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    const config = await getAgentConfig();
    const prompt = generateAgentPrompt(config);

    // Si format=raw, devolver solo el texto plano
    if (format === 'raw') {
      return new Response(prompt, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    // Por defecto, devolver JSON con metadata
    return NextResponse.json({
      success: true,
      prompt,
      config,
      source: supabase ? 'supabase' : 'local'
    });
  } catch (error) {
    console.error('Error en GET /api/playground-prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo prompt del agente' },
      { status: 500 }
    );
  }
}

// POST: Actualizar config del agente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config: AgentPromptConfig = body.config;

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Config invalida' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: 'Config actualizada (modo local)',
        source: 'local',
        prompt: generateAgentPrompt(config)
      });
    }

    const { error } = await supabase
      .from('latinta_agent_config')
      .upsert({
        id: 'main',
        config: config,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error guardando config:', error);
      return NextResponse.json(
        { success: false, error: 'Error guardando config' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Config guardada en Supabase',
      source: 'supabase',
      prompt: generateAgentPrompt(config)
    });
  } catch (error) {
    console.error('Error en POST /api/playground-prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Error actualizando config' },
      { status: 500 }
    );
  }
}
