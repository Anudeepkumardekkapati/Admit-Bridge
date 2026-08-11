import React from 'react';
import { X, MapPin, Trophy, DollarSign, Calendar, FileText, CheckCircle } from 'lucide-react';

/**
 * Modal showing the real details of a college. Reused by the student
 * dashboard (predicted colleges) and the university catalog.
 * The university prop is the full populated document from the API.
 */
const CollegeDetailsModal = ({ university, onClose }) => {
  if (!university) return null;

  const rows = [
    { label: 'Country', value: university.country, icon: MapPin },
    { label: 'Location', value: university.location, icon: MapPin },
    { label: 'World Ranking', value: university.worldRank ? `#${university.worldRank}` : '—', icon: Trophy },
    { label: 'Tuition / Year', value: university.tuitionFee ? `$${university.tuitionFee.toLocaleString()}` : '—', icon: DollarSign },
    { label: 'Acceptance Rate', value: university.acceptanceRate != null ? `${university.acceptanceRate}%` : '—', icon: Trophy },
    { label: 'Avg GRE', value: university.avgGre ?? '—' },
    { label: 'GRE Requirement', value: university.greRequirement ?? '—' },
    { label: 'Avg TOEFL', value: university.avgToefl ?? '—' },
    { label: 'IELTS Requirement', value: university.ieltsRequirement ?? '—' },
    { label: 'Avg CGPA', value: university.avgCgpa ?? '—' },
    { label: 'Eligibility', value: university.eligibility, icon: CheckCircle },
    { label: 'Application Deadline', value: university.applicationDeadline, icon: Calendar },
  ].filter((r) => r.value != null && r.value !== '');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{university.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {[university.country, university.location].filter(Boolean).join(' • ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.6rem' }}
            aria-label="Close details"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem 1.5rem' }}>
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                  {row.label}
                </p>
                <p style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {Icon && <Icon size={14} style={{ color: 'var(--primary)' }} />} {row.value}
                </p>
              </div>
            );
          })}
        </div>

        {university.programs?.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Courses Offered</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {university.programs.map((p) => (
                <span key={p} className="badge badge-target">{p}</span>
              ))}
            </div>
          </div>
        )}

        {university.requirements?.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={14} /> Application Requirements
            </p>
            <ul style={{ listStyle: 'none', display: 'grid', gap: '0.4rem' }}>
              {university.requirements.map((req, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <CheckCircle size={14} style={{ color: '#34d399' }} /> {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeDetailsModal;
