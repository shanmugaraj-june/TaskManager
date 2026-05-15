import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi, usersApi } from '../../api/services';
import { Avatar, Modal } from '../ui';
import { apiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function MembersModal({ project, onClose }) {
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const members = project.members || [];
  const nonMembers = allUsers.filter(u => !members.find(m => m.id === u.id));

  const addMutation = useMutation({
    mutationFn: (userId) => projectsApi.addMember(project.id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', project.id] });
      toast.success('Member added!');
    },
    onError: (err) => { setError(apiError(err)); setTimeout(() => setError(''), 3000); },
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => projectsApi.removeMember(project.id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', project.id] });
      toast.success('Member removed.');
    },
    onError: (err) => { setError(apiError(err)); setTimeout(() => setError(''), 3000); },
  });

  return (
    <Modal
      title={`Team — ${project.name}`}
      onClose={onClose}
      footer={<button className="btn btn-ghost" onClick={onClose}>Close</button>}
    >
      {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '.75rem' }}>
        Current members ({members.length})
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.25rem' }}>
        {members.map(u => (
          <div key={u.id} style={rowStyle}>
            <Avatar name={u.name} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</div>
            </div>
            {u.id === project.adminId
              ? <span className="badge badge-admin">Admin</span>
              : (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeMutation.mutate(u.id)}
                  disabled={removeMutation.isPending}
                >
                  Remove
                </button>
              )
            }
          </div>
        ))}
      </div>

      {nonMembers.length > 0 && (
        <>
          <div className="divider" />
          <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '.75rem' }}>
            Add members ({nonMembers.length} available)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {nonMembers.map(u => (
              <div key={u.id} style={rowStyle}>
                <Avatar name={u.name} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</div>
                </div>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => addMutation.mutate(u.id)}
                  disabled={addMutation.isPending}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}

const rowStyle = {
  display: 'flex', alignItems: 'center', gap: 12,
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 14px',
};
