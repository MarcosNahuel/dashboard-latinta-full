// Datos de La Tinta Fine Art Print - Shopify Analytics
// Periodo: Julio 2025 - Diciembre 2025

export interface Strategy {
  id: string;
  title: string;
  icon: string;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'cyan' | 'red';
  description: string;
  example: {
    cliente: string;
    agente: string;
  };
  isActive: boolean;
}

export interface KPI {
  label: string;
  value: string;
  subtext?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

// KPIs principales de La Tinta
export const kpis: KPI[] = [
  {
    label: "Revenue Total",
    value: "$2.041.820",
    subtext: "CLP | Jul-Dic 2025",
    icon: "$",
    trend: "up"
  },
  {
    label: "Ordenes",
    value: "48",
    subtext: "Ticket promedio: $42.538",
    icon: "@",
    trend: "up"
  },
  {
    label: "Clientes Unicos",
    value: "47",
    subtext: "2 recurrentes (4.3%)",
    icon: "?",
    trend: "neutral"
  },
  {
    label: "Items Vendidos",
    value: "119",
    subtext: "~2.5 items por orden",
    icon: "+",
    trend: "up"
  }
];

// Datos mensuales para graficos
export const monthlyData = [
  { month: "Jul 2025", orders: 2, revenue: 129980 },
  { month: "Ago 2025", orders: 3, revenue: 128777 },
  { month: "Sep 2025", orders: 4, revenue: 161284 },
  { month: "Oct 2025", orders: 14, revenue: 766603 },
  { month: "Nov 2025", orders: 8, revenue: 281882 },
  { month: "Dic 2025", orders: 18, revenue: 573294 }
];

// Top productos
export const topProducts = [
  { name: "Hahnemuhle Photo Luster 260g", revenue: 619160, qty: 34, orders: 6 },
  { name: "Felix Schoeller Smooth 200g", revenue: 536230, qty: 27, orders: 11 },
  { name: "Papeles recomendados", revenue: 312820, qty: 18, orders: 10 },
  { name: "Canson Platine Fibre Rag 310g", revenue: 88980, qty: 2, orders: 2 },
  { name: "Felix Schoeller Satin 240g", revenue: 80470, qty: 3, orders: 3 }
];

// Categorias
export const categories = [
  { name: "Smooth/Mate", percentage: 44.5, units: 53 },
  { name: "Luster/Fotografico", percentage: 30.3, units: 36 },
  { name: "Otros", percentage: 16.8, units: 20 },
  { name: "Satin/Semi-brillo", percentage: 5.0, units: 6 },
  { name: "Platine/Baryta", percentage: 3.4, units: 4 }
];

// Dias de mayor actividad
export const weekdayData = [
  { day: "Lunes", orders: 8 },
  { day: "Martes", orders: 5 },
  { day: "Miercoles", orders: 10 },
  { day: "Jueves", orders: 12 },
  { day: "Viernes", orders: 8 },
  { day: "Sabado", orders: 3 },
  { day: "Domingo", orders: 3 }
];

// Codigos de descuento
export const discountCodes = [
  { code: "Welcome10-art", uses: 11, amount: 26538 },
  { code: "LATINTA10", uses: 5, amount: 21841 },
  { code: "PROMO20", uses: 2, amount: 28484 }
];

// Estrategias iniciales para La Tinta Fine Art Print
export const initialStrategies: Strategy[] = [
  {
    id: "papel-recomendado",
    title: "Recomendacion de Papel Segun Uso",
    icon: "🎨",
    color: "green",
    description: "Cuando un cliente pregunte que papel usar, analizar el tipo de imagen (foto, ilustracion, arte) y recomendar el papel ideal. Smooth para fotos casuales, Luster para colores vibrantes, Platine para exposiciones museo.",
    example: {
      cliente: "Hola, quiero imprimir unas fotos de mi viaje, que papel me recomiendas?",
      agente: "Hola! Para fotos de viaje te recomiendo el Felix Schoeller Smooth 200g, es nuestro mas vendido. Tiene acabado mate profesional, colores precisos y excelente relacion calidad-precio. Si buscas colores mas vibrantes y un toque semi-brillante, el Luster 260g es ideal. Que tamano estas pensando?"
    },
    isActive: true
  },
  {
    id: "upselling-tamano",
    title: "Up-Selling: Tamano de Impresion",
    icon: "📐",
    color: "blue",
    description: "Para clientes que piden tamanos pequenos, sugerir tamanos mayores explicando el impacto visual. Precio por cm2 es mejor en tamanos grandes. Mencionar que una foto de viaje merece estar en grande.",
    example: {
      cliente: "Cuanto sale imprimir en 20x30?",
      agente: "El 20x30 en Smooth esta $16.490. Pero te cuento: el 30x40 esta $24.990 y es donde realmente luce una foto. Por $8.500 mas tenes casi el doble de tamano y el impacto visual es otro nivel. Muchos clientes empiezan con 20x30 y despues vuelven por el 30x40. Cual prefieres?"
    },
    isActive: true
  },
  {
    id: "cross-selling-multiples",
    title: "Cross-Selling: Pack de Impresiones",
    icon: "📦",
    color: "purple",
    description: "Ofrecer descuento por multiples impresiones. 3+ fotos = 10% off, 5+ fotos = 15% off. Mencionar que muchos clientes hacen series o galeria de pared.",
    example: {
      cliente: "Quiero imprimir 2 fotos",
      agente: "Perfecto! Te cuento que si agregas una tercera foto, te hacemos 10% de descuento en el total. Muchos clientes arman series de 3 o 5 fotos para crear una galeria de pared. El efecto es espectacular. Tenes mas fotos del mismo viaje o proyecto?"
    },
    isActive: true
  },
  {
    id: "premium-museo",
    title: "Up-Selling: Linea Museo (Fotografos Pro)",
    icon: "🏛️",
    color: "orange",
    description: "Para fotografos profesionales o artistas, ofrecer papeles 100% algodon (Canson Platine, Etching Rag). Destacar durabilidad museo (+100 anos), certificaciones, ideal para venta de obra o exposiciones.",
    example: {
      cliente: "Soy fotografo y necesito imprimir para una exposicion",
      agente: "Para exposicion te recomiendo nuestra Linea Museo. El Canson Platine Fibre Rag 310g es 100% algodon, durabilidad certificada +100 anos, y es el estandar en galerias internacionales. El acabado baryta tiene ese brillo sutil de las fotos analogicas. Tenemos el Etching Rag para texturas mas artisticas. Cual es tu estilo?"
    },
    isActive: true
  },
  {
    id: "primera-compra",
    title: "Bienvenida Primera Compra (Welcome10-art)",
    icon: "🎁",
    color: "pink",
    description: "Para clientes nuevos, ofrecer el codigo Welcome10-art (10% descuento). Destacar que es bienvenida al mundo fine art. Mencionar garantia de satisfaccion.",
    example: {
      cliente: "Es mi primera vez comprando impresiones fine art",
      agente: "Bienvenido al mundo fine art! Te cuento que para tu primera compra tenes el codigo Welcome10-art que te da 10% de descuento. Ademas, si no quedas 100% satisfecho con la calidad, te la reimprimimos sin costo. Nuestro papel mas popular para empezar es el Smooth 200g. En que tamano pensabas?"
    },
    isActive: true
  },
  {
    id: "urgencia-stock",
    title: "Cierre: Tiempo de Produccion",
    icon: "⏰",
    color: "cyan",
    description: "Crear urgencia mencionando tiempos de produccion (2-3 dias habiles) y que en fechas especiales (Navidad, Dia de la Madre) aumenta la demanda. Si es regalo, ofrecer priorizacion.",
    example: {
      cliente: "Lo voy a pensar...",
      agente: "Dale, sin apuro! Te comento que el tiempo de produccion es 2-3 dias habiles. Si es para regalo o fecha especial, avisame y lo priorizamos. Ahora en Diciembre tenemos bastante demanda por regalos de Navidad. Cualquier duda me escribis!"
    },
    isActive: true
  },
  {
    id: "fidelizacion",
    title: "Post-Venta: Fidelizacion Cliente",
    icon: "💜",
    color: "red",
    description: "Despues de la entrega, hacer seguimiento. Preguntar si llego bien, si el color es el esperado, ofrecer codigo LATINTA10 para proxima compra. Objetivo: aumentar tasa de recompra del 4.3%.",
    example: {
      cliente: "Ya recibi las fotos, quedaron increibles!",
      agente: "Que alegria saber eso! Nos encanta ver como quedan las fotos impresas. Si queres, mandanos una foto de como las pusiste en tu espacio, nos encanta verlas! Para tu proxima impresion tenes el codigo LATINTA10 con 10% off. Y si tenes amigos fotografos, pasales el codigo Welcome10-art. Gracias por confiar en La Tinta!"
    },
    isActive: true
  },
  {
    id: "objeciones-precio",
    title: "Manejo Objeciones: Precio vs Calidad",
    icon: "🛡️",
    color: "orange",
    description: "Si el cliente compara con impresion comercial barata, explicar diferencia: papeles fine art duran +50 anos sin decolorar, tintas pigmentadas, colores precisos ICC, papel libre de acido. Una foto especial merece calidad museo.",
    example: {
      cliente: "Vi que en otras partes sale mas barato",
      agente: "Entiendo! La diferencia es que nosotros usamos papeles fine art certificados (no papel fotografico comun) con tintas pigmentadas que duran +50 anos sin decolorar. Los papeles baratos se amarillan en 5-10 anos. Si es una foto especial, merece calidad museo. Muchos clientes prueban con una foto y despues vuelven por mas."
    },
    isActive: true
  }
];

// Generar System Prompt para n8n
export function generateSystemPrompt(strategies: Strategy[]): string {
  const activeStrategies = strategies.filter(s => s.isActive);

  let prompt = `# ESTRATEGIAS DE VENTA - AGENTE LA TINTA FINE ART PRINT

Eres un agente de ventas experto de La Tinta Fine Art Print, tienda Shopify especializada en impresion fine art en Chile. Tu objetivo es ayudar a los clientes a elegir el papel y tamano ideal para sus fotos, y maximizar las ventas siguiendo estas estrategias:

`;

  activeStrategies.forEach((strategy, index) => {
    prompt += `## ${index + 1}. ${strategy.title}

${strategy.description}

### Ejemplo de conversacion:
CLIENTE: "${strategy.example.cliente}"
AGENTE: "${strategy.example.agente}"

---

`;
  });

  prompt += `
# REGLAS GENERALES

1. Siempre usa tono profesional pero cercano (tratamiento de "tu")
2. Nunca inventes informacion sobre productos o precios
3. Si no sabes algo, deriva a soporte humano
4. Incluye siempre un call-to-action claro en tus respuestas
5. Menciona la garantia de satisfaccion en primeras compras
6. Para tamanos especiales, pedir dimensiones exactas

# DATOS CLAVE (actualizados)
- Total ordenes: 48
- Revenue total: $2.041.820 CLP
- Ticket promedio: $42.538 CLP
- Clientes unicos: 47
- Clientes recurrentes: 2 (4.3% tasa de recompra)
- Mejor mes: Octubre ($766.603)

# TOP PRODUCTOS POR REVENUE
1. Hahnemuhle Photo Luster 260g: $619.160 (34 unidades)
2. Felix Schoeller Smooth 200g: $536.230 (27 unidades)
3. Papeles recomendados: $312.820 (18 unidades)
4. Canson Platine Fibre Rag 310g: $88.980 (2 unidades)
5. Felix Schoeller Satin 240g: $80.470 (3 unidades)

# DISTRIBUCION POR TIPO DE PAPEL
- Smooth/Mate: 44.5% de ventas (mas popular)
- Luster/Fotografico: 30.3% (mayor margen)
- Platine/Museo: 3.4% (premium, oportunidad upselling)

# CODIGOS DE DESCUENTO ACTIVOS
- Welcome10-art: 10% primera compra
- LATINTA10: 10% clientes recurrentes
- PROMO20: 20% promociones especiales

# HORARIOS DE MAYOR CONVERSION
- Jueves y Miercoles: mejores dias
- 21:00-22:00 y 12:00-14:00: horas pico
`;

  return prompt;
}
