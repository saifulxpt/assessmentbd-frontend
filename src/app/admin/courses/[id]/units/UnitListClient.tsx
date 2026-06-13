'use client';

import { useState, useActionState } from 'react';
import { createUnit, deleteUnit } from '@/app/actions/admin-unit.actions';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {pending ? 'Saving...' : isEditing ? 'Update Unit' : 'Create Unit'}
    </button>
  );
}

export default function UnitListClient({ initialUnits, courseId }: { initialUnits: any[], courseId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createUnitWithCourseId = createUnit.bind(null, courseId);
  const [state, formAction] = useActionState(createUnitWithCourseId, null);

  const handleDelete = async (unitId: string) => {
    if (confirm('Are you sure you want to delete this unit? This will delete all exams inside it.')) {
      await deleteUnit(courseId, unitId);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg shadow-md hover:bg-gray-800 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Unit</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {initialUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{unit.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{unit.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{unit.sort_order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${unit.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {unit.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium">{unit._count?.exams || 0}</span> Exams / <span className="font-medium">{unit._count?.unit_written_qas || 0}</span> Written Q&A
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/exams?unit=${unit.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Manage Exams
                    </Link>
                    <button onClick={() => handleDelete(unit.id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {initialUnits.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No units found in this course. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New Unit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form action={async (formData) => {
              await formAction(formData);
              setIsModalOpen(false);
            }} className="space-y-6">
              {state?.error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{state.error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Title</label>
                <input name="title" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Chapter 1: Introduction" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Optional description about this unit..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input name="sort_order" type="number" defaultValue={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="is_active" value="true" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                    <span className="text-sm font-medium text-gray-700">Unit is Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</button>
                <SubmitButton isEditing={false} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
