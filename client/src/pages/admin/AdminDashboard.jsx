import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users, GraduationCap, Plus, AlertCircle, LayoutDashboard, Briefcase,
  FileText, Building2, Activity, Globe, TrendingUp, Calendar, Eye, Clock,
} from 'lucide-react';
import StudentApplicationDetailsModal from '../../components/StudentApplicationDetailsModal';
import AdminStudentDetailsModal from '../../components/AdminStudentDetailsModal';
import AdminConsultantDetailsModal from '../../components/AdminConsultantDetailsModal';

const emptyUniversity = {
  name: '',
  country: '',
  worldRank: '',
  avgGre: '',
  avgToefl: '',
  avgCgpa: '',
  acceptanceRate: '',
  tuitionFee: '',
  programs: '',
};

const STATUS_COLORS = {
  'Applied': '#fbbf24',
  'Under Review': '#818cf8',
  'Shortlisted': '#34d399',
  'Accepted': '#34d399',
  'Rejected': '#f87171',
  'Waitlisted': '#f87171',
};

const STATUS_BADGES = {
  'Applied': 'badge-target',
  'Under Review': 'badge-target',
  'Shortlisted': 'badge-safe',
  'Accepted': 'badge-safe',
  'Rejected': 'badge-ambitious',
  'Waitlisted': 'badge-ambitious',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'consultants', label: 'Consultants', icon: Briefcase },
  { id: 'assign', label: 'Assign Students', icon: Users },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'catalog', label: 'University Catalog', icon: Building2 },
];

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const StatBar = ({ label, value, total, color }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
        <span>{label}</span>
        <span style={{ color: 'var(--text-muted)' }}>{value} ({pct}%)</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [uniForm, setUniForm] = useState(emptyUniversity);
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState('');
  const [addError, setAddError] = useState('');
  const [consultantList, setConsultantList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [assignConsultant, setAssignConsultant] = useState(null);
  const [assignedStudentIds, setAssignedStudentIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState('');
  const [assignError, setAssignError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, uniRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/universities'),
        api.get('/admin/analytics'),
      ]);
      setUsers(usersRes.data);
      setUniversities(uniRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAssignData = async () => {
    try {
      const [consRes, studRes] = await Promise.all([
        api.get('/admin/consultants'),
        api.get('/admin/students'),
      ]);
      setConsultantList(consRes.data);
      setStudentList(studRes.data);
    } catch (err) {
      console.error('Failed to load assign data', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'assign') {
      fetchAssignData();
    }
  }, [activeTab]);

  const handleSelectConsultant = (consultant) => {
    setAssignConsultant(consultant);
    setAssignedStudentIds(consultant.assignedStudents.map(s => s._id));
    setAssignMessage('');
    setAssignError('');
  };

  const handleToggleStudent = (studentId) => {
    setAssignedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
    setAssignMessage('');
    setAssignError('');
  };

  const handleSaveAssignment = async () => {
    if (!assignConsultant) return;
    setAssignLoading(true);
    setAssignMessage('');
    setAssignError('');
    try {
      const res = await api.put(`/admin/consultants/${assignConsultant._id}/students`, {
        studentIds: assignedStudentIds,
      });
      setAssignMessage(res.data.message);
      // Update local state
      setConsultantList(prev => prev.map(c =>
        c._id === assignConsultant._id
          ? { ...c, assignedStudents: res.data.assignedStudents }
          : c
      ));
      setAssignConsultant(prev => ({
        ...prev,
        assignedStudents: res.data.assignedStudents,
      }));
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to update assignment');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUniChange = (e) => {
    const { name, value } = e.target;
    setUniForm({ ...uniForm, [name]: value });
  };

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddMessage('');
    setAddError('');
    try {
      const payload = {};
      Object.entries(uniForm).forEach(([key, value]) => {
        if (value === '') return;
        payload[key] = key === 'programs'
          ? value.split(',').map((s) => s.trim()).filter(Boolean)
          : key === 'name' || key === 'country'
            ? value
            : Number(value);
      });
      await api.post('/admin/universities', payload);
      setAddMessage('University added successfully!');
      setUniForm(emptyUniversity);
      await fetchAll();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add university');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: '2rem' }}>Loading dashboard...</div>;
  }

  const t = analytics?.totals || {};
  const allApps = analytics?.applications || [];
  const filteredApps = statusFilter === 'All'
    ? allApps
    : allApps.filter((a) => a.status === statusFilter);
  const statusOptions = [...new Set(allApps.map((a) => a.status))];

  const statCards = [
    { label: 'Total Users', value: t.users ?? users.length, icon: Users, color: '#818cf8', bg: 'rgba(79, 70, 229, 0.2)' },
    { label: 'Students', value: t.students ?? 0, icon: GraduationCap, color: '#34d399', bg: 'rgba(16, 185, 129, 0.2)' },
    { label: 'Consultants', value: t.consultants ?? 0, icon: Briefcase, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.2)' },
    { label: 'Applications', value: t.applications ?? 0, icon: FileText, color: '#f472b6', bg: 'rgba(236, 72, 153, 0.2)' },
    { label: 'Active Users', value: t.activeUsers ?? 0, icon: Activity, color: '#38bdf8', bg: 'rgba(14, 165, 233, 0.2)' },
    { label: 'Universities', value: t.universities ?? universities.length, icon: Building2, color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.2)' },
  ];

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        {statCards.map((s) => (
          <div key={s.label} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: s.bg, borderRadius: '0.75rem', color: s.color }}>
              <s.icon size={24} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{s.label}</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} /> Application Status
          </h2>
          {(analytics?.applicationsByStatus || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No applications yet.</p>
          ) : (
            analytics.applicationsByStatus.map((s) => (
              <StatBar key={s.status} label={s.status} value={s.count} total={t.applications} color={STATUS_COLORS[s.status] || '#818cf8'} />
            ))
          )}
        </div>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} /> Applications by Country
          </h2>
          {(analytics?.applicationsByCountry || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No applications yet.</p>
          ) : (
            analytics.applicationsByCountry.map((c) => (
              <StatBar key={c.country} label={c.country} value={c.count} total={t.applications} color="#38bdf8" />
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} /> Most Applied Colleges
          </h2>
          {(analytics?.mostAppliedColleges || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No applications yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {analytics.mostAppliedColleges.map((c, i) => (
                <div key={c.university?._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.6rem 0.9rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{c.university?.name || '—'}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.university?.country || ''}</p>
                  </div>
                  <span className="badge badge-target">{c.count} application{c.count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={20} /> Popular Courses
          </h2>
          {(analytics?.popularCourses || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No applications yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {analytics.popularCourses.map((c) => (
                <div key={c.course} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.6rem 0.9rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <p style={{ fontWeight: 600 }}>{c.course}</p>
                  <span className="badge badge-safe">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} /> Recent Registrations
          </h2>
          {(analytics?.recentUsers || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No users yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {analytics.recentUsers.map((u) => (
                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <span><strong>{u.name}</strong> <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>{u.email}</span></span>
                  <span className={`badge ${u.role === 'admin' ? 'badge-target' : u.role === 'consultant' ? 'badge-ambitious' : 'badge-safe'}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} /> Recent Applications
          </h2>
          {(analytics?.recentApplications || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No applications yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {analytics.recentApplications.map((a) => (
                <div key={a._id} style={{ fontSize: '0.9rem' }}>
                  <p><strong>{a.studentName}</strong> → {a.universityName} <span style={{ color: 'var(--text-muted)' }}>({a.course})</span></p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                    <Calendar size={11} /> {formatDate(a.submittedDate)}
                    <span className={`badge ${STATUS_BADGES[a.status] || 'badge-target'}`} style={{ marginLeft: '0.25rem' }}>{a.status}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderStudents = () => (
    <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <GraduationCap size={20} /> Students ({analytics?.students?.length || 0})
      </h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Academics</th>
            <th>Study Preference</th>
            <th>Applications</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {(analytics?.students || []).map((s) => (
            <tr key={s.user._id}>
              <td>
                <strong>{s.user.name}</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.user.email}</p>
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <p>CGPA: {s.profile?.cgpa ?? '—'} {s.profile?.percentage != null ? `(${s.profile.percentage}%)` : ''}</p>
                <p>GRE: {s.profile?.greScore ?? '—'} • IELTS: {s.profile?.ieltsScore ?? '—'} • TOEFL: {s.profile?.toeflScore ?? '—'}</p>
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <p>{s.profile?.preferredCountry || '—'}{s.profile?.intendedMajor ? ` • ${s.profile.intendedMajor}` : ''}</p>
                <p>{s.profile?.specialization ? `Specialization: ${s.profile.specialization}` : ''}</p>
              </td>
              <td><span className="badge badge-target">{s.applicationCount}</span></td>
              <td>
                <button className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }} onClick={() => setSelectedStudent(s)}>
                  <Eye size={14} style={{ marginRight: '0.3rem' }} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderConsultants = () => (
    <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Briefcase size={20} /> Consultants ({analytics?.consultants?.length || 0})
      </h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Consultant</th>
            <th>Expertise</th>
            <th>Assigned Students</th>
            <th>Applications</th>
            <th>Last Activity</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {(analytics?.consultants || []).map((c) => (
            <tr key={c.user._id}>
              <td>
                <strong>{c.user.name}</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.user.email}</p>
              </td>
              <td style={{ fontSize: '0.85rem' }}>
                {(c.profile?.expertise || []).map((e) => <span key={e} className="badge badge-safe" style={{ margin: '0.15rem' }}>{e}</span>)}
                {(c.profile?.expertise || []).length === 0 && <span style={{ color: 'var(--text-muted)' }}>—</span>}
              </td>
              <td><span className="badge badge-target">{c.assignedStudentCount}</span></td>
              <td><span className="badge badge-safe">{c.applicationCount}</span></td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={13} /> {formatDate(c.lastApplicationDate)}
              </td>
              <td>
                <button className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }} onClick={() => setSelectedConsultant(c)}>
                  <Eye size={14} style={{ marginRight: '0.3rem' }} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderApplications = () => (
    <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} /> All Applications ({allApps.length})
        </h2>
        <select
          className="form-input"
          style={{ padding: '0.4rem 0.7rem', fontSize: '0.85rem', width: 'auto' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {filteredApps.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No applications match this filter.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Applied College</th>
              <th>Course</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.map((a) => (
              <tr key={a._id}>
                <td>
                  <strong>{a.studentName || a.student?.name || '—'}</strong>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{a.studentEmail || a.student?.email}</p>
                </td>
                <td>
                  <strong>{a.universityName || a.university?.name}</strong>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{a.country || a.university?.country}</p>
                </td>
                <td>{a.course}</td>
                <td><span className={`badge ${STATUS_BADGES[a.status] || 'badge-target'}`}>{a.status}</span></td>
                <td style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} /> {formatDate(a.submittedDate)}
                </td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }} onClick={() => setSelectedApp(a)}>
                    <Eye size={14} style={{ marginRight: '0.3rem' }} /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderAssign = () => (
    <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={20} /> Select Consultant
        </h2>
        {consultantList.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No consultants found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {consultantList.map((c) => (
              <div
                key={c._id}
                onClick={() => handleSelectConsultant(c)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: assignConsultant?._id === c._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: assignConsultant?._id === c._id ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{c.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.email}</p>
                  </div>
                  <span className="badge badge-target">{c.assignedStudents.length} students</span>
                </div>
                {c.expertise?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {c.expertise.map((e) => <span key={e} className="badge badge-safe" style={{ fontSize: '0.75rem' }}>{e}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {!assignConsultant ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Select a consultant from the left to assign students.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={20} /> Assign Students to {assignConsultant.name}
              </h2>
              <button
                className="btn btn-primary"
                onClick={handleSaveAssignment}
                disabled={assignLoading}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {assignLoading ? 'Saving...' : 'Save Assignment'}
              </button>
            </div>

            {assignMessage && (
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', marginBottom: '1rem', fontSize: '0.9rem' }}>
                ✓ {assignMessage}
              </div>
            )}
            {assignError && (
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', marginBottom: '1rem', fontSize: '0.9rem' }}>
                ✗ {assignError}
              </div>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Currently assigned: <strong>{assignedStudentIds.length}</strong> student{assignedStudentIds.length !== 1 ? 's' : ''} — check students below to add/remove.
            </p>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {studentList.map((s) => {
                const isAssigned = assignedStudentIds.includes(s._id);
                return (
                  <div
                    key={s._id}
                    onClick={() => handleToggleStudent(s._id)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: isAssigned ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: isAssigned ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: isAssigned ? '2px solid var(--primary)' : '2px solid var(--border)',
                        background: isAssigned ? 'var(--primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        color: '#fff',
                        flexShrink: 0,
                      }}>
                        {isAssigned && '✓'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500 }}>{s.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.email}</p>
                      </div>
                    </div>
                    {isAssigned && <span className="badge badge-safe">Assigned</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderCatalog = () => (
    <>
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Users
          </h2>
          <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-target' : u.role === 'consultant' ? 'badge-ambitious' : 'badge-safe'}`}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel">
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={20} /> Universities
          </h2>
          <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Country</th><th>Rank</th><th>Acceptance</th></tr>
              </thead>
              <tbody>
                {universities.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.country}</td>
                    <td>#{u.worldRank ?? '—'}</td>
                    <td>{u.acceptanceRate ?? '—'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '720px' }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Add University
        </h2>
        {addMessage && <p style={{ color: '#34d399', marginBottom: '1rem' }}>{addMessage}</p>}
        {addError && <p style={{ color: '#f87171', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} /> {addError}</p>}
        <form onSubmit={handleAddUniversity}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" name="name" className="form-input" value={uniForm.name} onChange={handleUniChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <input type="text" name="country" className="form-input" value={uniForm.country} onChange={handleUniChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">World Rank</label>
              <input type="number" name="worldRank" className="form-input" value={uniForm.worldRank} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Acceptance Rate (%)</label>
              <input type="number" name="acceptanceRate" className="form-input" value={uniForm.acceptanceRate} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Avg GRE</label>
              <input type="number" name="avgGre" className="form-input" value={uniForm.avgGre} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Avg TOEFL</label>
              <input type="number" name="avgToefl" className="form-input" value={uniForm.avgToefl} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Avg CGPA (0–10)</label>
              <input type="number" name="avgCgpa" className="form-input" step="0.1" value={uniForm.avgCgpa} onChange={handleUniChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Tuition Fee / Year</label>
              <input type="number" name="tuitionFee" className="form-input" value={uniForm.tuitionFee} onChange={handleUniChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Programs (comma separated)</label>
              <input type="text" name="programs" className="form-input" value={uniForm.programs} onChange={handleUniChange} placeholder="Computer Science, Data Science" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={adding}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> {adding ? 'Adding...' : 'Add University'}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Platform overview, analytics, and management — all data from the live database.</p>
        </div>
      </div>

      {error && <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className="btn"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              background: activeTab === tab.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'students' && renderStudents()}
      {activeTab === 'consultants' && renderConsultants()}
      {activeTab === 'assign' && renderAssign()}
      {activeTab === 'applications' && renderApplications()}
      {activeTab === 'catalog' && renderCatalog()}

      {selectedStudent && (
        <AdminStudentDetailsModal
          student={selectedStudent}
          allApplications={allApps}
          onClose={() => setSelectedStudent(null)}
        />
      )}
      {selectedConsultant && (
        <AdminConsultantDetailsModal
          consultant={selectedConsultant}
          onClose={() => setSelectedConsultant(null)}
        />
      )}
      {selectedApp && (
        <StudentApplicationDetailsModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
