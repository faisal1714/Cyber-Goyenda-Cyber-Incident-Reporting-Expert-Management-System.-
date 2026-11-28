import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'What is Cyber Goyenda?',
    a: 'A platform that helps you identify, report, and manage cyber incidents, and connects you with cybersecurity experts when needed.',
  },
  {
    q: 'How does incident matching work?',
    a: 'When you submit an incident description, the system compares it against predefined attack patterns and instantly tells you the likely type and severity.',
  },
  {
    q: "What if the system can't identify my incident?",
    a: "You can directly request assistance from a cybersecurity expert through the 'Request Expert' page.",
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Accounts are protected with hashed passwords and authenticated sessions (JWT), and each user can only see their own incidents.',
  },
];

function Counter({ target = 120 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= target) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <span className="text-6xl font-bold text-green-500" style={{ textShadow: '0 0 15px #22c55e' }}>
      {count}
    </span>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      {/* HERO */}
    <section
  className="min-h-[80vh] flex items-center justify-center bg-cover bg-center"
  style={{
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.35)), url('/bgimage.jpg')",
  }}
>
        <div className="glow-box text-center max-w-xl mx-4 animate-slide-up">
          <p className="text-red-400 font-bold tracking-widest mb-2 animate-pulse">ACCESS DENIED</p>
          <h1 className="text-4xl font-extrabold mb-3">Protect Your Business</h1>
          <p className="text-gray-300 mb-6">
            Detect &bull; Analyze &bull; Respond &mdash; Instantly &amp; Automatically
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/submit-incident" className="hero-btn">
              Submit Incident
            </Link>
            <Link to="/request-expert" className="hero-btn green">
              Request Expert
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section-box max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-cyan-400 text-center mb-10">Key Features</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            'Secure user authentication (JWT)',
            'Cyber incident submission with detailed descriptions',
            'Automatic incident analysis using predefined templates',
            'Instant response & guidance generation',
            'Expert request system for unresolved incidents',
            'My Incidents history with downloadable PDF report',
          ].map((f) => (
            <div key={f} className="glow-box text-center">
              <p className="text-gray-200">{f}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COUNTER */}
      <section className="section-box text-center">
        <Counter target={120} />
        <p className="text-gray-400 mt-2">Incidents handled and counting</p>
      </section>

      {/* FAQ */}
      <section className="section-box max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-cyan-400 text-center mb-8">FAQ</h2>
        <div className="space-y-3">
          {FAQS.map((item, idx) => (
            <div
              key={item.q}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="rounded-xl border border-cyan-500 p-4 cursor-pointer"
            >
              <p className="font-semibold text-cyan-400">{item.q}</p>
              {openFaq === idx && <p className="mt-2 text-gray-300">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="section-box max-w-xl mx-auto">
        <div className="glow-box">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">Contact</h2>
          <p className="text-gray-300 text-center">Abrar Ahmed Wasi, Faisal Khan, Jawadul Islam</p>
          <p className="text-gray-300 text-center">cybergoendaofficial@gmail.com</p>
        </div>
      </section>
    </div>
  );
}
