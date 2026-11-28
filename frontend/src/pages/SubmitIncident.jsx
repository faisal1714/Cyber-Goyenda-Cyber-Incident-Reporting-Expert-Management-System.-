import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

const INCIDENT_TYPES = [
  'DDoS',
  'Phishing',
  'Malware',
  'Unauthorized Access',
  'SQL Injection',
  'Cross-Site Scripting',
  'Brute Force',
  'Ransomware',
  'Phishing SMS',
  'Malicious Email Attachment',
  'Online Fraud',
  'Identity Theft',
  'Cyber Harassment',
  'Social Media Hacking',
  'Mobile Banking Fraud',
  'Data Breach',
  'Spyware',
  'Unknown',
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical', 'Unknown'];

export default function SubmitIncident() {
  const [form, setForm] = useState({
    type: '',
    severity: '',
    description: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/incidents', form);
      navigate(`/incident-result/${data.incident.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit incident');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600&auto=format&fit=crop')",
      }}
    >
      <div className="glow-box w-full max-w-lg">
        <h2 className="text-2xl font-bold text-cyan-400 mb-1 text-center">
          Submit Your Cyber Incident
        </h2>

        <p className="text-gray-400 text-sm mb-6 text-center">
          Fill out the form below to report a security incident
        </p>

        {error && (
          <p className="text-red-400 mb-3 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Incident Type
            </label>

            <select
              className="auth-input"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
            >
              <option value="">Select Type</option>

              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Description
            </label>

            <textarea
              className="auth-input"
              rows={4}
              placeholder="Example: My website is down / site not loading / suspicious login"
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Severity
            </label>

            <select
              className="auth-input"
              value={form.severity}
              onChange={(e) =>
                setForm({ ...form, severity: e.target.value })
              }
            >
              <option value="">Select Severity</option>

              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Incident'}
          </button>
        </form>
      </div>
    </section>
  );
}