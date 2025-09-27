import React, { useState, useEffect } from 'react'
import { Note } from '../types/Note'
import { Eye, Tag, CheckCircle, BookOpen, Share2, Copy, ExternalLink } from 'lucide-react'
import { aiService } from '../services/aiService'

interface SidebarAIProps {
  note: Note
  editorRef: React.RefObject<HTMLDivElement>
  onUpdateNote: (note: Note) => void
}

function stripHtml(html = '') {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

function textToHtml(text = '') {
  return text.replace(/\n/g, '<br/>')
}

export default function SidebarAI({ note, editorRef, onUpdateNote }: SidebarAIProps) {
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summary, setSummary] = useState('')
  const [loadingTags, setLoadingTags] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [loadingGrammar, setLoadingGrammar] = useState(false)
  const [grammarResult, setGrammarResult] = useState<{ corrected?:string; issues?:any[]; hasChanges?:boolean }>({})
  const [loadingGlossary, setLoadingGlossary] = useState(false)
  const [glossary, setGlossary] = useState<{term:string;definition:string}[]>([])
  const [highlightOn, setHighlightOn] = useState(false)
  const [error, setError] = useState('')
  const [loadingShare, setLoadingShare] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareCopied, setShareCopied] = useState(false)

  // Reset all AI panel state when note changes
  useEffect(() => {
    setSummary('')
    setTags([])
    setGrammarResult({})
    setGlossary([])
    setShareUrl('')
    setShareCopied(false)
    setError('')
    setHighlightOn(false)
    setLoadingSummary(false)
    setLoadingTags(false)
    setLoadingGrammar(false)
    setLoadingGlossary(false)
    setLoadingShare(false)
    
    // Remove any existing highlights from the editor
    if (editorRef.current) {
      removeHighlights()
    }
  }, [note.id])

  async function callApi(path:string, body:any) {
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      
      return res.json()
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  async function handleGenerateSummary() {
    setError('')
    setLoadingSummary(true)
    setSummary('')
    try {
      const summary = await aiService.generateSummary(note.content || '')
      setSummary(summary)
    } catch (e:any) {
      setError('Failed to generate summary')
    } finally {
      setLoadingSummary(false)
    }
  }

  async function handleSuggestTags() {
    setError('')
    setLoadingTags(true)
    setTags([])
    try {
      const tags = await aiService.suggestTags(note.content || '')
      setTags(tags)
    } catch {
      setError('Failed to suggest tags')
    } finally {
      setLoadingTags(false)
    }
  }

  async function handleGrammarCheck() {
    setError('')
    setLoadingGrammar(true)
    setGrammarResult({})
    try {
      const text = stripHtml(note.content)
      const corrected = await aiService.checkGrammar(text)
      
      // Check if the corrected text is different from original
      const hasChanges = corrected && corrected.trim() !== text.trim()
      setGrammarResult({
        corrected: corrected,
        hasChanges: hasChanges
      })
    } catch {
      setError('Failed to check grammar')
    } finally {
      setLoadingGrammar(false)
    }
  }

  async function applyGrammarFix() {
    const corrected = grammarResult.corrected
    if (!corrected) return
    const updatedNote = { ...note, content: corrected }
    onUpdateNote(updatedNote)
    if (editorRef.current) {
      editorRef.current.innerHTML = corrected
    }
  }

  async function handleGenerateGlossary() {
    setError('')
    setLoadingGlossary(true)
    setGlossary([])
    try {
      const terms = await aiService.generateGlossary(note.content || '')
      setGlossary(terms)
    } catch {
      setError('Failed to create glossary')
    } finally {
      setLoadingGlossary(false)
    }
  }

  function removeHighlights() {
    const root = editorRef.current
    if (!root) return
    const spans = Array.from(root.querySelectorAll('span.ai-gloss'))
    for (const s of spans) {
      const txt = document.createTextNode(s.textContent || '')
      s.parentNode?.replaceChild(txt, s)
    }
  }

  function wrapTextNodes(node: Node, term: string, definition: string) {
    const termLower = term.toLowerCase()
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      const idx = text.toLowerCase().indexOf(termLower)
      if (idx >= 0 && text.trim().length) {
        const matched = (node as Text).splitText(idx)
        const after = matched.splitText(term.length)
        const span = document.createElement('span')
        span.className = 'ai-gloss'
        span.title = definition
        span.textContent = matched.textContent
        matched.parentNode?.replaceChild(span, matched)
        wrapTextNodes(after, term, definition)
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      if (el.tagName === 'SCRIPT' || el.classList.contains('ai-gloss')) return
      for (let i = 0; i < node.childNodes.length; i++) {
        wrapTextNodes(node.childNodes[i], term, definition)
      }
    }
  }

  function highlightInEditor() {
    if (!editorRef.current) return
    removeHighlights()
    for (const g of glossary) {
      wrapTextNodes(editorRef.current, g.term, g.definition)
    }
  }

  function toggleHighlight() {
    if (!highlightOn) {
      highlightInEditor()
      setHighlightOn(true)
      return
    }
    removeHighlights()
    setHighlightOn(false)
  }

  async function handleShareNote() {
    setError('')
    setLoadingShare(true)
    setShareCopied(false)
    try {
      console.log('Sharing note:', { 
        noteId: note.id,
        title: note.title,
        content: note.content?.substring(0, 100) + '...',
        tags: note.tags
      })
      
      const data = await callApi('http://localhost:5000/api/notes/share', { 
        noteId: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags
      })
      
      console.log('Share response:', data)
      
      const generatedUrl = data.shareUrl || data.url
      setShareUrl(generatedUrl)
      
      const updatedNote = { 
        ...note, 
        isShared: true, 
        shareId: data.shareId, 
        shareUrl: generatedUrl 
      }
      onUpdateNote(updatedNote)
      
    } catch (error) {
      console.error('Share error:', error)
      setError(`Failed to create shareable link: ${error.message || error}`)
    } finally {
      setLoadingShare(false)
    }
  }

  async function copyShareUrl() {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

  function openSharedNote() {
    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
  }

  return (
    <div className="space-y-4 p-4 w-72">
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-semibold">Summary</h3>
          </div>
          <button onClick={handleGenerateSummary} className="text-sm text-indigo-600">
            {loadingSummary ? '...' : 'Generate'}
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-600 min-h-[48px]">
          {summary ? <div className="text-sm text-gray-800">{summary}</div> : <div className="italic text-gray-400">Click generate to create a summary</div>}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-semibold">Tags</h3>
          </div>
          <button onClick={handleSuggestTags} className="text-sm text-indigo-600">
            {loadingTags ? '...' : 'Suggest'}
          </button>
        </div>
        <div className="mt-3">
          {tags.length ? tags.map(t => <span key={t} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-2 mb-2">{t}</span>) : <div className="italic text-gray-400 text-sm">Click suggest to get tag recommendations</div>}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-orange-600" />
            <h3 className="text-sm font-semibold">Grammar Check</h3>
          </div>
          <button onClick={handleGrammarCheck} className="text-sm text-indigo-600">
            {loadingGrammar ? '...' : 'Check'}
          </button>
        </div>
        <div className="mt-3 text-sm">
          {grammarResult.corrected ? (
            <>
              {grammarResult.hasChanges ? (
                <>
                  <div className="text-sm text-orange-700">Grammar issues found! Click Apply Fix to correct them.</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={applyGrammarFix} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Apply Fix</button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-green-700">✅ No grammar issues found! Your text is perfect.</div>
              )}
            </>
          ) : <div className="italic text-gray-400">Click check to analyze grammar</div>}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-semibold">Auto Glossary</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleGenerateGlossary} className="text-sm text-indigo-600">{loadingGlossary ? '...' : 'Generate'}</button>
            <button onClick={toggleHighlight} className="text-sm text-gray-600">{highlightOn ? 'Remove highlight' : 'Highlight'}</button>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          {glossary.length ? (
            <div className="space-y-2 max-h-48 overflow-auto">
              {glossary.map(g => (
                <div key={g.term} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-sm">{g.term}</div>
                  <div className="text-xs text-gray-600">{g.definition}</div>
                </div>
              ))}
            </div>
          ) : <div className="italic text-gray-400">Hover over key terms for definitions</div>}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold">Share Note</h3>
          </div>
          <button onClick={handleShareNote} className="text-sm text-indigo-600">
            {loadingShare ? '...' : 'Share'}
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          {shareUrl || note.shareUrl ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Shareable link:</div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={shareUrl || note.shareUrl || ''} 
                  readOnly 
                  className="flex-1 text-xs p-2 border rounded bg-gray-50"
                />
                <button 
                  onClick={copyShareUrl} 
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button 
                  onClick={openSharedNote} 
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              {shareCopied && (
                <div className="text-xs text-green-600">✅ Link copied to clipboard!</div>
              )}
            </div>
          ) : (
            <div className="italic text-gray-400">Click share to create a shareable link</div>
          )}
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      <style>{`.ai-gloss{background:rgba(253,240,248,0.7);border-bottom:1px dashed rgba(128,90,200,0.7);cursor:help;padding:0 1px}`}</style>
    </div>
  )
}
