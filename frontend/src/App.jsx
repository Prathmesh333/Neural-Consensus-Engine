import { useState, useEffect } from 'react'
import './index.css'
import HistorySidebar from './components/HistorySidebar'
import SettingsPanel from './components/SettingsPanel'
import ProcessGraph from './components/ProcessGraph'
import ConsensusMetrics from './components/ConsensusMetrics'
import AgentConfigPanel from './components/AgentConfigPanel'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [query, setQuery] = useState('')
  const [context, setContext] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [settings, setSettings] = useState({
    output_format: 'Standard',
    temperature: 0.7,
    criteria: 'Relevance, Accuracy, Clarity',
    tone: 'Neutral',
    length: 'Standard',
    target_audience: 'General',
    expert_weights: {
      'The Skeptic': 1.0,
      'The Creative': 1.0,
      'The Fact-Checker': 1.0
    }
  })

  // Interactive Agent Config State
  const [activeNode, setActiveNode] = useState(null);
  const [expertConfigs, setExpertConfigs] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('consensus_history')
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Save history when updated
  useEffect(() => {
    localStorage.setItem('consensus_history', JSON.stringify(history))
  }, [history])

  const handleGenerate = async () => {
    if (!query) return
    setLoading(true)
    setResult(null)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBaseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context,
          output_format: settings.output_format,
          temperature: parseFloat(settings.temperature),
          criteria: settings.criteria,
          tone: settings.tone,
          length: settings.length,
          target_audience: settings.target_audience,
          expert_weights: settings.expert_weights,
          expert_configs: expertConfigs
        }),
      })
      const data = await response.json()
      setResult(data)

      // Add to history
      const newHistoryItem = {
        query,
        context,
        result: data,
        settings: { ...settings },
        timestamp: new Date().toISOString()
      }
      setHistory(prev => [newHistoryItem, ...prev])

    } catch (error) {
      console.error("Error generating consensus:", error)
      alert("Failed to generate response. Check backend connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectHistory = (item) => {
    setQuery(item.query)
    setContext(item.context || '')
    setResult(item.result)
    setSettings(item.settings)
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleGenerate();
    }
  }

  const handleNodeClick = (event, node) => {
    // Only allow configuration for Experts
    if (node.id.includes('Expert')) {
      setActiveNode(node.id);
    }
  };

  const handleConfigUpdate = (agentName, field, value) => {
    setExpertConfigs(prev => ({
      ...prev,
      [agentName]: {
        ...prev[agentName],
        [field]: value
      }
    }));
  };

  return (
    <>
      <HistorySidebar
        history={history}
        onSelectHistory={handleSelectHistory}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className="main-content" style={{
        marginLeft: sidebarCollapsed ? '80px' : '280px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '2rem',
        width: 'auto'
      }}>
        <header className="header" style={{ position: 'relative' }}>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <h1>Neural Consensus Engine</h1>
          <p>Agentic Mixture-of-Experts System</p>
        </header>

        <div className="input-card full-width-input" style={{ maxWidth: '1400px', margin: '0 auto 2rem auto' }}>
          <h3>Research Query</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Query / Research Question</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="E.g., Does the theory of Quantum Consciousness have merit?"
                rows={4}
                className="query-input"
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Context / Bio / Abstract (Optional)</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste relevant context, bio, or abstract here for the agents to analyze..."
                rows={4}
                className="query-input"
                style={{ flex: 1, resize: 'none' }}
              />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="generate-btn" style={{ marginTop: '1rem' }}>
            {loading ? 'Synthesizing Consensus...' : 'Generate Consensus'}
          </button>
        </div>

        <div className="engine-dashboard">
          {/* Left Panel: Configuration */}
          <div className="config-panel">
            <SettingsPanel settings={settings} setSettings={setSettings} />
          </div>

          {/* Right Panel: Cognitive Process Graph */}
          <div className="graph-panel">
            <h3 className="panel-title">
              <span style={{ fontSize: '1.4rem' }}>🕸️</span>
              Cognitive Engine
              <span className="subtitle">(Click nodes to configure)</span>
            </h3>

            <div className="graph-wrapper">
              <ProcessGraph active={loading} onNodeClick={handleNodeClick} />
            </div>

            <AnimatePresence>
              {activeNode && (
                <AgentConfigPanel
                  agentName={activeNode}
                  config={expertConfigs[activeNode] || {}}
                  onClose={() => setActiveNode(null)}
                  onUpdate={handleConfigUpdate}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="results-section"
          >
            {/* Hallucination Risk Badge */}
            {result.hallucination_risk && (
              <div style={{
                background: result.hallucination_risk === 'High' ? '#ffebee' : result.hallucination_risk === 'Medium' ? '#fff3e0' : '#e8f5e9',
                color: result.hallucination_risk === 'High' ? '#c62828' : result.hallucination_risk === 'Medium' ? '#e65100' : '#2e7d32',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: `2px solid ${result.hallucination_risk === 'High' ? '#ef5350' : result.hallucination_risk === 'Medium' ? '#ff9800' : '#66bb6a'}`,
                fontWeight: '600',
                textAlign: 'center',
                fontSize: '1.05rem'
              }}>
                🔍 Hallucination Risk Assessment: <strong>{result.hallucination_risk}</strong>
              </div>
            )}

            <div className="consensus-card">
              <h2>🏆 Final Consensus</h2>
              <div className="consensus-content">
                {result.consensus.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            {/* Epistemic Integrity Breakdown */}
            <div className="breakdown-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '12px', color: '#1b5e20', border: '1px solid #c8e6c9' }}>
                <h3 style={{ marginTop: 0 }}>✅ Verified Facts (2+ Sources)</h3>
                <ul>
                  {result.verified_facts && result.verified_facts.length > 0 ? (
                    result.verified_facts.map((point, i) => <li key={i}>{point}</li>)
                  ) : (<li>No verified facts extracted.</li>)}
                </ul>
              </div>
              <div style={{ background: '#ffebee', padding: '1rem', borderRadius: '12px', color: '#c62828', border: '1px solid #ef9a9a' }}>
                <h3 style={{ marginTop: 0 }}>🚨 Unverified Claims (1 Source)</h3>
                <ul>
                  {result.unverified_claims && result.unverified_claims.length > 0 ? (
                    result.unverified_claims.map((point, i) => <li key={i}>{point}</li>)
                  ) : (<li>No unverified claims detected.</li>)}
                </ul>
              </div>
              <div style={{ background: '#f1f8e9', padding: '1rem', borderRadius: '12px', color: '#33691e', border: '1px solid #dcedc8' }}>
                <h3 style={{ marginTop: 0 }}>🤝 Agreements</h3>
                <ul>
                  {result.agreements && result.agreements.length > 0 ? (
                    result.agreements.map((point, i) => <li key={i}>{point}</li>)
                  ) : (<li>No specific agreements listed.</li>)}
                </ul>
              </div>
              <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '12px', color: '#e65100', border: '1px solid #ffe0b2' }}>
                <h3 style={{ marginTop: 0 }}>⚠️ Contested Points</h3>
                <ul>
                  {result.disagreements && result.disagreements.length > 0 ? (
                    result.disagreements.map((point, i) => <li key={i}>{point}</li>)
                  ) : (<li>No major disagreements found.</li>)}
                </ul>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {result.reasoning && (
                <div className="reasoning-panel">
                  <h3>🧠 Synthesizer Logic</h3>
                  <p>{result.reasoning}</p>
                </div>
              )}

              <ConsensusMetrics
                reasoning={result.reasoning}
                controversyScore={result.controversy_score}
                confidenceScore={result.confidence_score}
              />
            </div>

            <div className="experts-grid">
              {Object.entries(result.expert_responses).map(([expert, response]) => (
                <div key={expert} className="expert-card">
                  <h3>{expert}</h3>
                  <div className="expert-content">
                    {response.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}

export default App
