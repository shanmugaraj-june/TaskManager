import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, projectsApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Avatar, StatusBadge, PriorityBadge, Spinner, Empty, EditIcon, TaskIcon, CalendarIcon, SearchIcon } from '../components/ui';
import { formatDate, isOverdue } from '../utils/helpers';
import TaskModal from '../components/tasks/TaskModal';
import toast from 'react-hot-toast';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
  { key: 'overdue', label: 'Overdue' },
];

export default function MyTasksPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editTask, setEditTask] = useState(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => tasksApi.myTasks(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const toggleMutation = useMutation({
    mutationFn: (task) => tasksApi.update(task.id, {
      status: task.status === 'DONE' ? 'todo' : 'done',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['my-tasks-summary'] });
    },
    onError: () => toast.error('Could not update task.'),
  });

  const isOverdueTask = (t) => t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date();

  const visible = tasks.filter(t => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'overdue' ? isOverdueTask(t) :
      t.status === filter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getProjectMembers = (task) => {
    const proj = projects.find(p => p.id === task.project?.id);
    return proj?.members || [];
  };

  if (isLoading) return <Spinner />;

  const overdueCount = tasks.filter(isOverdueTask).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">
            {tasks.length} assigned to you
            {overdueCount > 0 && (
              <span style={{ color: 'var(--red)', marginLeft: 8 }}>· {overdueCount} overdue</span>
            )}
          </p>
        </div>
      </div>

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

      {visible.length === 0 ? (
        <Empty
          icon={<TaskIcon />}
          title={filter !== 'all' || search ? 'No tasks match your filter.' : 'No tasks assigned to you.'}
          subtitle={filter === 'all' && !search ? 'Tasks assigned to you will appear here.' : undefined}
        />
      ) : (
        <div className="task-list">
          {visible.map(t => {
            const overdue = isOverdueTask(t);
            return (
              <div key={t.id} className="task-item">
                <div
                  className={`task-check ${t.status === 'DONE' ? 'done' : ''}`}
                  onClick={() => toggleMutation.mutate(t)}
                  title="Toggle complete"
                />
                <div className="task-body">
                  <div className={`task-title ${t.status === 'DONE' ? 'done' : ''}`}>
                    {t.title}
                  </div>
                  <div className="task-meta">
                    {t.project && (
                      <span className="task-meta-item" style={{ color: 'var(--blue)', fontSize: 11 }}>
                        📁 {t.project.name}
                      </span>
                    )}
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    {t.dueDate && (
                      <span
                        className="task-meta-item"
                        style={{ color: overdue ? 'var(--red)' : undefined }}
                      >
                        <CalendarIcon />
                        {formatDate(t.dueDate)}
                        {overdue && ' · Overdue'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn-icon" onClick={() => setEditTask(t)} title="Edit">
                    <EditIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editTask && (
        <TaskModal
          task={editTask}
          projectMembers={getProjectMembers(editTask)}
          isProjectAdmin={false}
          onClose={() => {
            setEditTask(null);
            qc.invalidateQueries({ queryKey: ['my-tasks'] });
          }}
        />
      )}
    </div>
  );
}
