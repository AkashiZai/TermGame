import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Package, ShoppingBag } from 'lucide-react';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/activities');
      setActivities(res.data.activities);
    } catch (e) {
      console.error(e);
    }
  };

  const getRelativeTime = (timestamp) => {
    const diffInSeconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diffInSeconds < 60) return `เมื่อสักครู่`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} วันที่แล้ว`;
  };

  const isNew = (timestamp) => {
    // Show 'ใหม่' badge if less than 60 minutes old
    return (new Date() - new Date(timestamp)) < 60 * 60 * 1000;
  };

  const getRowClass = (type) => {
    if (type === 'new_user') return 'activity-user-row';
    if (type === 'new_order') return 'activity-order-row';
    return 'activity-stock-row';
  };

  const getIcon = (type) => {
    if (type === 'new_user') return <User size={18} />;
    if (type === 'new_order') return <ShoppingBag size={18} />;
    return <Package size={18} />;
  };

  return (
    <div className="container" style={{ padding: 'var(--space-4xl) 0', maxWidth: '900px' }}>
      
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', background: '#fff' }}>
        
        {/* Header */}
        <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'var(--fs-xl)', marginBottom: '0.2rem', color: '#333' }}>กิจกรรมล่าสุด</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>ติดตามกิจกรรมของร้านค้าแบบเรียลไทม์</p>
          </div>
          <div className="live-badge">
             <span className="live-dot"></span> สด
          </div>
        </div>

        {/* Activity List */}
        <div style={{ padding: 'var(--space-md)' }}>
          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>ไม่มีกิจกรรมล่าสุด</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.map((act) => (
                <div key={act._id} className={`activity-row ${getRowClass(act.type)}`}>
                  
                  <div className={`activity-icon-box ${act.type.replace('_', '-')}`}>
                    {getIcon(act.type)}
                  </div>

                  <div className="activity-content">
                    <h3 className="activity-title" style={{ fontWeight: act.type === 'new_user' ? 'bold' : 'normal' }}>{act.title}</h3>
                    {act.subtitle && <p className="activity-subtitle">{act.subtitle}</p>}
                  </div>

                  <div className="activity-meta">
                    <span className="activity-time">{getRelativeTime(act.createdAt)}</span>
                    {isNew(act.createdAt) && <span className="activity-new-badge">ใหม่</span>}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
