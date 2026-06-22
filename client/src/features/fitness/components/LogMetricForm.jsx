import { useState } from 'react';
import { X, Scale, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLogBodyMetric, useLogMeasurement } from '../hooks/useFitness';

export default function LogMetricForm({ onClose }) {
  const [tab, setTab] = useState('metric'); // metric | measurement
  const [metricForm, setMetricForm] = useState({ weight: '', bodyFat: '', muscleMass: '', notes: '' });
  const [measForm, setMeasForm] = useState({ chest: '', waist: '', arms: '', thighs: '' });

  const logMetric = useLogBodyMetric();
  const logMeas = useLogMeasurement();

  const handleMetricSubmit = () => {
    const data = {};
    if (metricForm.weight) data.weight = parseFloat(metricForm.weight);
    if (metricForm.bodyFat) data.bodyFat = parseFloat(metricForm.bodyFat);
    if (metricForm.muscleMass) data.muscleMass = parseFloat(metricForm.muscleMass);
    if (metricForm.notes) data.notes = metricForm.notes;
    if (Object.keys(data).length === 0) return;
    logMetric.mutate(data, { onSuccess: () => onClose() });
  };

  const handleMeasSubmit = () => {
    const data = {};
    if (measForm.chest) data.chest = parseFloat(measForm.chest);
    if (measForm.waist) data.waist = parseFloat(measForm.waist);
    if (measForm.arms) data.arms = parseFloat(measForm.arms);
    if (measForm.thighs) data.thighs = parseFloat(measForm.thighs);
    if (Object.keys(data).length === 0) return;
    logMeas.mutate(data, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}><Scale className="w-5 h-5 text-blue-500" /></div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>Log Measurement</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:opacity-80"><X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} /></button>
        </div>

        <div className="flex items-center gap-2 mb-5 p-1 rounded-xl" style={{ background: 'var(--th-bg-secondary)' }}>
          {[{ key: 'metric', label: 'Body Metrics' }, { key: 'measurement', label: 'Measurements' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition"
              style={{ background: tab === t.key ? 'var(--th-card)' : 'transparent', color: tab === t.key ? 'var(--th-text)' : 'var(--th-text-secondary)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'metric' ? (
          <div className="space-y-3">
            {[{ key: 'weight', label: 'Weight (kg)', placeholder: 'e.g. 72.5' },
              { key: 'bodyFat', label: 'Body Fat (%)', placeholder: 'e.g. 15' },
              { key: 'muscleMass', label: 'Muscle Mass (kg)', placeholder: 'e.g. 62' }].map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--th-text-secondary)' }}>{f.label}</label>
                <input type="number" value={metricForm[f.key]} onChange={e => setMetricForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
              </div>
            ))}
            <div>
              <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--th-text-secondary)' }}>Notes</label>
              <input type="text" value={metricForm.notes} onChange={e => setMetricForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
            </div>
            <button onClick={handleMetricSubmit} disabled={logMetric.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
              {logMetric.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />} Log Metrics
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[{ key: 'chest', label: 'Chest (cm)' }, { key: 'waist', label: 'Waist (cm)' }, { key: 'arms', label: 'Arms (cm)' }, { key: 'thighs', label: 'Thighs (cm)' }].map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--th-text-secondary)' }}>{f.label}</label>
                <input type="number" value={measForm[f.key]} onChange={e => setMeasForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.label}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
              </div>
            ))}
            <button onClick={handleMeasSubmit} disabled={logMeas.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
              {logMeas.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Log Measurements
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
