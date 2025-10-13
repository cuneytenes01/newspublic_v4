import { useState, useEffect } from 'react';
import { Plus, Twitter, X, LogOut, Loader2, Sparkles, BarChart3, Users, Tag, Filter, Bookmark, TrendingUp, Settings, CreditCard as Edit3, Search } from 'lucide-react';
import { TwitterUser, UserTag, TwitterUserTag, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TagManagement from './TagManagement';
import UserTagAssignment from './UserTagAssignment';

interface SidebarProps {
  twitterUsers: TwitterUser[];
  selectedUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  onAddUser: (username: string) => Promise<void>;
  onRemoveUser: (userId: string) => Promise<void>;
  currentPage: 'timeline' | 'trending' | 'saved';
  onPageChange: (page: 'timeline' | 'trending' | 'saved') => void;
  onFetchTweets: (userId: string | null) => Promise<void>;
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
}

export default function Sidebar({
  twitterUsers,
  selectedUserId,
  onSelectUser,
  onAddUser,
  onRemoveUser,
  currentPage,
  onPageChange,
  onFetchTweets,
  selectedTagId,
  onSelectTag
}: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTagManagement, setShowTagManagement] = useState(false);
  const [editingUserTags, setEditingUserTags] = useState<TwitterUser | null>(null);
  const [tags, setTags] = useState<UserTag[]>([]);
  const [userTags, setUserTags] = useState<Map<string, UserTag[]>>(new Map());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkUsernames, setBulkUsernames] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const { signOut } = useAuth();

  useEffect(() => {
    loadTags();
    loadUserTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('user_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const loadUserTags = async () => {
    try {
      const { data, error } = await supabase
        .from('twitter_user_tags')
        .select('*, user_tags(*)');

      if (error) throw error;

      const tagMap = new Map<string, UserTag[]>();
      data?.forEach((item: TwitterUserTag) => {
        if (item.user_tags) {
          const existing = tagMap.get(item.twitter_user_id) || [];
          tagMap.set(item.twitter_user_id, [...existing, item.user_tags]);
        }
      });

      setUserTags(tagMap);
    } catch (err) {
      console.error('Error loading user tags:', err);
    }
  };

  const toggleTagFilter = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const filteredUsers = (() => {
    let users = selectedTags.length === 0
      ? twitterUsers
      : twitterUsers.filter((user) => {
          const userTagList = userTags.get(user.id) || [];
          return selectedTags.some((tagId) =>
            userTagList.some((tag) => tag.id === tagId)
          );
        });

    if (userSearchQuery.trim()) {
      users = users.filter((user) =>
        user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(userSearchQuery.toLowerCase())
      );
    }

    return users;
  })();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setLoading(true);
    try {
      await onAddUser(newUsername.trim());
      setNewUsername('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkUsernames.trim()) return;

    setBulkLoading(true);
    const usernames = bulkUsernames
      .split(/[\n,;]/)
      .map(u => u.trim().replace('@', ''))
      .filter(u => u.length > 0);

    let successCount = 0;
    let failCount = 0;

    for (const username of usernames) {
      try {
        await onAddUser(username);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to add ${username}:`, error);
        failCount++;
      }
    }

    setBulkLoading(false);
    setBulkUsernames('');
    setShowBulkImport(false);

    alert(`✅ ${successCount} kullanıcı eklendi${failCount > 0 ? `\n❌ ${failCount} kullanıcı eklenemedi` : ''}`);
  };

  return (
    <div className="w-80 bg-gradient-to-b from-slate-50 to-white border-r border-gray-200 flex flex-col h-screen shadow-lg relative z-10">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-600 to-cyan-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <Twitter className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Twitter Monitor</h1>
              <p className="text-xs text-blue-100 font-medium">AI-Powered Analytics</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => onPageChange('timeline')}
            className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all ${
              currentPage === 'timeline'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Users className="w-4 h-4" />
            Timeline
          </button>
          <button
            onClick={() => onPageChange('trending')}
            className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all ${
              currentPage === 'trending'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Discover
          </button>
          <button
            onClick={() => onPageChange('saved')}
            className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all ${
              currentPage === 'saved'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 py-3 px-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>

          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="w-full flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white py-2.5 px-4 rounded-xl font-bold hover:bg-white/30 transition-all text-sm"
          >
            <Users className="w-4 h-4" />
            Bulk Import
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddUser} className="mt-3 space-y-2 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="@username"
              className="w-full px-4 py-3 bg-white rounded-xl focus:ring-2 focus:ring-white focus:border-transparent text-sm font-medium placeholder:text-gray-400"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white text-blue-600 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all disabled:opacity-50 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewUsername('');
                }}
                className="flex-1 bg-white/20 backdrop-blur-sm text-white py-2.5 rounded-xl text-sm font-bold hover:bg-white/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {showBulkImport && (
          <div className="mt-3 space-y-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <div>
              <label className="block text-white text-xs font-bold mb-2">
                Liste (her satırda 1 kullanıcı, virgül veya noktalı virgül ile de ayırabilirsiniz)
              </label>
              <textarea
                value={bulkUsernames}
                onChange={(e) => setBulkUsernames(e.target.value)}
                placeholder="elonmusk&#10;openai&#10;naval&#10;veya: elonmusk, openai, naval"
                rows={6}
                className="w-full px-3 py-2 bg-white rounded-xl text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-white resize-none"
                disabled={bulkLoading}
              />
              <p className="text-xs text-blue-100 mt-1">
                @ işaretine gerek yok, sadece kullanıcı adlarını yazın
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={bulkLoading || !bulkUsernames.trim()}
                className="flex-1 bg-white text-blue-600 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all disabled:opacity-50 shadow-sm"
              >
                {bulkLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ekleniyor...
                  </div>
                ) : (
                  'Toplu Ekle'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkImport(false);
                  setBulkUsernames('');
                }}
                disabled={bulkLoading}
                className="flex-1 bg-white/20 backdrop-blur-sm text-white py-2.5 rounded-xl text-sm font-bold hover:bg-white/30 transition-all disabled:opacity-50"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter by Tags
            </button>
            <button
              onClick={() => setShowTagManagement(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm"
            >
              <Tag className="w-3 h-3" />
              Manage
            </button>
          </div>

          {showFilters && tags.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-200">
              <p className="text-xs font-bold text-gray-600 uppercase">Filter by Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagFilter(tag.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'ring-2 ring-offset-1 shadow-sm'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}40`,
                      color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                      ringColor: tag.color
                    }}
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

        <div className="space-y-2">
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 font-medium mb-2 px-1">
            {twitterUsers.length} user{twitterUsers.length !== 1 ? 's' : ''} monitored
          </p>

          <div className="relative group">
            <button
              onClick={() => onSelectUser(null)}
              className={`w-full text-left px-4 py-3.5 rounded-xl font-bold transition-all flex items-center justify-between ${
                selectedUserId === null
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                All Users
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                selectedUserId === null
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {twitterUsers.length}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFetchTweets(null);
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                selectedUserId === null
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-blue-100 text-blue-600'
              }`}
              title="Fetch tweets for all users"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="group relative"
            >
            <div
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                selectedUserId === user.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md scale-105'
                  : 'hover:bg-gray-100 hover:scale-102'
              }`}
              onClick={() => onSelectUser(user.id)}
            >
              {user.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedUserId === user.id ? 'bg-white/20' : 'bg-gradient-to-br from-blue-400 to-cyan-400'
                }`}>
                  <Twitter className={`w-5 h-5 ${
                    selectedUserId === user.id ? 'text-white' : 'text-white'
                  }`} />
                </div>
              )}
              <div className="flex-1 min-w-0 pr-16">
                <p className={`font-bold ${
                  selectedUserId === user.id ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.display_name || user.username}
                </p>
                <p className={`text-xs font-medium ${
                  selectedUserId === user.id ? 'text-blue-100' : 'text-gray-500'
                }`}>@{user.username}</p>
                {userTags.get(user.id) && userTags.get(user.id)!.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {userTags.get(user.id)!.slice(0, 1).map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold"
                        style={{
                          backgroundColor: selectedUserId === user.id ? 'rgba(255,255,255,0.2)' : `${tag.color}20`,
                          color: selectedUserId === user.id ? 'white' : tag.color
                        }}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag.name}
                      </span>
                    ))}
                    {userTags.get(user.id)!.length > 2 && (
                      <span className={`text-xs font-medium ${
                        selectedUserId === user.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>+{userTags.get(user.id)!.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="absolute right-2 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFetchTweets(user.id);
                  }}
                  className={`p-1.5 rounded-full transition-all ${
                    selectedUserId === user.id
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-purple-100 text-purple-600'
                  }`}
                  title="Fetch tweets"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingUserTags(user);
                  }}
                  className={`p-1.5 rounded-full transition-all ${
                    selectedUserId === user.id
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-blue-100 text-blue-600'
                  }`}
                  title="Assign tags"
                >
                  <Tag className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveUser(user.id);
                  }}
                  className={`p-1.5 rounded-full transition-all ${
                    selectedUserId === user.id
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-red-100 text-red-600'
                  }`}
                  title="Remove user"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {showTagManagement && (
        <TagManagement onClose={() => {
          setShowTagManagement(false);
          loadTags();
          loadUserTags();
        }} />
      )}

      {editingUserTags && (
        <UserTagAssignment
          user={editingUserTags}
          onClose={() => setEditingUserTags(null)}
          onUpdate={() => {
            loadUserTags();
          }}
        />
      )}

      <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-slate-50 to-white">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-all border-2 border-gray-200 hover:border-red-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
