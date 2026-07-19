'use client';

import { useState } from 'react';
import { RequireAuth } from '@/components/providers/require-auth';
import { useMasters, useCreateMaster, useDeleteMaster } from '@/lib/queries/masters';
import type { Master } from '@/types/expense';

export default function MastersPage() {
  return (
    <RequireAuth>
      <MastersContent />
    </RequireAuth>
  );
}

function MastersContent() {
  const masters = useMasters();
  const createMaster = useCreateMaster();
  const deleteMaster = useDeleteMaster();

  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Master | null>(null);

  if (masters.isLoading) {
    return <div className="pt-10 text-center text-sm text-ink-faint">Loading...</div>;
  }

  if (masters.isError) {
    return (
      <div className="pt-10 text-center text-sm text-down">
        Failed to load masters. Check your connection.
      </div>
    );
  }

  return (
    <div className="pt-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Masters</h1>
      <p className="mb-6 text-sm text-ink-faint">Reference data for expenses.</p>

      <div className="rounded-card border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">
            All items ({masters.data?.length ?? 0})
          </h2>
          <button
            onClick={() => setShowNew(true)}
            className="rounded-lg bg-brand-soft px-3 py-1 text-xs font-semibold text-brand hover:bg-blue-100"
          >
            + Add
          </button>
        </div>

        <ul className="divide-y divide-gray-100">
          {masters.data?.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between py-2 text-sm"
            >
              <div>
                <span className="text-ink">{item.name}</span>
                {item.desc && (
                  <span className="ml-2 text-ink-faint">— {item.desc}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(item)}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${item.name}"?`)) {
                      deleteMaster.mutate(item);
                    }
                  }}
                  disabled={deleteMaster.isPending}
                  className="text-xs font-medium text-down hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {masters.data?.length === 0 && (
            <li className="py-4 text-center text-xs text-ink-faint">
              Nothing here yet.
            </li>
          )}
        </ul>
      </div>

      {(showNew || editing) && (
        <MasterFormModal
          initial={editing ?? undefined}
          onClose={() => {
            setShowNew(false);
            setEditing(null);
          }}
          onSave={(values) => {
            if (editing) {
              // API doesn't support update — delete + re-create
              deleteMaster.mutate(editing, {
                onSuccess: () => createMaster.mutate(values),
              });
            } else {
              createMaster.mutate(values);
            }
            setShowNew(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function MasterFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Master;
  onClose: () => void;
  onSave: (values: Master) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.desc ?? '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-card bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-semibold text-ink">
          {initial ? 'Edit' : 'New'} item
        </h3>

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input mb-3"
          autoFocus
        />

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Description
        </label>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="input mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-ink-soft hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSave({ name: name.trim(), desc: desc.trim() })}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
