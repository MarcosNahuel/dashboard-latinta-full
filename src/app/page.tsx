'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import { kpis, monthlyData, topProducts, categories, weekdayData, discountCodes, initialStrategies, generateSystemPrompt } from '@/lib/data';
import type { Strategy } from '@/lib/data';

const COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899'];

const colorClasses: Record<string, string> = {
  green: 'border-l-green-500',
  blue: 'border-l-blue-500',
  purple: 'border-l-purple-500',
  orange: 'border-l-orange-500',
  pink: 'border-l-pink-500',
  cyan: 'border-l-cyan-500',
  red: 'border-l-red-500',
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'general' | 'estrategia'>('general');
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      const res = await fetch('/api/system-prompt');
      const data = await res.json();
      if (data.success && data.strategies) {
        const merged = initialStrategies.map(initial => {
          const saved = data.strategies.find((s: Strategy) => s.id === initial.id);
          return saved ? { ...initial, ...saved } : initial;
        });
        setStrategies(merged);
        if (data.updatedAt) {
          setLastSaved(data.updatedAt);
        }
      }
    } catch (error) {
      console.log('Usando estrategias locales');
    }
  };

  const saveStrategies = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/system-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategies }),
      });
      const data = await res.json();
      if (data.success) {
        setLastSaved(new Date().toISOString());
        toast.success(data.source === 'upstash' ? 'Guardado en Upstash' : 'Guardado localmente');
      } else {
        toast.error('Error al guardar');
      }
    } catch (error) {
      toast.error('Error de conexion');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStrategy = (id: string) => {
    setStrategies(prev =>
      prev.map(s => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedStrategies(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updateStrategy = (id: string, field: string, value: string) => {
    setStrategies(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        if (field === 'title' || field === 'description') {
          return { ...s, [field]: value };
        }
        if (field === 'example.cliente' || field === 'example.agente') {
          const exampleField = field.split('.')[1] as 'cliente' | 'agente';
          return { ...s, example: { ...s.example, [exampleField]: value } };
        }
        return s;
      })
    );
  };

  const deleteStrategy = (id: string) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
    toast.success('Estrategia eliminada');
  };

  const addStrategy = () => {
    const newStrategy: Strategy = {
      id: `strategy-${Date.now()}`,
      title: 'Nueva Estrategia',
      icon: '💡',
      color: 'purple',
      description: 'Descripcion de la nueva estrategia...',
      example: {
        cliente: 'Ejemplo de mensaje del cliente',
        agente: 'Ejemplo de respuesta del agente',
      },
      isActive: true,
    };
    setStrategies(prev => [...prev, newStrategy]);
    setExpandedStrategies(prev => new Set(prev).add(newStrategy.id));
    toast.success('Nueva estrategia agregada');
  };

  const copyEndpoint = () => {
    const url = `${window.location.origin}/api/system-prompt`;
    navigator.clipboard.writeText(url);
    toast.success('URL copiada al portapapeles');
  };

  const copyPrompt = () => {
    const prompt = generateSystemPrompt(strategies);
    navigator.clipboard.writeText(prompt);
    toast.success('System Prompt copiado');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                🎨
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">La Tinta Fine Art Print</h1>
                <p className="text-sm text-gray-400">Centro de Control & Estrategias</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
              >
                📊 General
              </button>
              <button
                onClick={() => setActiveTab('estrategia')}
                className={`tab-button ${activeTab === 'estrategia' ? 'active' : ''}`}
              >
                🎯 Estrategia
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'general' ? (
          <GeneralTab />
        ) : (
          <EstrategiaTab
            strategies={strategies}
            expandedStrategies={expandedStrategies}
            isSaving={isSaving}
            lastSaved={lastSaved}
            toggleStrategy={toggleStrategy}
            toggleExpand={toggleExpand}
            updateStrategy={updateStrategy}
            deleteStrategy={deleteStrategy}
            addStrategy={addStrategy}
            saveStrategies={saveStrategies}
            copyEndpoint={copyEndpoint}
            copyPrompt={copyPrompt}
          />
        )}
      </main>
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className="text-sm text-gray-400">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            {kpi.subtext && <div className="text-xs text-gray-500 mt-1">{kpi.subtext}</div>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Revenue Mensual</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">📦 Ordenes por Mes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Categories Pie */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Categorias</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categories}
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {categories.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekday Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">📅 Ordenes por Dia</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekdayData}>
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Discount Codes */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">🎟️ Codigos de Descuento</h3>
          <div className="space-y-3">
            {discountCodes.map((code, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
                <div>
                  <span className="font-mono text-purple-400">{code.code}</span>
                  <span className="text-gray-500 text-sm ml-2">({code.uses} usos)</span>
                </div>
                <span className="text-green-400">${code.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">🏆 Top Productos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3">Producto</th>
                <th className="pb-3 text-right">Revenue</th>
                <th className="pb-3 text-right">Unidades</th>
                <th className="pb-3 text-right">Ordenes</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 text-white">{product.name}</td>
                  <td className="py-3 text-right text-green-400">${product.revenue.toLocaleString()}</td>
                  <td className="py-3 text-right text-gray-300">{product.qty}</td>
                  <td className="py-3 text-right text-gray-300">{product.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface EstrategiaTabProps {
  strategies: Strategy[];
  expandedStrategies: Set<string>;
  isSaving: boolean;
  lastSaved: string | null;
  toggleStrategy: (id: string) => void;
  toggleExpand: (id: string) => void;
  updateStrategy: (id: string, field: string, value: string) => void;
  deleteStrategy: (id: string) => void;
  addStrategy: () => void;
  saveStrategies: () => void;
  copyEndpoint: () => void;
  copyPrompt: () => void;
}

function EstrategiaTab({
  strategies,
  expandedStrategies,
  isSaving,
  lastSaved,
  toggleStrategy,
  toggleExpand,
  updateStrategy,
  deleteStrategy,
  addStrategy,
  saveStrategies,
  copyEndpoint,
  copyPrompt,
}: EstrategiaTabProps) {
  const activeCount = strategies.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Canvas de Estrategias</h2>
          <p className="text-gray-400">
            {activeCount} de {strategies.length} estrategias activas
            {lastSaved && (
              <span className="ml-2 text-sm text-gray-500">
                • Guardado: {new Date(lastSaved).toLocaleString('es-CL')}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={addStrategy} className="btn-secondary flex items-center gap-2">
            ➕ Agregar
          </button>
          <button
            onClick={saveStrategies}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? '⏳ Guardando...' : '💾 Guardar en n8n'}
          </button>
        </div>
      </div>

      {/* Endpoint Info */}
      <div className="card bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              🔗 Endpoint para n8n
            </h3>
            <code className="text-sm text-purple-300 bg-black/30 px-2 py-1 rounded mt-1 inline-block">
              GET /api/system-prompt
            </code>
          </div>
          <div className="flex gap-2">
            <button onClick={copyEndpoint} className="btn-secondary text-sm">
              📋 Copiar URL
            </button>
            <button onClick={copyPrompt} className="btn-secondary text-sm">
              📝 Copiar Prompt
            </button>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="space-y-4">
        {strategies.map(strategy => {
          const isExpanded = expandedStrategies.has(strategy.id);
          return (
            <div
              key={strategy.id}
              className={`card border-l-4 ${colorClasses[strategy.color]} ${
                !strategy.isActive ? 'opacity-50' : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => toggleExpand(strategy.id)}
                >
                  <span className="text-2xl">{strategy.icon}</span>
                  <div className="flex-1">
                    {isExpanded ? (
                      <input
                        type="text"
                        value={strategy.title}
                        onChange={e => updateStrategy(strategy.id, 'title', e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="bg-transparent border-b border-gray-600 focus:border-purple-500 outline-none"
                      />
                    ) : (
                      <h4 className="font-semibold text-white">{strategy.title}</h4>
                    )}
                  </div>
                  <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleStrategy(strategy.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      strategy.isActive
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {strategy.isActive ? 'Activa' : 'Inactiva'}
                  </button>
                  <button
                    onClick={() => deleteStrategy(strategy.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-gray-700 pt-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Descripcion</label>
                    <textarea
                      value={strategy.description}
                      onChange={e => updateStrategy(strategy.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">💬 Ejemplo Cliente</label>
                      <textarea
                        value={strategy.example.cliente}
                        onChange={e => updateStrategy(strategy.id, 'example.cliente', e.target.value)}
                        rows={2}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">🤖 Respuesta Agente</label>
                      <textarea
                        value={strategy.example.agente}
                        onChange={e => updateStrategy(strategy.id, 'example.agente', e.target.value)}
                        rows={2}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })})
      </div>

      {/* System Prompt Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">👁️ Vista Previa del System Prompt</h3>
        <div className="preview-box">
          {generateSystemPrompt(strategies)}
        </div>
      </div>
    </div>
  );
}
