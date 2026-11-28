import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';

export default function RequestExpert() {
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incident_id') || '';

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    business_name: '',
    reason: '',
  });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await api.post('/expert-requests', { ...form, incident_id: incidentId || null });
      setStatus('success');
      setForm({ full_name: '', email: '', business_name: '', reason: '' });
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-box flex justify-center">
      <div className="glow-box w-full max-w-lg">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Request Expert</h2>

        {status === 'success' && (
          <p className="text-green-400 mb-4 text-center">
            Your request has been submitted. An expert will get in touch soon.
          </p>
        )}
        {status === 'error' && (
          <p className="text-red-400 mb-4 text-center">Something went wrong. Please try again.</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-1">
          <input
            type="text"
            placeholder="Full Name"
            className="auth-input"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Business Name"
            className="auth-input"
            required
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
          />
          <textarea
            placeholder="Why do you need an expert?"
            className="auth-input"
            rows={4}
            required
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </section>
  );
}
