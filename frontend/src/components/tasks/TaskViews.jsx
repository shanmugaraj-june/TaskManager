import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/services';
import { Avatar, StatusBadge, PriorityBadge, EditIcon, TrashIcon, CalendarIcon } from '../ui';
import { formatDate, isOverdue, statusLabel } from '../../utils/helpers';
import TaskModal from './TaskModal';
import toast from 'react-hot-toast';

function TaskRow({ task, projectMembers, isProjectAdmin, currentUser }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const canEdit = isProjectAdmin || task.assignee?.id === currentUser?.id;

  const toggleDone = useMutation({
    mutationFn: () => tasksApi.update(task.id, {
      status: task.status === 'DONE' ? 'todo' : 'done',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['my-tasks-summary'] });
    },
    onError: () => toast.error('Could not update task.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(task.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task deleted.');
    },
    onError: () => toast.error('Could not delete task.'),
  });

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.title}"?`)) deleteMutation.mutate();
  };

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <>
      <div className="task-item">
        <div
          className={`task-check ${task.status === 'DONE' ? 'done' : ''}`}
          onClick={() => canEdit && toggleDone.mutate()}
          title={canEdit ? 'Toggle complete' : undefined}
          style={{ cursor: canEdit ? 'pointer' : 'default' }}
        />
        <div className="task-body">
          <div className={`task-title ${task.status === 'DONE' ? 'done' : ''}`}>{task.title}</div>
          <div className="task-meta">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {task.assignee && (
              <span className="task-meta-item">
                <Avatar name={task.assignee.name} size={16} fontSize={7} />
                {task.assignee.name.split(' ')[0]}
              </span>
            )}
            {task.dueDate && (
              <span className="task-meta-item" style={{ color: overdue ? 'var(--red)' : undefined }}>
                <CalendarIcon />
                {formatDate(task.dueDate)}
                {overdue && ' · Overdue'}
              </span>
            )}
          </div>
        </div>
        <div className="task-actions">
          {canEdit && (
            <button className="btn-icon" onClick={() => setEditing(true)} title="Edit">
              <EditIcon />
            </button>
          )}
          {isProjectAdmin && (
            <button className="btn-icon" onClick={handleDelete} title="Delete"
              style={{ color: 'var(--red)' }} disabled={deleteMutation.isPending}>
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      {editing && (
        <TaskModal
          task={task}
          projectMembers={projectMembers}
          isProjectAdmin={isProjectAdmin}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

export function TaskList({ tasks, projectMembers, isProjectAdmin, currentUser }) {
  if (!tasks?.length) return null;
  return (
    <div className="task-list">
      {tasks.map(t => (
        <TaskRow
          key={t.id}
          task={t}
          projectMembers={projectMembers}
          isProjectAdmin={isProjectAdmin}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
}

function KanbanCard({ task, projectMembers, isProjectAdmin, currentUser }) {
  const [editing, setEditing] = useState(false);
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <>
      <div className="kanban-card" onClick={() => setEditing(true)}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 7, flexWrap: 'wrap' }}>
          <PriorityBadge priority={task.priority} />
          {overdue && <span className="badge badge-overdue">Overdue</span>}
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, lineHeight: 1.4 }}>{task.title}</p>
        {task.description && (
          <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, lineHeight: 1.5 }}>
            {task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          {task.assignee ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)' }}>
              <Avatar name={task.assignee.name} size={18} fontSize={8} />
              {task.assignee.name.split(' ')[0]}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Unassigned</span>
          )}
          {task.dueDate && (
            <span style={{ fontSize: 10, color: overdue ? 'var(--red)' : 'var(--text3)' }}>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {editing && (
        <TaskModal
          task={task}
          projectMembers={projectMembers}
          isProjectAdmin={isProjectAdmin}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

const COLUMNS = [
  { status: 'TODO', label: 'To Do', color: 'var(--text2)' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'var(--blue)' },
  { status: 'DONE', label: 'Done', color: 'var(--green)' },
];

export function KanbanBoard({ tasks, projectMembers, isProjectAdmin, currentUser }) {
  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status);
        return (
          <div key={col.status} className="kanban-col">
            <div className="kanban-col-header">
              <span className="kanban-col-title" style={{ color: col.color }}>{col.label}</span>
              <span className="kanban-count">{colTasks.length}</span>
            </div>
            <div className="kanban-col-body">
              {colTasks.map(t => (
                <KanbanCard
                  key={t.id}
                  task={t}
                  projectMembers={projectMembers}
                  isProjectAdmin={isProjectAdmin}
                  currentUser={currentUser}
                />
              ))}
              {colTasks.length === 0 && (
                <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
