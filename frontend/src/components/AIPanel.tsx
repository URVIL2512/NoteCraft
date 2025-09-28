import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Tags, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Note } from '../types/Note';
import { aiService } from '../services/aiService';

interface AIPanelProps {
  note: Note;
  onUpdateNote: (note: Note) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ note, onUpdateNote }) => {
  const [summary, setSummary] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [grammarIssues, setGrammarIssues] = useState<string[]>([]);
  const [glossaryTerms, setGlossaryTerms] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState({
    summary: false,
    tags: false,
    grammar: false,
    glossary: false,
  });

  useEffect(() => {
    if (note.content && !note.isEncrypted) {
      const fetchGlossary = async () => {
        setLoading(prev => ({ ...prev, glossary: true }));
        try {
          const termsArray = await aiService.generateGlossary(note.content);
          const termsObject: { [key: string]: string } = {};
          termsArray.forEach(({ term, definition }) => {
            termsObject[term] = definition;
          });
          setGlossaryTerms(termsObject);
        } catch (error) {
          console.error('Failed to generate glossary:', error);
        } finally {
          setLoading(prev => ({ ...prev, glossary: false }));
        }
      };
      fetchGlossary();
    }
  }, [note.content, note.isEncrypted]);

  const generateSummary = async () => {
    if (note.isEncrypted) return;
    setLoading(prev => ({ ...prev, summary: true }));
    try {
      const summaryText = await aiService.generateSummary(note.content);
      setSummary(summaryText);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const generateTags = async () => {
    if (note.isEncrypted) return;
    setLoading(prev => ({ ...prev, tags: true }));
    try {
      const tags = await aiService.suggestTags(note.content);
      setSuggestedTags(tags);
    } catch (error) {
      console.error('Failed to generate tags:', error);
    } finally {
      setLoading(prev => ({ ...prev, tags: false }));
    }
  };

  const checkGrammar = async () => {
    if (note.isEncrypted) return;
    setLoading(prev => ({ ...prev, grammar: true }));
    try {
      const issues = await aiService.checkGrammar(note.content);
      setGrammarIssues(Array.isArray(issues) ? issues : [issues]);
    } catch (error) {
      console.error('Failed to check grammar:', error);
    } finally {
      setLoading(prev => ({ ...prev, grammar: false }));
    }
  };

  const addTagToNote = (tag: string) => {
    if (!note.tags.includes(tag)) {
      onUpdateNote({ ...note, tags: [...note.tags, tag] });
    }
  };

  const removeTagFromNote = (tagToRemove: string) => {
    onUpdateNote({ ...note, tags: note.tags.filter(tag => tag !== tagToRemove) });
  };

  if (note.isEncrypted) {
    return (
      <div className="h-full p-4 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p>AI features unavailable</p>
          <p className="text-sm mt-2">Decrypt note to access AI tools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Assistant
        </h2>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Summary
            </h3>
            <button
              onClick={generateSummary}
              disabled={loading.summary}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {loading.summary ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
            </button>
          </div>
          <p className={`text-sm ${summary ? 'text-gray-700' : 'text-gray-500 italic'}`}>
            {summary || 'Click generate to create a summary'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Tags className="h-4 w-4 text-green-600" />
              Tags
            </h3>
            <button
              onClick={generateTags}
              disabled={loading.tags}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {loading.tags ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Suggest'}
            </button>
          </div>

          {note.tags.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Current tags:</p>
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full cursor-pointer hover:bg-blue-200"
                    onClick={() => removeTagFromNote(tag)}
                  >
                    {tag}
                    <span className="ml-1 text-blue-600">×</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {suggestedTags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => addTagToNote(tag)}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full hover:bg-green-200 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading.tags && suggestedTags.length === 0 && (
            <p className="text-sm text-gray-500 italic">Click suggest to get tag recommendations</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              Grammar Check
            </h3>
            <button
              onClick={checkGrammar}
              disabled={loading.grammar}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {loading.grammar ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
            </button>
          </div>

          {grammarIssues.length > 0 ? (
            <div className="space-y-2">
              {grammarIssues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{issue}</p>
                </div>
              ))}
            </div>
          ) : !loading.grammar ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-700">No grammar issues found!</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Click check to analyze grammar</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-purple-600" />
            Auto Glossary
            {loading.glossary && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </h3>

          {Object.keys(glossaryTerms).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(glossaryTerms).map(([term, definition]) => (
                <div key={term} className="border-l-4 border-purple-200 pl-3">
                  <h4 className="font-medium text-gray-900 text-sm">{term}</h4>
                  <p className="text-xs text-gray-600 mt-1">{definition}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {loading.glossary ? 'Analyzing content...' : 'Hover over key terms for definitions'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
