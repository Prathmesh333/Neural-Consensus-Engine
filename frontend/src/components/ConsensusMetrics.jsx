import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const ConsensusMetrics = ({ reasoning, controversyScore = 0, confidenceScore = 0 }) => {
    // Synthesize metrics from reasoning length/complexity (mock logic where scores are missing)
    const calculateMetrics = (text) => {
        if (!text) return [];
        // Extract mock values from text analysis or use randomized base values guided by the text content
        const creativity = text.includes("creative") || text.includes("novel") || text.includes("theory") ? 90 : 60;
        const logic = text.includes("logic") || text.includes("evidence") || text.includes("flaw") ? 95 : 70;
        const safety = text.includes("safety") || text.includes("risk") || text.includes("clear") ? 85 : 75;

        return [
            { subject: 'Logic (Skeptic)', A: logic, fullMark: 100 },
            { subject: 'Creativity (Visionary)', A: creativity, fullMark: 100 },
            { subject: 'Safety (Mediator)', A: safety, fullMark: 100 },
        ];
    };

    const data = calculateMetrics(reasoning);

    // Color interpolation for controversy (Green -> Red)
    const controversyColor = controversyScore > 7 ? '#d32f2f' : controversyScore > 4 ? '#f57c00' : '#388e3c';

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ width: '100%', background: '#fff', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
            <h3 style={{ textAlign: 'center', marginBottom: 0, color: '#333' }}>Consensus Metrics</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Confidence Score */}
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Confidence</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
                        {Math.round(confidenceScore)}%
                    </div>
                    <div style={{ width: '100%', background: '#e0e0e0', height: '6px', borderRadius: '3px', marginTop: '0.5rem' }}>
                        <div style={{ width: `${confidenceScore}%`, background: '#1976d2', height: '100%', borderRadius: '3px' }} />
                    </div>
                </div>

                {/* Controversy Score */}
                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Controversy</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: controversyColor }}>
                        {controversyScore}/10
                    </div>
                    <div style={{ width: '100%', background: '#e0e0e0', height: '6px', borderRadius: '3px', marginTop: '0.5rem' }}>
                        <div style={{ width: `${(controversyScore / 10) * 100}%`, background: controversyColor, height: '100%', borderRadius: '3px' }} />
                    </div>
                </div>
            </div>

            <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e0e0e0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Consensus"
                            dataKey="A"
                            stroke="#8884d8"
                            strokeWidth={3}
                            fill="#8884d8"
                            fillOpacity={0.5}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ConsensusMetrics;
