import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/services';
import { Modal } from '../ui';
import { apiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ProjectModal({ project, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!project;

  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: isEdit
      ? (data) => projectsApi.update(project.id, data)
      : (data) => projectsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(isEdit ? 'Project updated!' : 'Project created!');
      onClose();
    },
    onError: (err) => setError(apiError(err)),
  });

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setError('');
    mutation.mutate({ name: form.name.trim(), description: form.description.trim() || undefined });
  };

  return (
    <Modal
      title={isEdit ? 'Edit project' : 'New project'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Project name *</label>
        <input
          className="form-input"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="e.g. Website Redesign"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="What is this project about? (optional)"
          rows={3}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </Modal>
  );
}
