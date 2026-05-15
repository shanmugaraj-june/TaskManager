import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/services';
import { Modal } from '../ui';
import { apiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function TaskModal({ task, projectId, projectMembers = [], onClose, isProjectAdmin }) {
  const qc = useQueryClient();
  const isEdit = !!task;

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'TODO',
    assigneeId: task?.assignee?.id || '',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
  });
  const [error, setError] = useState('');

  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: isEdit
      ? (data) => tasksApi.update(task.id, data)
      : (data) => tasksApi.create(projectId || task?.projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['my-tasks-summary'] });
      toast.success(isEdit ? 'Task updated!' : 'Task created!');
      onClose();
    },
    onError: (err) => setError(apiError(err)),
  });

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority.toLowerCase(),
      status: form.status.toLowerCase().replace('_', '-'),
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate || null,
    };
    mutation.mutate(payload);
  };

  const canEditAll = isProjectAdmin;

  return (
    <Modal
      title={isEdit ? 'Edit task' : 'New task'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-input" value={form.title} onChange={upd('title')}
          placeholder="What needs to be done?" disabled={!canEditAll} autoFocus />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" value={form.description} onChange={upd('description')}
          placeholder="Optional details, context, or acceptance criteria…" disabled={!canEditAll} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={upd('priority')} disabled={!canEditAll}>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={upd('status')}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Assignee</label>
          <select className="form-select" value={form.assigneeId} onChange={upd('assigneeId')} disabled={!canEditAll}>
            <option value="">Unassigned</option>
            {projectMembers.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Due date</label>
          <input className="form-input" type="date" value={form.dueDate} onChange={upd('dueDate')} disabled={!canEditAll} />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
    </Modal>
  );
}
