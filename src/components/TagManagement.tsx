import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase, UserTag } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Tag, Plus, X, CreditCard as Edit2, Trash2, Save } from 'lucide-react';

interface TagManagementProps {
  onClose?: () => void;
}

const DEFAULT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

export default function TagManagement({ onClose }: TagManagementProps) {
  const { user } = useAuth();
  const [tags, setTags] = useState<UserTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(DEFAULT_COLORS[0]);
  const [editingTag, setEditingTag] = useState<UserTag | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTags();
    document.body.style.overflow = 'hidden';

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_tags')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (err: any) {
      console.error('Error loading tags:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      setError('');
      const { error } = await supabase
        .from('user_tags')
        .insert({
          name: newTagName.trim(),
          color: newTagColor,
          created_by: user?.id
        });

      if (error) throw error;

      setNewTagName('');
      setNewTagColor(DEFAULT_COLORS[0]);
      loadTags();
    } catch (err: any) {
      console.error('Error creating tag:', err);
      setError(err.message || 'Failed to create tag');
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      setError('');
      const { error } = await supabase
        .from('user_tags')
        .update({
          name: editingTag.name.trim(),
          color: editingTag.color,
          description: editingTag.description.trim()
        })
        .eq('id', editingTag.id);

      if (error) throw error;

      setEditingTag(null);
      loadTags();
    } catch (err: any) {
      console.error('Error updating tag:', err);
      setError(err.message || 'Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? This will remove it from all users.')) {
      return;
    }

    try {
      setError('');
      const { error } = await supabase
        .from('user_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      loadTags();
    } catch (err: any) {
      console.error('Error deleting tag:', err);
      setError(err.message || 'Failed to delete tag');
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center animate-fadeIn"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: '#0f172a'
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full mx-4 shadow-2xl"
        style={{
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Manage Tags</h3>
                <p className="text-sm text-gray-500 mt-0.5">Organize your followed users with custom tags</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ flex: 1 }}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6 border border-blue-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Create New Tag</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tag Name</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., AI, SEO, Tech"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        newTagColor === color ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateTag}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create Tag
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Your Tags ({tags.length})</h4>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading tags...</div>
            ) : tags.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No tags yet</p>
                <p className="text-gray-500 text-sm mt-1">Create your first tag to get started</p>
              </div>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  {editingTag?.id === tag.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={editingTag.description}
                        onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                        placeholder="Description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        {DEFAULT_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditingTag({ ...editingTag, color })}
                            className={`w-8 h-8 rounded-lg ${
                              editingTag.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateTag}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTag(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: tag.color }}
                        >
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{tag.name}</p>
                          {tag.description && (
                            <p className="text-sm text-gray-500">{tag.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingTag(tag)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
