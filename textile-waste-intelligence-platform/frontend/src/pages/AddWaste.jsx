import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PackagePlus, Upload, Image as ImageIcon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { wasteService } from '../services/wasteService';
import { FABRIC_TYPES, CONDITIONS, PROCESSING_STATUSES, ROLES } from '../constants';
import { useAuth } from '../hooks/useAuth';

const EMPTY_FORM = {
  batchId: '',
  fabricType: FABRIC_TYPES[0],
  source: '',
  quantity: '',
  color: '',
  condition: CONDITIONS[0],
  collectionDate: '',
  description: '',
  image: '',
  processingStatus: 'Pending',
};

const AddWaste = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRecyclerEdit = isEditMode && user?.role === ROLES.RECYCLER;
  const isReadOnly = user?.role === ROLES.SUSTAINABILITY_MANAGER;

  useEffect(() => {
    if (!isEditMode) return;
    wasteService
      .get(id)
      .then((res) => {
        const r = res.data.record;
        setForm({
          batchId: r.batchId,
          fabricType: r.fabricType,
          source: r.source,
          quantity: String(r.quantity),
          color: r.color,
          condition: r.condition,
          collectionDate: r.collectionDate?.slice(0, 10) || '',
          description: r.description || '',
          image: r.image || '',
          processingStatus: r.processingStatus || 'Pending',
        });
      })
      .catch(() => {
        toast.error('Could not load this waste batch');
        navigate('/inventory');
      })
      .finally(() => setIsLoading(false));
  }, [id, isEditMode, navigate]);

  const validate = () => {
    const next = {};
    if (!form.source.trim()) next.source = 'Source is required';
    if (!form.color.trim()) next.color = 'Color is required';
    if (!form.quantity || Number(form.quantity) <= 0) next.quantity = 'Enter a quantity greater than 0';
    if (!form.collectionDate) next.collectionDate = 'Collection date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => ({ ...f, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) {
      toast.error('Read-only users cannot modify inventory');
      return;
    }

    if (!isRecyclerEdit && !validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setIsSubmitting(true);
    
    // Auto-generate batch ID if empty
    const finalBatchId = form.batchId.trim() || `B-${Math.floor(10000 + Math.random() * 90000)}`;
    const payload = {
      ...form,
      batchId: finalBatchId,
      quantity: Number(form.quantity),
    };

    try {
      if (isEditMode) {
        await wasteService.update(id, payload);
        toast.success('Waste batch updated successfully');
      } else {
        await wasteService.create(payload);
        toast.success('Waste batch added successfully');
      }
      navigate('/inventory');
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading batch details…" />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
          <PackagePlus size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {isEditMode ? 'Edit Waste Batch' : 'Register Textile Waste'}
          </h1>
          <p className="text-sm text-ink/60">
            {isEditMode ? 'Update the details for this batch.' : 'Add a new batch to the inventory.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="card space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          
          {/* Batch ID */}
          <div>
            <label htmlFor="batchId" className="field-label">Waste Batch ID</label>
            <input
              id="batchId"
              className="input-field font-mono"
              placeholder="Auto-generates if left blank"
              value={form.batchId}
              onChange={handleChange('batchId')}
              disabled={isEditMode || isRecyclerEdit || isReadOnly}
            />
            {errors.batchId && <p className="field-error">{errors.batchId}</p>}
          </div>

          {/* Fabric Type */}
          <div>
            <label htmlFor="fabricType" className="field-label">Fabric Type</label>
            <select
              id="fabricType"
              className="input-field"
              value={form.fabricType}
              onChange={handleChange('fabricType')}
              disabled={isRecyclerEdit || isReadOnly}
            >
              {FABRIC_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Source */}
          <div className="sm:col-span-2">
            <label htmlFor="source" className="field-label">Source</label>
            <input
              id="source"
              className="input-field"
              placeholder="e.g. Cutting Floor A, Warehouse Returns"
              value={form.source}
              onChange={handleChange('source')}
              disabled={isRecyclerEdit || isReadOnly}
            />
            {errors.source && <p className="field-error">{errors.source}</p>}
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="field-label">Quantity (kg)</label>
            <input
              id="quantity"
              type="number"
              min="0.1"
              step="0.1"
              className="input-field"
              placeholder="420"
              value={form.quantity}
              onChange={handleChange('quantity')}
              disabled={isRecyclerEdit || isReadOnly}
            />
            {errors.quantity && <p className="field-error">{errors.quantity}</p>}
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="field-label">Color</label>
            <input
              id="color"
              className="input-field"
              placeholder="Indigo"
              value={form.color}
              onChange={handleChange('color')}
              disabled={isRecyclerEdit || isReadOnly}
            />
            {errors.color && <p className="field-error">{errors.color}</p>}
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="condition" className="field-label">Condition</label>
            <select
              id="condition"
              className="input-field"
              value={form.condition}
              onChange={handleChange('condition')}
              disabled={isRecyclerEdit || isReadOnly}
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Collection Date */}
          <div>
            <label htmlFor="collectionDate" className="field-label">Collection Date</label>
            <input
              id="collectionDate"
              type="date"
              className="input-field"
              value={form.collectionDate}
              onChange={handleChange('collectionDate')}
              disabled={isRecyclerEdit || isReadOnly}
            />
            {errors.collectionDate && <p className="field-error">{errors.collectionDate}</p>}
          </div>

          {/* Status (Only editable if Admin, Recycler, or when creating a new record) */}
          <div>
            <label htmlFor="processingStatus" className="field-label">Status</label>
            <select
              id="processingStatus"
              className="input-field animate-pulse border-forest-300 bg-forest-50/20"
              value={form.processingStatus}
              onChange={handleChange('processingStatus')}
              disabled={isReadOnly}
            >
              {PROCESSING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Description (Optional) */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="field-label">Description (optional)</label>
            <textarea
              id="description"
              className="input-field min-h-20"
              placeholder="Add batch notes, fiber composition, weave structure..."
              value={form.description}
              onChange={handleChange('description')}
              disabled={isRecyclerEdit || isReadOnly}
            />
          </div>

          {/* Image Upload (Optional) */}
          <div className="sm:col-span-2">
            <label className="field-label">Upload Textile Image (optional)</label>
            <div className="flex items-center gap-4 mt-2">
              {form.image ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-forest-100">
                  <img src={form.image} alt="Textile upload preview" className="h-full w-full object-cover" />
                  {!isRecyclerEdit && !isReadOnly && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: '' }))}
                      className="absolute right-1 top-1 bg-red-500 text-white rounded-full p-0.5 text-2xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-forest-50 border border-dashed border-forest-200 text-forest-600/50">
                  <ImageIcon size={28} />
                </div>
              )}
              {!isRecyclerEdit && !isReadOnly && (
                <label className="btn-secondary cursor-pointer flex items-center gap-1.5 py-2">
                  <Upload size={14} />
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-forest-100 pt-5">
          <button type="button" onClick={() => navigate('/inventory')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || isReadOnly} className="btn-primary">
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Add Waste'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddWaste;
