import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Award, BookOpen, Target, Sparkles, ChevronRight } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const predRes = await api.get('/prediction');
        setPredictions(predRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleGeneratePredictions = async () => {
    setLoading(true);
    try {
      const res = await api.post('/prediction/generate');
      setPredictions(res.data);
    } catch (error) {
      console.error("Error generating predictions", error);
      alert("Failed to generate predictions. Have you completed your profile?");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{paddingTop: '2rem'}}>Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Student Dashboard</h1>
          <p style={{color: 'var(--text-muted)', marginTop: '0.5rem'}}>Welcome back, {user.name}!</p>
        </div>
        <button onClick={handleGeneratePredictions} className="btn btn-primary">
          <Sparkles size={18} style={{marginRight: '0.5rem'}} /> Update AI Predictions
        </button>
      </div>

      <div className="grid grid-cols-3" style={{marginBottom: '2rem'}}>
        <div className="glass-panel" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{padding: '1rem', background: 'rgba(79, 70, 229, 0.2)', borderRadius: '0.75rem', color: '#818cf8'}}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem'}}>Saved Universities</h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{predictions.length}</p>
          </div>
        </div>
        
        <div className="glass-panel" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div style={{padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.75rem', color: '#34d399'}}>
            <Target size={24} />
          </div>
          <div>
            <h3 style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem'}}>Active Applications</h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>0</p>
          </div>
        </div>
      </div>

      <h2 style={{marginBottom: '1rem'}}>AI University Recommendations</h2>
      
      {predictions.length === 0 ? (
        <div className="glass-panel" style={{textAlign: 'center', padding: '3rem'}}>
          <Sparkles size={48} style={{color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5}} />
          <h3>No predictions yet</h3>
          <p style={{color: 'var(--text-muted)', margin: '1rem 0'}}>Generate AI predictions to see which universities fit your profile.</p>
          <button onClick={handleGeneratePredictions} className="btn btn-primary">Generate Now</button>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {predictions.map(pred => (
            <div key={pred._id} className="glass-panel" style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                <div>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '0.25rem'}}>{pred.university.name}</h3>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{pred.university.country} • Rank #{pred.university.worldRank}</p>
                </div>
                <span className={`badge badge-${pred.category.toLowerCase()}`}>{pred.category}</span>
              </div>
              
              <div style={{marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>AI Probability</span>
                  <p style={{fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem'}}>{pred.probabilityScore}%</p>
                </div>
                <button className="btn btn-secondary" style={{padding: '0.5rem 1rem'}}>
                  Details <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
