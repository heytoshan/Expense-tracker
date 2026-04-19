'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Activity, ShieldCheck, Trash2, 
  Ban, CheckCircle, ExternalLink, Clock,
  Hash, Mail, Plus, UserPlus, Shield
} from 'lucide-react';
import { 
  Card, Button, Badge, LoadingPage, 
  EmptyState, Modal, LoadingSpinner 
} from '@/components/ui';
import adminService from '@/services/adminService';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getStats()
      ]);
      setUsers(usersData.data);
      setStats(statsData.data);
    } catch (error) {
      toast.error('Failed to load admin data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(user._id, newStatus);
      toast.success(`User set to ${newStatus}`);
      fetchData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await adminService.updateUserRole(user._id, newRole);
      toast.success(`User promoted to ${newRole}`);
      fetchData();
    } catch (e) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure? This will delete all user data and logs.')) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete user');
    }
  };

  const viewLogs = async (user) => {
    setSelectedUser(user);
    setLogsLoading(true);
    try {
      const data = await adminService.getUserLogs(user._id);
      setUserLogs(data.data);
    } catch (e) {
      toast.error('Failed to load logs');
    } finally {
      setLogsLoading(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>Admin Panel</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Manage users, roles, and track platform activity.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="responsive-grid">
        <StatCard 
          icon={Users} 
          label="Total Community" 
          value={stats?.totalUsers || 0} 
          color="var(--primary)" 
          trend="+12% this month"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Active Users" 
          value={stats?.activeUsers || 0} 
          color="var(--success)" 
          trend="98% uptime"
        />
        <StatCard 
          icon={Activity} 
          label="Platform Traffic" 
          value={stats?.totalLogins || 0} 
          color="var(--accent)" 
          trend="High activity"
        />
        <StatCard 
          icon={Clock} 
          label="Engagement" 
          value={`${stats?.avgSessionDuration || 0}s`} 
          color="var(--warning)" 
          trend="Avg session"
        />
      </div>

      {/* Users Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>User Management</h3>
        </div>
        
        <div className="scroll-x">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--background)' }}>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle} className="hide-on-mobile">Activity</th>
                <th style={thStyle} className="hide-on-mobile">Joined</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{user.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <Badge variant={user.role === 'ADMIN' ? 'primary' : 'default'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td style={tdStyle} className="hide-on-mobile">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 12 }}>{user.totalLogins} logins</span>
                      {user.lastLogin && (
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                          Last: {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle} className="hide-on-mobile">
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="secondary" onClick={() => viewLogs(user)} title="View Logs">
                        <Activity size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleToggleRole(user)}
                        title={user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                      >
                        <Shield size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => handleToggleStatus(user)}
                        style={{ color: user.status === 'ACTIVE' ? 'var(--danger)' : 'var(--success)' }}
                        title={user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      >
                        {user.status === 'ACTIVE' ? <Ban size={14} /> : <CheckCircle size={14} />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user._id)} style={{ color: 'var(--danger)' }} title="Delete">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Logs Modal */}
      <Modal 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        title={`Activity Logs: ${selectedUser?.name}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {logsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><LoadingSpinner /></div>
          ) : userLogs.length === 0 ? (
            <EmptyState title="No logs found" description="This user has no recorded activity sessions." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
              {userLogs.map((log, i) => (
                <div key={i} style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--background)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Session {userLogs.length - i}</span>
                    </div>
                    <Badge variant={log.logoutTime ? 'success' : 'warning'}>
                      {log.logoutTime ? 'Completed' : 'Active / Expired'}
                    </Badge>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Login</p>
                      <p style={{ fontSize: 12 }}>{new Date(log.loginTime).toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Duration</p>
                      <p style={{ fontSize: 12 }}>{log.sessionDuration ? `${log.sessionDuration}s` : '--'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>IP & Device</p>
                      <p style={{ fontSize: 11, fontFamily: 'monospace' }}>{log.ipAddress || 'Unknown IP'} • {log.deviceInfo?.userAgent?.split(' ')[0] || 'Unknown Device'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setSelectedUser(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ 
          width: 40, height: 40, borderRadius: 10, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', 
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
          color: color 
        }}>
          <Icon size={20} />
        </div>
        {trend && (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)' }}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{value}</p>
      </div>
    </Card>
  );
}

const thStyle = {
  padding: '12px 24px',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--muted)'
};

const tdStyle = {
  padding: '16px 24px',
  verticalAlign: 'middle'
};
