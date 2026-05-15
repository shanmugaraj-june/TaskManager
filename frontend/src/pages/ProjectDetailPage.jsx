import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsApi, tasksApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Spinner, Empty, PlusIcon, ArrowLeftIcon, UsersIcon, TaskIcon, SearchIcon } from '../components/ui';
import { TaskList, KanbanBoard } from '../components/tasks/TaskViews';
import TaskModal from '../components/tasks/TaskModal';
import MembersModal from '../components/projects/MembersModal';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
  { key: 'overdue', label: 'Overdue' },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isProjectAdmin } = useAuth();

  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id),
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.listForProject(id),
    enabled: !!id,
  });

  if (loadingProject || loadingTasks) return <Spinner />;
  if (!project) return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate('/projects')}>
        <ArrowLeftIcon /> Back to projects
      </button>
      <p style={{ marginTop: '2rem', color: 'var(--text2)' }}>Project not found.</p>
    </div>
  );

  const canAdmin = isProjectAdmin(project);
  const projectMembers = project.members || [];

  const isOverdueTask = (t) =>
    t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date();

  const visibleTasks = tasks.filter(t => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'overdue' ? isOverdueTask(t) :
      t.status === filter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const donePct = tasks.length ? Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/projects')} title="Back to projects">
            <ArrowLeftIcon />
          </button>
          <div>
            <h1 className="page-title">{project.name}</h1>
            <p className="page-subtitle">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {projectMembers.length} member{projectMembers.length !== 1 ? 's' : ''} · {donePct}% complete
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowMembers(true)}>
            <UsersIcon /> Team
          </button>
          {canAdmin && (
            <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
              <PlusIcon /> Add task
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {project.description}
        </p>
      )}

      {/* View toggle */}
      <div className="tabs">
        <button className={`tab-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
        <button className={`tab-btn ${view === 'board' ? 'active' : ''}`} onClick={() => setView('board')}>Board</button>
      </div>

      {/* Filters */}
      <div className="filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-pill ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key !== 'all' && (
              <span style={{ marginLeft: 5, opacity: 0.6 }}>
                {f.key === 'overdue'
                  ? tasks.filter(isOverdueTask).length
                  : tasks.filter(t => t.status === f.key).length}
              </span>
            )}
          </button>
        ))}
        <div className="search-wrap">
          <span className="search-icon"><SearchIcon /></span>
          <input
            className="search-input"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {visibleTasks.length === 0 ? (
        <Empty
          icon={<TaskIcon />}
          title={search || filter !== 'all' ? 'No tasks match your filter.' : 'No tasks yet.'}
          subtitle={canAdmin && !search && filter === 'all' ? 'Add the first task to get started.' : undefined}
          action={canAdmin && !search && filter === 'all' ? (
            <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
              <PlusIcon /> Add first task
            </button>
          ) : undefined}
        />
      ) : view === 'list' ? (
        <TaskList
          tasks={visibleTasks}
          projectMembers={projectMembers}
          isProjectAdmin={canAdmin}
          currentUser={user}
        />
      ) : (
        <KanbanBoard
          tasks={visibleTasks}
          projectMembers={projectMembers}
          isProjectAdmin={canAdmin}
          currentUser={user}
        />
      )}

      {showNewTask && (
        <TaskModal
          projectId={id}
          projectMembers={projectMembers}
          isProjectAdmin={canAdmin}
          onClose={() => setShowNewTask(false)}
        />
      )}
      {showMembers && (
        <MembersModal project={project} onClose={() => setShowMembers(false)} />
      )}
    </div>
  );
}
