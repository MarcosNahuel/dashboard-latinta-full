// Storage para estrategias usando Supabase
import { createClient } from '@supabase/supabase-js';
import { Strategy, initialStrategies, generateSystemPrompt } from './data';

// Crear cliente Supabase
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
  : null;

// Obtener estrategias (de Supabase o iniciales)
export async function getStrategies(): Promise<Strategy[]> {
  if (!supabase) {
    console.log('Supabase no configurado, usando estrategias iniciales');
    return initialStrategies;
  }

  try {
    const { data, error } = await supabase
      .from('latinta_strategies')
      .select('strategies, updated_at')
      .eq('id', 'main')
      .single();

    if (error || !data) {
      return initialStrategies;
    }

    return data.strategies as Strategy[];
  } catch (error) {
    console.error('Error obteniendo estrategias de Supabase:', error);
    return initialStrategies;
  }
}

// Guardar estrategias
export async function saveStrategies(strategies: Strategy[]): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase no configurado, no se pueden guardar');
    return false;
  }

  try {
    const { error } = await supabase
      .from('latinta_strategies')
      .upsert({
        id: 'main',
        strategies: strategies,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error guardando:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error guardando estrategias en Supabase:', error);
    return false;
  }
}

// Obtener fecha de ultima actualizacion
export async function getUpdatedAt(): Promise<string | null> {
  if (!supabase) return null;

  try {
    const { data } = await supabase
      .from('latinta_strategies')
      .select('updated_at')
      .eq('id', 'main')
      .single();

    return data?.updated_at || null;
  } catch {
    return null;
  }
}

// Generar respuesta para API
export async function getSystemPromptResponse() {
  const strategies = await getStrategies();
  const updatedAt = await getUpdatedAt();
  const prompt = generateSystemPrompt(strategies);

  return {
    success: true,
    prompt,
    strategies: strategies.filter(s => s.isActive),
    updatedAt: updatedAt || new Date().toISOString(),
    source: supabase ? 'supabase' : 'local'
  };
}
