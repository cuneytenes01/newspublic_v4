import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase, UserTag, TwitterUser } from '../lib/supabase';
import { Tag, X, Check, ArrowUp, ArrowDown } from 'lucide-react';

interface UserTagAssignmentProps {
  user: TwitterUser;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UserTagAssignment({ user, onClose, onUpdate }: UserTagAssignmentProps) {
  const [availableTags, setAvailableTags] = useState<UserTag[]>([]);
  const [assignedTags, setAssignedTags] = useState<UserTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    document.body.style.overflow = 'hidden';

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [user.id, onClose]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [tagsResult, assignedResult] = await Promise.all([
        supabase.from('user_tags').select('*').order('name', { ascending: true }),
        supabase
          .from('twitter_user_tags')
          .select('*, user_tags(*)')
          .eq('twitter_user_id', user.id)
          .order('assigned_at', { ascending: true })
      ]);

      if (tagsResult.error) throw tagsResult.error;
      if (assignedResult.error) throw assignedResult.error;

      setAvailableTags(tagsResult.data || []);
      const assigned = assignedResult.data?.map((t: any) => t.user_tags).filter(Boolean) || [];
      setAssignedTags(assigned);
    } catch (err) {
      console.error('Error loading tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: UserTag) => {
    setAssignedTags((prev) => {
      const index = prev.findIndex(t => t.id === tag.id);
      if (index >= 0) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const moveTagUp = (index: number) => {
    if (index === 0) return;
    setAssignedTags((prev) => {
      const newTags = [...prev];
      [newTags[index - 1], newTags[index]] = [newTags[index], newTags[index - 1]];
      return newTags;
    });
  };

  const moveTagDown = (index: number) => {
    if (index === assignedTags.length - 1) return;
    setAssignedTags((prev) => {
      const newTags = [...prev];
      [newTags[index], newTags[index + 1]] = [newTags[index + 1], newTags[index]];
      return newTags;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await supabase
        .from('twitter_user_tags')
        .delete()
        .eq('twitter_user_id', user.id);

      if (assignedTags.length > 0) {
        const insertData = assignedTags.map((tag, index) => ({
          twitter_user_id: user.id,
          tag_id: tag.id,
          assigned_at: new Date(Date.now() + index * 1000).toISOString()
        }));

        const { error } = await supabase
          .from('twitter_user_tags')
          .insert(insertData);

        if (error) throw error;
      }

      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error saving tags:', err);
      alert('Failed to save tags');
    } finally {
      setSaving(false);
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
          maxWidth: '600px',
          maxHeight: '85vh',
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
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Assign Tags</h3>
                <p className="text-sm text-gray-500 mt-0.5">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ flex: 1 }}>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading tags...</div>
          ) : availableTags.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No tags available</p>
              <p className="text-gray-500 text-sm mt-1">Create tags first in the tag management panel</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-gray-600 mb-3">Assigned Tags (drag to reorder):</p>
                {assignedTags.length === 0 ? (
                  <p className="text-gray-500 text-sm italic py-4 text-center">No tags assigned yet</p>
                ) : (
                  <div className="space-y-2">
                    {assignedTags.map((tag, index) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-2 p-3 rounded-xl border-2 border-current shadow-md"
                        style={{ borderColor: tag.color }}
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveTagUp(index)}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ArrowUp className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => moveTagDown(index)}
                            disabled={index === assignedTags.length - 1}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ArrowDown className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        >
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{tag.name}</p>
                          {index === 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">Primary tag (shown in list)</p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleTag(tag)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-gray-600 mb-3">Available Tags:</p>
                <div className="space-y-2">
                  {availableTags.filter(tag => !assignedTags.find(t => t.id === tag.id)).map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: tag.color }}
                      >
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-gray-900">{tag.name}</p>
                        {tag.description && (
                          <p className="text-xs text-gray-500">{tag.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 shadow-lg"
          >
            {saving ? 'Saving...' : 'Save Tags'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
