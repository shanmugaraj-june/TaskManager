import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/services';
import { Avatar, Spinner, StatusBadge, PriorityBadge, ProgressBar, AlertIcon, TaskIcon, CheckIcon, FolderIcon } from '../components/ui';
import { formatDate, isOverdue, statusLabel } from '../utils/helpers';

function StatCard({ icon, label, value, sub, iconBg, iconColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
    refetchInterval: 30000,
  });

  if (isLoading) return <Spinner />;

  const { stats, tasksByUser, recentTasks } = data || {};
  const total = stats?.totalTasks || 0;
  const pct = (n) => total ? Math.round((n / total) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={<TaskIcon />} label="Total Tasks" value={stats?.totalTasks ?? 0}
          iconBg="var(--blue3)" iconColor="var(--blue)" />
        <StatCard icon={<div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid currentColor', borderTopColor: 'transparent' }} />}
          label="In Progress" value={stats?.byStatus?.inProgress ?? 0}
          sub={`${pct(stats?.byStatus?.inProgress)} % of total`}
          iconBg="var(--blue3)" iconColor="var(--blue)" />
        <StatCard icon={<CheckIcon />} label="Completed" value={stats?.byStatus?.done ?? 0}
          sub={`${pct(stats?.byStatus?.done)} % completion`}
          iconBg="var(--green2)" iconColor="var(--green)" />
        <StatCard icon={<AlertIcon />} label="Overdue" value={stats?.overdue ?? 0}
          sub={stats?.overdue ? 'Needs attention' : 'All on track!'}
          iconBg="var(--red2)" iconColor="var(--red)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Status breakdown */}
        <div className="card">
          <div className="section-header"><span className="section-title">Task breakdown</span></div>
          {[
            { label: 'To Do', val: stats?.byStatus?.todo || 0, color: 'var(--text3)' },
            { label: 'In Progress', val: stats?.byStatus?.inProgress || 0, color: 'var(--blue)' },
            { label: 'Done', val: stats?.byStatus?.done || 0, color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{s.val} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({pct(s.val)}%)</span></span>
              </div>
              <ProgressBar value={pct(s.val)} color={s.color} />
            </div>
          ))}
          <div style={{ marginTop: '0.5rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Active projects</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{stats?.activeProjects ?? 0}</span>
          </div>
        </div>

        {/* Tasks by user */}
        <div className="card">
          <div className="section-header"><span className="section-title">Tasks by member</span></div>
          {tasksByUser?.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', paddingTop: '1rem' }}>No task assignments yet.</p>
          ) : (
            tasksByUser?.map(({ user: u, taskCount }) => {
              const maxCount = Math.max(...(tasksByUser?.map(x => x.taskCount) || [1]), 1);
              return (
                <div key={u?.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Avatar name={u?.name} size={26} fontSize={10} />
                  <span style={{ fontSize: 12, minWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u?.name?.split(' ')[0]}
                  </span>
                  <div style={{ flex: 1 }}>
                    <ProgressBar value={Math.round((taskCount / maxCount) * 100)} height={5} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 16, textAlign: 'right' }}>{taskCount}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Recent tasks</span>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate('/tasks')}>View mine</button>
        </div>
        {!recentTasks?.length ? (
          <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '1.5rem 0' }}>No recent tasks.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map(t => (
                <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${t.project?.id}`)}>
                  <td style={{ fontWeight: 500, maxWidth: 200 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  </td>
                  <td><span style={{ fontSize: 12, color: 'var(--text2)' }}>{t.project?.name || '—'}</span></td>
                  <td>
                    {t.assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar name={t.assignee.name} size={22} fontSize={9} />
                        <span style={{ fontSize: 12 }}>{t.assignee.name.split(' ')[0]}</span>
                      </div>
                    ) : <span style={{ color: 'var(--text3)' }}>—</span>}
                  </td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    <span style={{ fontSize: 12, color: t.isOverdue ? 'var(--red)' : 'var(--text2)' }}>
                      {formatDate(t.dueDate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
