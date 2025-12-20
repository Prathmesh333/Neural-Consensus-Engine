import React from 'react';
import { motion } from 'framer-motion';

const AgentConfigPanel = ({ agentName, config, onClose, onUpdate }) => {
    if (!agentName) return null;

    const handleChange = (field, value) => {
        onUpdate(agentName, field, value);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 999,
                    backdropFilter: 'blur(4px)'
                }}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    width: '500px',
                    maxWidth: '90%',
                    maxHeight: '85vh',
                    background: 'var(--bg-element)',
                    color: 'var(--text-main)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    padding: '2rem',
                    borderRadius: '16px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-subtle)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-color)' }}>{agentName}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div className="config-section" style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Temperature (Creativity)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                            type="range"
                            min="0"
                            max="1.0"
                            step="0.1"
                            value={config.temperature !== undefined ? config.temperature : 0.7}
                            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <span>{config.temperature !== undefined ? config.temperature : 0.7}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                        Higher values make the agent more creative but potentially less factual.
                    </p>
                </div>

                <div className="config-section" style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Top-K (Diversity)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                            type="range"
                            min="1"
                            max="40"
                            step="1"
                            value={config.top_k !== undefined ? config.top_k : 40}
                            onChange={(e) => handleChange('top_k', parseInt(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <span>{config.top_k !== undefined ? config.top_k : 40}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                        Lower values (e.g., 1) = deterministic responses. Higher values = more diverse outputs.
                    </p>
                </div>

                <div className="config-section">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Instructions Override</label>
                    <textarea
                        rows={10}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            resize: 'vertical',
                            background: 'var(--bg-app)',
                            color: 'var(--text-main)'
                        }}
                        placeholder="Enter specific system instructions for this agent..."
                        value={config.instructions || ''}
                        onChange={(e) => handleChange('instructions', e.target.value)}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                        Override the default persona instructions for this specific run.
                    </p>
                </div>
            </motion.div>
        </>
    );
};

export default AgentConfigPanel;
