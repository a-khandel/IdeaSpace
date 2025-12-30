import React, { useState } from 'react';

interface SuggestionsResponse {
  success: boolean;
  suggestions?: string[];
  error?: string;
}

export function SuggestionsBox({ onSuggestion }: { onSuggestion: (suggestion: string) => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [collapsed, setCollapsed] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8789/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: '' }) // Optionally pass context
      });
      const data: SuggestionsResponse = await res.json();
      console.log('Full suggestions response:', data);
      if (data && Array.isArray(data.suggestions)) {
        console.log('data.suggestions:', data.suggestions);
      } else {
        console.log('data.suggestions is not an array:', data.suggestions);
      }
      if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else if (data.success && Array.isArray(data.suggestions) && data.suggestions.length === 0) {
        setError('No suggestions found.');
      } else {
        setError((data && data.error) || 'Failed to fetch suggestions');
      }
    } catch (err) {
      setError('Failed to fetch suggestions');
      console.log('SuggestionsBox fetch error:', err);
    }
    setLoading(false);
  };

  if (collapsed) {
    return (
      <button
        aria-label="Expand suggestions box"
        onClick={() => setCollapsed(false)}
        style={{
          background: '#6366F1',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 44,
          height: 44,
          fontSize: 22,
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(99,102,241,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          margin: 0,
        }}
      >
        ⬅️
      </button>
    );
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.98)',
      border: '1.5px solid #6366F1',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(60,60,120,0.15)',
      padding: 16,
      margin: 0,
      maxWidth: 300,
      minWidth: 220,
      fontFamily: 'Inter, sans-serif',
      color: '#222',
      position: 'relative',
      transition: 'all 0.2s',
    }}>
      <button
        aria-label="Collapse suggestions box"
        onClick={() => setCollapsed(true)}
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          background: '#e0e7ff',
          color: '#6366F1',
          border: 'none',
          borderRadius: 8,
          width: 24,
          height: 24,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        ✖
      </button>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#6366F1', marginRight: 6 }}>✨</span>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>AI Suggestions</h3>
      </div>
      <button
        onClick={fetchSuggestions}
        disabled={loading}
        style={{
          background: '#6366F1',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '6px 12px',
          fontWeight: 500,
          fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 10,
          boxShadow: loading ? 'none' : '0 2px 8px rgba(99,102,241,0.12)',
          transition: 'background 0.2s',
        }}
      >
        {loading ? 'Loading...' : 'Get Suggestions'}
      </button>
      {error && <div style={{ color: '#dc2626', marginBottom: 8, fontWeight: 500 }}>{error}</div>}
      <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 0 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {suggestions.length > 0 && suggestions.map((s, i) => (
            <li key={i} style={{
              marginBottom: 10,
              background: '#f3f4f6',
              borderRadius: 8,
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px rgba(99,102,241,0.07)',
            }}>
              <span style={{ fontSize: 13 }}>{s}</span>
              <button
                style={{
                  marginLeft: 8,
                  background: '#6366F1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontWeight: 500,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(99,102,241,0.10)',
                  transition: 'background 0.2s',
                }}
                onClick={() => onSuggestion(s)}
              >
                Add to Canvas
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
