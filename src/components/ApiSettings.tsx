import { useState, useEffect } from 'react';
import { X, Key, Save, AlertCircle } from 'lucide-react';

interface ApiSettingsProps {
  onClose: () => void;
}

const AI_MODELS = [
  { id: 'google/gemini-flash-1.5-latest', name: 'Gemini Flash 1.5 Latest', cost: '~$0.00002' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', cost: '$0.075' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', cost: '$1.25' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', cost: '$0.25' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', cost: '$3.00' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', cost: '$0.15' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', cost: '$2.50' },
];

export default function ApiSettings({ onClose }: ApiSettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('google/gemini-flash-1.5-latest');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key');
    const savedModel = localStorage.getItem('openrouter_model');
    if (savedKey) {
      setApiKey(savedKey);
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage('Please enter an API key');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (response.ok) {
        localStorage.setItem('openrouter_api_key', apiKey.trim());
        localStorage.setItem('openrouter_model', selectedModel);
        setMessage('Settings saved successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      localStorage.setItem('openrouter_api_key', apiKey.trim());
      localStorage.setItem('openrouter_model', selectedModel);
      setMessage('Settings saved (validation skipped)');
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('openrouter_api_key');
    localStorage.removeItem('openrouter_model');
    setApiKey('');
    setSelectedModel('google/gemini-flash-1.5-latest');
    setMessage('Settings cleared');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  API Settings
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Configure your OpenRouter API key</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700 space-y-2">
                <p className="font-semibold text-blue-900">How to get your OpenRouter API key:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">openrouter.ai</a></li>
                  <li>Sign in or create an account</li>
                  <li>Navigate to API Keys section</li>
                  <li>Create a new API key and copy it</li>
                  <li>Paste it below</li>
                </ol>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Your API key is stored locally in your browser and never sent to our servers
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              {AI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.cost})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Choose the AI model for translation and summarization
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl ${
              message.includes('success') || message.includes('saved')
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !apiKey.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save API Key
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
