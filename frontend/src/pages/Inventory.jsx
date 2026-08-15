import { useEffect, useState } from 'react';
import { api } from '../api';

const CONDITIONS = ['new', 'good', 'worn', 'damaged', 'contaminated'];

const EMPTY_FORM = {
  batch_code: '', fabric_type: '', source: '', quantity_kg: '', color: '', condition: 'good', notes: '',
};

export default function Inventory() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterFabric, setFilterFabric] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterFabric) params.fabric_type = filterFabric;
      if (filterCondition) params.condition = filterCondition;
      const data = await api.listBatches(params);
      setBatches(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filterCondition]); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(batch) {
    setEditingId(batch.id);
    setForm({
      batch_code: batch.batch_code,
      fabric_type: batch.fabric_type,
      source: batch.source,
      quantity_kg: batch.quantity_kg,
      color: batch.color || '',
      condition: batch.condition,
      notes: batch.notes || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, quantity_kg: parseFloat(form.quantity_kg) };
      if (editingId) {
        const { batch_code, ...updatable } = payload;
        await api.updateBatch(editingId, updatable);
      } else {
        await api.createBatch(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this waste batch from inventory?')) return;
    try {
      await api.deleteBatch(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Textile Inventory &amp; Waste Management</h1>
        <p>Register, track, and monitor incoming textile waste batches.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <div className="filters">
          <input
            placeholder="Filter by fabric type…"
            value={filterFabric}
            onChange={(e) => setFilterFabric(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)}>
            <option value="">All conditions</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={load}>Apply</button>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Register waste batch</button>
      </div>

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading inventory…</p>
        ) : batches.length === 0 ? (
          <p className="empty-state">No waste batches match your filters. Register a new batch to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Fabric</th>
                <th>Source</th>
                <th>Qty (kg)</th>
                <th>Color</th>
                <th>Condition</th>
                <th>Collected</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td className="mono">{b.batch_code}</td>
                  <td>{b.fabric_type}</td>
                  <td>{b.source}</td>
                  <td className="mono">{b.quantity_kg}</td>
                  <td>{b.color || '—'}</td>
                  <td><span className={`badge badge-${b.condition}`}>{b.condition}</span></td>
                  <td>{new Date(b.collection_date).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary" onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit waste batch' : 'Register waste batch'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="field">
                  <label>Batch ID</label>
                  <input
                    value={form.batch_code}
                    onChange={(e) => setForm({ ...form, batch_code: e.target.value })}
                    disabled={!!editingId}
                    placeholder="e.g. WB-2026-001"
                    required
                  />
                </div>
                <div className="field">
                  <label>Fabric type</label>
                  <input
                    value={form.fabric_type}
                    onChange={(e) => setForm({ ...form, fabric_type: e.target.value })}
                    placeholder="Cotton, Denim, Polyester…"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Source</label>
                  <input
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    placeholder="Factory, donation drive…"
                    required
                  />
                </div>
                <div className="field">
                  <label>Quantity (kg)</label>
                  <input
                    type="number" step="0.1" min="0"
                    value={form.quantity_kg}
                    onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Color</label>
                  <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                </div>
                <div className="field">
                  <label>Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Register batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
