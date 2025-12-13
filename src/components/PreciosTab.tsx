'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function PreciosTab() {
  const [precios, setPrecios] = useState<any[]>([]);
  const [filteredPrecios, setFilteredPrecios] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    paperId: string;
    measure: string;
    currentPrice: number;
  } | null>(null);

  useEffect(() => {
    loadPrecios();
  }, []);

  useEffect(() => {
    filterPrecios();
  }, [searchTerm, lineFilter, precios]);

  const loadPrecios = async () => {
    try {
      const res = await fetch('/api/precios');
      const data = await res.json();
      setPrecios(data);
      setFilteredPrecios(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading prices:', error);
      toast.error('Error al cargar los precios');
      setLoading(false);
    }
  };

  const filterPrecios = () => {
    let filtered = precios;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.paper_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.finish?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (lineFilter) {
      filtered = filtered.filter((p) => p.line === lineFilter);
    }

    setFilteredPrecios(filtered);
  };

  const exportToExcel = async () => {
    try {
      const res = await fetch('/api/precios/export');
      if (!res.ok) throw new Error('Error al exportar');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'precios_latinta.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Excel descargado correctamente');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error al descargar Excel');
    }
  };

  const importFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Archivo inválido. Use .xlsx o .xls');
      return;
    }

    const confirmed = confirm(
      `¿Seguro que deseas importar "${file.name}"?\n\nEsto actualizará todos los precios en la base de datos.`
    );

    if (!confirmed) {
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/precios/import', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`✅ Precios actualizados!\n${result.count} registros importados.`);
        loadPrecios();
      } else {
        toast.error('❌ Error al importar: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('❌ Error al conectar con el servidor');
    } finally {
      e.target.value = '';
    }
  };

  const updatePrice = async () => {
    if (!editModal) return;

    const newPrice = (document.getElementById('modalPrice') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/precios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper_id: editModal.paperId,
          measure_label: editModal.measure,
          price_clp: newPrice,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('Precio actualizado correctamente');
        setEditModal(null);
        loadPrecios();
      } else {
        toast.error('Error al actualizar el precio');
      }
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const stats = {
    total: precios.length,
    papers: new Set(precios.map((p) => p.paper_id)).size,
    avgPrice: Math.round(
      precios.reduce((sum, p) => sum + parseFloat(p.price_clp || 0), 0) / precios.length || 0
    ),
    maxPrice: Math.max(...precios.map((p) => parseFloat(p.price_clp || 0)), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Administración de Precios</h2>
          <p className="text-gray-400">Gestiona los precios de todos los productos y medidas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-sm text-gray-400">Total Registros</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📄</span>
            <span className="text-sm text-gray-400">Tipos de Papel</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.papers}</div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💵</span>
            <span className="text-sm text-gray-400">Precio Promedio</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats.avgPrice.toLocaleString('es-CL')}
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔝</span>
            <span className="text-sm text-gray-400">Precio Máximo</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats.maxPrice.toLocaleString('es-CL')}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre de papel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select value={lineFilter} onChange={(e) => setLineFilter(e.target.value)}>
            <option value="">Todas las líneas</option>
            <option value="Studio/Photo">Studio/Photo</option>
            <option value="Museo">Museo</option>
          </select>
          <button onClick={exportToExcel} className="btn-secondary whitespace-nowrap">
            📥 Descargar Excel
          </button>
          <label className="btn-secondary whitespace-nowrap cursor-pointer">
            📤 Cargar Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={importFromExcel}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Cargando precios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3">Papel</th>
                  <th className="pb-3">Línea</th>
                  <th className="pb-3">Acabado</th>
                  <th className="pb-3">Gramaje</th>
                  <th className="pb-3">Medida</th>
                  <th className="pb-3 text-right">Precio CLP</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrecios.map((precio, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-3 text-white">{precio.paper_name}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          precio.line === 'Museo'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {precio.line}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">{precio.finish}</td>
                    <td className="py-3 text-gray-300">{precio.grams}grs</td>
                    <td className="py-3 text-gray-300">{precio.measure_label}</td>
                    <td className="py-3 text-right text-green-400">
                      ${parseInt(precio.price_clp).toLocaleString('es-CL')}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() =>
                          setEditModal({
                            open: true,
                            paperId: precio.paper_id,
                            measure: precio.measure_label,
                            currentPrice: precio.price_clp,
                          })
                        }
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Editar Precio</h3>
              <button
                onClick={() => setEditModal(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Papel</label>
                <input
                  type="text"
                  value={editModal.paperId.replace(/_/g, ' ')}
                  disabled
                  className="w-full opacity-50"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Medida</label>
                <input
                  type="text"
                  value={editModal.measure}
                  disabled
                  className="w-full opacity-50"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Precio CLP</label>
                <input
                  id="modalPrice"
                  type="number"
                  defaultValue={editModal.currentPrice}
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button onClick={updatePrice} className="btn-primary flex-1">
                  💾 Guardar
                </button>
                <button onClick={() => setEditModal(null)} className="btn-secondary flex-1">
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
