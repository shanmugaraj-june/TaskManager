import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Avatar, Spinner, Empty, FolderIcon, PlusIcon, EditIcon, TrashIcon, UsersIcon, ProgressBar } from '../components/ui';
import ProjectModal from '../components/projects/ProjectModal';
import MembersModal from '../components/projects/MembersModal';
import toast from 'react-hot-toast';
import { apiError } from '../utils/helpers';

const COLORS = ['color-blue', 'color-green', 'color-amber', 'color-purple', 'color-red'];

export default function ProjectsPage() {
  const { isAdmin, isProjectAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [showNew, setShowNew] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [membersProject, setMembersProject] = useState(null);
  const [search, setSearch] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Project deleted.');
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const handleDelete = (p) => {
    if (window.confirm(`Delete "${p.name}" and all its tasks? This cannot be undone.`)) {
      deleteMutation.mutate(p.id);
    }
  };

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="search-input"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 12 }}
          />
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <PlusIcon /> New project
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty
          icon={<FolderIcon />}
          title={search ? 'No projects match your search.' : 'No projects yet.'}
          subtitle={search ? 'Try a different keyword.' : 'Create a project to start organising your team\'s work.'}
          action={!search && (
            <button className="btn btn-primary" onClick={() => setShowNew(true)}>
              <PlusIcon /> Create first project
            </button>
          )}
        />
      ) : (
        <div className="projects-grid">
          {filtered.map((p, i) => {
            const tasks = p.tasks || [];
            const done = tasks.filter?.(t => t.status === 'DONE').length || 0;
            const pct = p.taskCount ? Math.round((done / p.taskCount) * 100) : 0;
            const color = COLORS[i % COLORS.length];
            const canAdmin = isProjectAdmin(p);

            return (
              <div key={p.id} className={`project-card ${color}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, flex: 1, marginRight: 8 }}>{p.name}</h3>
                  {canAdmin && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="btn-icon" onClick={() => setEditProject(p)} title="Edit">
                        <EditIcon />
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(p)} title="Delete"
                        style={{ color: 'var(--red)' }} disabled={deleteMutation.isPending}>
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: '1rem', lineHeight: 1.5, minHeight: 36 }}>
                  {p.description || <span style={{ color: 'var(--text3)' }}>No description</span>}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>Progress</span>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color="var(--green)" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>📋</span> {p.taskCount || 0} tasks
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>👥</span> {p.memberCount || 0} members
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {canAdmin && (
                      <button className="btn btn-sm btn-ghost" onClick={() => setMembersProject(p)}>
                        <UsersIcon /> Team
                      </button>
                    )}
                    <button className="btn btn-sm btn-primary" onClick={() => navigate(`/projects/${p.id}`)}>
                      Open →
                    </button>
                  </div>
                </div>

                {/* Member avatars */}
                {p.members?.length > 0 && (
                  <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="member-stack">
                      {p.members.slice(0, 5).map(m => (
                        <Avatar key={m.id} name={m.name} size={22} fontSize={9} />
                      ))}
                    </div>
                    {p.members.length > 5 && (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>+{p.members.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showNew && <ProjectModal onClose={() => setShowNew(false)} />}
      {editProject && <ProjectModal project={editProject} onClose={() => setEditProject(null)} />}
      {membersProject && <MembersModal project={membersProject} onClose={() => setMembersProject(null)} />}
    </div>
  );
}
