// Storage para estrategias usando Upstash Redis
import { Redis } from '@upstash/redis';
import { Strategy, initialStrategies, generateSystemPrompt } from './data';

// Crear cliente Redis (configurar variables de entorno en Vercel)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const STRATEGIES_KEY = 'latinta:strategies';
const UPDATED_AT_KEY = 'latinta:updatedAt';

// Obtener estrategias (de Redis o iniciales)
export async function getStrategies(): Promise<Strategy[]> {
  if (!redis) {
    console.log('Redis no configurado, usando estrategias iniciales');
    return initialStrategies;
  }

  try {
    const stored = await redis.get<Strategy[]>(STRATEGIES_KEY);
    if (stored && Array.isArray(stored)) {
      return stored;
    }
    return initialStrategies;
  } catch (error) {
    console.error('Error obteniendo estrategias de Redis:', error);
    return initialStrategies;
  }
}

// Guardar estrategias
export async function saveStrategies(strategies: Strategy[]): Promise<boolean> {
  if (!redis) {
    console.log('Redis no configurado, no se pueden guardar');
    return false;
  }

  try {
    await redis.set(STRATEGIES_KEY, strategies);
    await redis.set(UPDATED_AT_KEY, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Error guardando estrategias en Redis:', error);
    return false;
  }
}

// Obtener fecha de ultima actualizacion
export async function getUpdatedAt(): Promise<string | null> {
  if (!redis) return null;

  try {
    return await redis.get<string>(UPDATED_AT_KEY);
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
    source: redis ? 'upstash' : 'local'
  };
}
