import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

const STATUS_LABEL = {
  matched: 'Matched',
  expert_request: 'Expert review needed',
};

export default function MyIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/incidents/mine');
        setIncidents(data.incidents);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your incidents');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="section-box max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <h2 className="text-3xl font-bold text-cyan-400">My Incidents</h2>
        <Link to="/submit-incident" className="auth-btn w-auto px-5">
          Report new incident
        </Link>
      </div>

      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && incidents.length === 0 && !error && (
        <div className="glow-box text-center text-gray-300">
          You have not reported any incident yet.
        </div>
      )}

      <div className="space-y-4">
        {incidents.map((i) => (
          <Link
            key={i.id}
            to={`/incident-result/${i.id}`}
            className="glow-box block hover:bg-gray-900 transition"
          >
            <div className="flex justify-between flex-wrap gap-2">
              <span className="font-bold">
                #{i.id} - {i.type || 'Unknown'}
              </span>
              <span className="text-cyan-400 text-sm">{STATUS_LABEL[i.status] || i.status}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Severity: {i.severity || 'Unknown'}
              {' '}·{' '}
              {new Date(i.timestamp).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
