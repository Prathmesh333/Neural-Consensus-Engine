import React from 'react';

const SettingsPanel = ({ settings, setSettings }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="settings-panel">
            <h3>⚙️ Configuration</h3>

            <div className="settings-grid">
                <div className="setting-group">
                    <label>Output Format</label>
                    <select name="output_format" value={settings.output_format} onChange={handleChange}>
                        <option value="Standard">Standard</option>
                        <option value="Bullet Points">Bullet Points</option>
                        <option value="Essay">Essay</option>
                        <option value="Email">Email</option>
                        <option value="Technical Report">Technical Report</option>
                        <option value="ELI5">Explain like I'm 5</option>
                    </select>
                </div>

                <div className="setting-group">
                    <label>Tone</label>
                    <select name="tone" value={settings.tone} onChange={handleChange}>
                        <option value="Neutral">Neutral</option>
                        <option value="Formal">Formal</option>
                        <option value="Casual">Casual</option>
                        <option value="Empathetic">Empathetic</option>
                        <option value="Authoritative">Authoritative</option>
                        <option value="Humorous">Humorous</option>
                    </select>
                </div>

                <div className="setting-group">
                    <label>Length</label>
                    <select name="length" value={settings.length} onChange={handleChange}>
                        <option value="Standard">Standard</option>
                        <option value="Concise">Concise</option>
                        <option value="Detailed">Detailed</option>
                        <option value="Comprehensive">Comprehensive</option>
                    </select>
                </div>

                <div className="setting-group">
                    <label>Target Audience</label>
                    <select name="target_audience" value={settings.target_audience} onChange={handleChange}>
                        <option value="General">General Public</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Professional">Professional</option>
                        <option value="Expert">Expert</option>
                        <option value="Child">Child</option>
                    </select>
                </div>
            </div>

            <div className="setting-group full-width">
                <label>Creativity (Temperature): {settings.temperature}</label>
                <input
                    type="range"
                    name="temperature"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value={settings.temperature}
                    onChange={handleChange}
                />
                <div className="range-labels">
                    <span>Precise</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                </div>
            </div>

            <div className="setting-group">
                <label>Judgement Criteria:</label>
                <input
                    type="text"
                    name="criteria"
                    value={settings.criteria}
                    onChange={handleChange}
                    placeholder="e.g. Relevance, Accuracy"
                />
            </div>
        </div>
    );
};

export default SettingsPanel;
