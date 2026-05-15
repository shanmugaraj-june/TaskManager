import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/services';
import { Avatar, Spinner, Empty, UsersIcon, ProgressBar } from '../components/ui';

export default function TeamPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  if (isLoading) return <Spinner />;

  const totalTasks = users.reduce((sum, u) => sum + (u.taskCount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">{users.length} member{users.length !== 1 ? 's' : ''} · {totalTasks} tasks assigned</p>
        </div>
      </div>

      {users.length === 0 ? (
        <Empty
          icon={<UsersIcon />}
          title="No team members yet."
          subtitle="Members appear here after they sign up."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Email</th>
                <th>Tasks assigned</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} size={34} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${u.role === 'ADMIN' ? 'admin' : 'member'}`}>
                      {u.role === 'ADMIN' ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{u.email}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar
                          value={totalTasks ? Math.round(((u.taskCount || 0) / totalTasks) * 100) : 0}
                          height={5}
                        />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 24, textAlign: 'right' }}>
                        {u.taskCount || 0}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
