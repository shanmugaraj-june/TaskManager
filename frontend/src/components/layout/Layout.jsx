import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar, LogoutIcon, DashboardIcon, FolderIcon, TaskIcon, UsersIcon } from '../ui';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/services';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: myTasksData } = useQuery({
    queryKey: ['my-tasks-summary'],
    queryFn: () => dashboardApi.myTasksSummary(),
    refetchInterval: 60000,
  });

  const overdueCount = myTasksData?.overdue || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-dot" />
          <span>Taskflow</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>

          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <DashboardIcon />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FolderIcon />
            <span>Projects</span>
          </NavLink>

          <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <TaskIcon />
            <span>My Tasks</span>
            {overdueCount > 0 && <span className="nav-badge">{overdueCount}</span>}
          </NavLink>

          {isAdmin && (
            <>
              <div className="sidebar-section-label">Admin</div>
              <NavLink to="/team" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <UsersIcon />
                <span>Team</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <Avatar name={user?.name} size={30} />
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div className="user-role">{user?.role === 'ADMIN' ? 'Admin' : 'Member'}</div>
          </div>
            <button
  className="btn btn-danger"
  onClick={handleLogout}
  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
>
  <LogoutIcon />
  Logout
</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
