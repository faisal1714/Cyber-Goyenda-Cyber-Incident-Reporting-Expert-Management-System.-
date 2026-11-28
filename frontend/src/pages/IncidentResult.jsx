import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios.js';

export default function IncidentResult() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/incidents/${id}`);
        setIncident(data.incident);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load incident');
      }
    }
    load();
  }, [id]);

  async function downloadReport() {
    const token = localStorage.getItem('cg_user_token');
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5050/api'}/incidents/${id}/report`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <section className="section-box flex justify-center">
      <div className="glow-box w-full max-w-xl">
        <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Incident Result</h2>

        {error && <p className="text-red-400 text-center">{error}</p>}

        {incident && incident.status === 'matched' && (
          <div className="space-y-3 text-lg">
            <p>
              <span className="text-gray-400">Type:</span>{' '}
              <span className="font-semibold">{incident.type}</span>
            </p>
            <p>
              <span className="text-gray-400">Severity:</span>{' '}
              <span className="font-semibold">{incident.severity}</span>
            </p>
            <p>
              <span className="text-gray-400">Status:</span>{' '}
              <span className="text-green-400 font-semibold">MATCHED</span>
            </p>
            <p>
              <span className="text-gray-400">Match confidence:</span>{' '}
              <span className="font-semibold">{incident.confidence}%</span>
            </p>

            <p className="text-gray-400 mt-4">Description:</p>
            <div className="bg-gray-800 p-3 rounded">{incident.description}</div>

            <div className="mt-4 p-4 border border-green-400 rounded">
              <p className="text-green-400 font-semibold">✔ Incident matched successfully</p>
              <p className="text-gray-300 mt-2">{incident.template_desc}</p>
            </div>
          </div>
        )}

        {incident && incident.guidance && (
          <div className="mt-8 space-y-4">
            {incident.guidance.requires_expert && (
              <p className="text-yellow-400 text-sm border border-yellow-400 rounded p-3">
                This type of incident is serious - we recommend requesting expert help as well as following the steps below.
              </p>
            )}
            {incident.guidance.preliminary_guidance && (
              <div>
                <h3 className="text-lg font-bold mb-2 text-cyan-400">What to do now</h3>
                <p className="whitespace-pre-line text-gray-200 text-sm">{incident.guidance.preliminary_guidance}</p>
              </div>
            )}
            {incident.guidance.evidence_checklist && (
              <div>
                <h3 className="text-lg font-bold mb-2 text-cyan-400">Keep this evidence</h3>
                <p className="whitespace-pre-line text-gray-200 text-sm">{incident.guidance.evidence_checklist}</p>
              </div>
            )}
            {incident.guidance.channels.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-2 text-cyan-400">Where to report</h3>
                <ul className="space-y-2">
                  {incident.guidance.channels.map((c) => (
                    <li key={c.code} className="bg-gray-800 p-3 rounded text-sm">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-gray-400">{c.description}</p>
                      <p className="mt-1 space-x-3">
                        {c.phone && <a className="text-green-400" href={`tel:${c.phone}`}>{c.phone}</a>}
                        {c.email && <a className="text-cyan-400" href={`mailto:${c.email}`}>{c.email}</a>}
                        {c.website_url && (
                          <a className="text-cyan-400" href={c.website_url} target="_blank" rel="noreferrer">Website</a>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Contact details can change - confirm on the official site if a number does not work.
                </p>
              </div>
            )}
          </div>
        )}

        {incident && incident.status !== 'matched' && (
          <div className="mt-6 p-4 border border-yellow-400 rounded text-center">
            <p className="text-yellow-400 font-semibold text-lg">
              ⚠ No match found. Expert assistance recommended.
            </p>
            <Link
              to={`/request-expert?incident_id=${incident.id}`}
              className="inline-block mt-4 auth-btn"
            >
              Request Expert
            </Link>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Link to="/submit-incident" className="auth-btn w-auto px-6">
            Submit Another Incident
          </Link>

          {incident && incident.status === 'matched' && (
            <button onClick={downloadReport} className="auth-btn green w-auto px-6">
              Download PDF
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
