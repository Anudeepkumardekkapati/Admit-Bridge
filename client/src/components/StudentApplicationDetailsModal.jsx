import React from 'react';
import { X, Calendar, FileText, CheckCircle, GraduationCap, Compass, Building2, FileBadge } from 'lucide-react';

/**
 * Complete Student Application Details view for consultants.
 * application is the populated record from GET /api/consultant/dashboard:
 * { student, studentProfile, university, course, status, submittedDate, ... }
 * All data comes from the real backend/database.
 */
const StudentApplicationDetailsModal = ({ application, onClose }) => {
  if (!application) return null;

  const profile = application.studentProfile || {};
  const uni = application.university || {};
  const student = application.student || {};

  const SectionTitle = ({ icon: Icon, children }) => (
    <h4 style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
      textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)',
      borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '1.5rem 0 1rem',
    }}>
      <Icon size={16} /> {children}
    </h4>
  );

  const Row = ({ label, value }) => (
    <div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontWeight: 500 }}>{value ?? '—'}</p>
    </div>
  );

  const statusBadge = {
    'Applied': 'badge-target',
    'Under Review': 'badge-target',
    'Shortlisted': 'badge-safe',
    'Accepted': 'badge-safe',
    'Rejected': 'badge-ambitious',
    'Waitlisted': 'badge-ambitious',
  }[application.status] || 'badge-target';

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
        style={{ maxWidth: '760px', width: '100%', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
              {application.studentName || student.name || 'Student'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {application.studentEmail || student.email}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} aria-label="Close application details">
            <X size={16} />
          </button>
        </div>

        <SectionTitle icon={GraduationCap}>Student Details</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem 1.25rem' }}>
          <Row label="CGPA" value={profile.cgpa} />
          <Row label="Percentage" value={profile.percentage != null ? `${profile.percentage}%` : null} />
          <Row label="IELTS" value={profile.ieltsScore} />
          <Row label="TOEFL" value={profile.toeflScore} />
          <Row label="GRE" value={profile.greScore} />
          <Row label="Bachelor's Degree" value={profile.bachelorDegree} />
          <Row label="Bachelor's University" value={profile.bachelorUniversity} />
          <Row label="Work Experience" value={profile.workExperience != null ? `${profile.workExperience} months` : null} />
          <Row label="Research Experience" value={profile.researchExperience != null ? `${profile.researchExperience} months` : null} />
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Skills</p>
            {profile.skills?.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {profile.skills.map((s) => <span key={s} className="badge badge-safe">{s}</span>)}
              </div>
            ) : <p style={{ fontWeight: 500 }}>—</p>}
          </div>
        </div>

        <SectionTitle icon={Compass}>Study Preference</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem 1.25rem' }}>
          <Row label="Country" value={profile.preferredCountry} />
          <Row label="Course" value={profile.intendedMajor} />
          <Row label="Specialization" value={profile.specialization} />
          <Row label="Budget / Year" value={profile.budget != null ? `$${profile.budget.toLocaleString()}` : null} />
          <Row label="Target Term" value={profile.targetTerm} />
        </div>

        <SectionTitle icon={Building2}>Applied College</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem 1.25rem' }}>
          <Row label="University" value={application.universityName || uni.name} />
          <Row label="Location" value={uni.location || application.country || uni.country} />
          <Row label="Course Applied For" value={application.course} />
          <Row label="Tuition / Year" value={uni.tuitionFee != null ? `$${uni.tuitionFee.toLocaleString()}` : null} />
          <Row label="World Ranking" value={uni.worldRank != null ? `#${uni.worldRank}` : null} />
          <Row label="Acceptance Rate" value={uni.acceptanceRate != null ? `${uni.acceptanceRate}%` : null} />
          <Row label="IELTS Requirement" value={uni.ieltsRequirement} />
          <Row label="TOEFL Requirement" value={uni.avgToefl} />
          <Row label="GRE Requirement" value={uni.greRequirement} />
          <Row label="Minimum CGPA" value={uni.avgCgpa} />
          <Row label="Application Deadline" value={uni.applicationDeadline} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Row label="Eligibility" value={uni.eligibility} />
          </div>
        </div>

        {uni.programs?.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Programs Offered</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {uni.programs.map((p) => <span key={p} className="badge badge-target">{p}</span>)}
            </div>
          </div>
        )}

        {uni.requirements?.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={13} /> Application Requirements
            </p>
            <ul style={{ listStyle: 'none', display: 'grid', gap: '0.4rem' }}>
              {uni.requirements.map((req, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <CheckCircle size={14} style={{ color: '#34d399' }} /> {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        <SectionTitle icon={FileBadge}>Application</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem 1.25rem', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={12} /> Applied Date
            </p>
            <p style={{ fontWeight: 500 }}>
              {application.submittedDate
                ? new Date(application.submittedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                : '—'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Application Status</p>
            <span className={`badge ${statusBadge}`}>{application.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentApplicationDetailsModal;
