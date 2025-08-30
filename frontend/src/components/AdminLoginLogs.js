// frontend/src/components/AdminLoginLogs.js
import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api'; // asegúrate que existe (como hicimos)
                                        // y agrega el token automáticamente

const ROLES = [
  { value: '', label: 'Todos' },
  { value: 'admin', label: 'Admin' },
  { value: 'carniceria', label: 'Carnicería' },
  { value: 'cliente', label: 'Cliente' },
];

const formatDate = (v) => {
  const d = v ? new Date(v) : null;
  return (d && !isNaN(d)) ? d.toLocaleString('es-CL', { hour12: false }) : '-';
};

export default function AdminLoginLogs() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 20 });

  // filtros
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);

  // selección para borrado
  const [selected, setSelected] = useState(new Set());
  const allSelected = useMemo(
    () => items.length > 0 && items.every(x => selected.has(x._id)),
    [items, selected]
  );

  const fetchLogs = async (goToPage = page) => {
    const qs = new URLSearchParams({
      page: String(goToPage),
      limit: String(limit),
      sort,
    });
    if (search) qs.set('search', search);
    if (role) qs.set('role', role);
    if (from) qs.set('from', from);
    if (to)   qs.set('to', to);

    const res = await apiFetch(`/api/logs?${qs.toString()}`);
    setItems(res.items || []);
    setMeta(res.meta || { total: 0, page: goToPage, pages: 1, limit });
    setPage(res.meta?.page || goToPage);
    setSelected(new Set());
  };

 useEffect(() => {
  fetchLogs(1);
}, [limit, sort]); // sin comentario


  const onApplyFilters = () => fetchLogs(1);
  const onClearFilters = () => {
    setSearch(''); setRole(''); setFrom(''); setTo('');
    fetchLogs(1);
  };

  const toggleRow = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(x => x._id)));
    }
  };

  const deleteSelected = async () => {
    if (!selected.size) return;
    if (!window.confirm(`¿Eliminar ${selected.size} registro(s) seleccionados?`)) return;

    await apiFetch('/api/logs', {
      method: 'DELETE',
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    fetchLogs();
  };

  const deleteBefore = async () => {
    const date = prompt('Eliminar todos los logs ANTES de (YYYY-MM-DD):');
    if (!date) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return alert('Formato inválido');
    if (!window.confirm(`¿Eliminar logs anteriores a ${date}?`)) return;

    await apiFetch('/api/logs', {
      method: 'DELETE',
      body: JSON.stringify({ before: new Date(`${date}T00:00:00`).toISOString() }),
    });
    fetchLogs();
  };

  const deleteRange = async () => {
    const a = prompt('Eliminar logs DESDE (YYYY-MM-DD):') || '';
    const b = prompt('Eliminar logs HASTA (YYYY-MM-DD):') || '';
    if (!a && !b) return;
    if (a && !/^\d{4}-\d{2}-\d{2}$/.test(a)) return alert('Desde inválido');
    if (b && !/^\d{4}-\d{2}-\d{2}$/.test(b)) return alert('Hasta inválido');

    await apiFetch('/api/logs', {
      method: 'DELETE',
      body: JSON.stringify({
        from: a ? new Date(`${a}T00:00:00`).toISOString() : undefined,
        to:   b ? new Date(`${b}T23:59:59`).toISOString() : undefined,
      }),
    });
    fetchLogs();
  };

  const deleteAll = async () => {
    if (!window.confirm('⚠️ Esto eliminará TODOS los logs. ¿Continuar?')) return;
    await apiFetch('/api/logs', { method: 'DELETE', body: JSON.stringify({ all: true }) });
    fetchLogs(1);
  };

  const goPrev = () => page > 1 && fetchLogs(page - 1);
  const goNext = () => page < meta.pages && fetchLogs(page + 1);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Logs de Inicio de Sesión</h2>

      {/* Filtros - Mobile Responsive */}
      <div className="bg-gray-100 p-3 sm:p-4 rounded mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre/email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          >
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <input
            type="date"
            placeholder="Desde"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          />
          <input
            type="date"
            placeholder="Hasta"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
          <button
            onClick={onApplyFilters}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base touch-manipulation"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={onClearFilters}
            className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-gray-700 text-sm sm:text-base touch-manipulation"
          >
            Limpiar
          </button>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          >
            <option value="desc">Más recientes</option>
            <option value="asc">Más antiguos</option>
          </select>
        </div>
      </div>

      {/* Acciones masivas - Mobile Responsive */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-2">
        <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
          <button onClick={()=>fetchLogs(page)} className="bg-gray-200 px-2 sm:px-3 py-1 rounded hover:bg-gray-300 text-xs sm:text-sm touch-manipulation">Actualizar</button>
          <button disabled={!selected.size} onClick={deleteSelected} className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm touch-manipulation ${selected.size ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
            Eliminar ({selected.size})
          </button>
          <button onClick={deleteBefore} className="bg-orange-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-orange-600 text-xs sm:text-sm touch-manipulation">Por fecha…</button>
          <button onClick={deleteRange}  className="bg-orange-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-orange-600 text-xs sm:text-sm touch-manipulation">Por rango…</button>
          <button onClick={deleteAll}    className="bg-black text-white px-2 sm:px-3 py-1 rounded hover:bg-gray-800 text-xs sm:text-sm touch-manipulation">Eliminar TODO</button>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-0">
          Total: {meta.total}
        </div>
      </div>

      {/* Tabla - Mobile Responsive */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1 sm:p-2 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="touch-manipulation" /></th>
              <th className="p-1 sm:p-2 text-left">Usuario</th>
              <th className="p-1 sm:p-2 text-left hidden sm:table-cell">Email</th>
              <th className="p-1 sm:p-2 text-left">Rol</th>
              <th className="p-1 sm:p-2 text-left hidden md:table-cell">IP</th>
              <th className="p-1 sm:p-2 text-left">Fecha</th>
              <th className="p-1 sm:p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row._id} className="border-t">
                <td className="p-1 sm:p-2">
                  <input
                    type="checkbox"
                    checked={selected.has(row._id)}
                    onChange={() => toggleRow(row._id)}
                    className="touch-manipulation"
                  />
                </td>
                <td className="p-1 sm:p-2 truncate max-w-24 sm:max-w-none">{row.name}</td>
                <td className="p-1 sm:p-2 hidden sm:table-cell truncate">{row.email}</td>
                <td className="p-1 sm:p-2">{row.role}</td>
                <td className="p-1 sm:p-2 hidden md:table-cell">{row.ip || '-'}</td>
                <td className="p-1 sm:p-2 text-xs sm:text-sm">{formatDate(row.createdAt)}</td>
                <td className="p-1 sm:p-2">
                  <button
                    className="text-red-600 hover:underline text-xs sm:text-sm touch-manipulation"
                    onClick={async () => {
                      if (!window.confirm('¿Eliminar este log?')) return;
                      await apiFetch(`/api/logs/${row._id}`, { method: 'DELETE' });
                      fetchLogs(page);
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-4 text-center text-gray-500" colSpan={7}>Sin registros</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-3 flex items-center gap-2">
        <button disabled={page<=1} onClick={goPrev} className={`px-3 py-1 rounded ${page<=1?'bg-gray-200 text-gray-400':'bg-gray-100 hover:bg-gray-200'}`}>Anterior</button>
        <span className="text-sm">Página {meta.page} de {meta.pages}</span>
        <button disabled={page>=meta.pages} onClick={goNext} className={`px-3 py-1 rounded ${page>=meta.pages?'bg-gray-200 text-gray-400':'bg-gray-100 hover:bg-gray-200'}`}>Siguiente</button>
      </div>
    </div>
  );
}
