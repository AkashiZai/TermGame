import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, KeyRound, Mail, AlertCircle, Loader } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', robloxUsername: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('กรุณากรอกชื่อผู้ใช้, อีเมล, และรหัสผ่าน');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-4xl) 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: 'var(--space-2xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <UserPlus size={48} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }} />
          <h1 style={{ fontSize: 'var(--fs-xl)' }}>สมัครสมาชิก</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>เข้าร่วม ZaiBux Shop เพื่อสั่งซื้อสินค้า</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-sm)', marginBottom: 'var(--space-md)',
            color: 'var(--color-danger)', fontSize: 'var(--fs-sm)', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label"><User size={16} /> ชื่อผู้ใช้ *</label>
            <input type="text" name="username" className="input-field" placeholder="Username" value={formData.username} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="input-label"><Mail size={16} /> อีเมล *</label>
            <input type="email" name="email" className="input-field" placeholder="example@email.com" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="input-label"><KeyRound size={16} /> รหัสผ่าน *</label>
            <input type="password" name="password" className="input-field" placeholder="Password" value={formData.password} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
            <label className="input-label"><User size={16} /> ชื่อผู้ใช้ Roblox (ถ้ามี)</label>
            <input type="text" name="robloxUsername" className="input-field" placeholder="Roblox Username" value={formData.robloxUsername} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Loader size={20} className="spin-icon" /> : 'สมัครสมาชิก'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: 'var(--color-primary)' }}>เข้าสู่ระบบที่นี่</Link>
        </p>
      </div>
    </div>
  );
}
