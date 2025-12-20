import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion } from 'framer-motion';

const NetworkTopology = ({ active }) => {
    const graphRef = useRef();
    const [dimensions, setDimensions] = useState({ w: 800, h: 400 });

    // Initial Graph Data
    const [graphData, setGraphData] = useState({
        nodes: [
            { id: 'User', group: 1, val: 10 },
            { id: 'Creative Thinker', group: 2, val: 5 },
            { id: 'Logical Analyst', group: 2, val: 5 },
            { id: 'Ethical Guardian', group: 2, val: 5 },
            { id: 'Synthesizer', group: 3, val: 15 },
        ],
        links: []
    });

    useEffect(() => {
        // Determine dimensions based on container (simplified for now)
        const handleResize = () => {
            const container = document.getElementById('topology-container');
            if (container) {
                setDimensions({ w: container.clientWidth, h: 400 });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (active) {
            // Animation sequence: User -> Experts -> Synthesizer
            const timeout1 = setTimeout(() => {
                setGraphData(prev => ({
                    ...prev,
                    links: [
                        { source: 'User', target: 'Creative Thinker' },
                        { source: 'User', target: 'Logical Analyst' },
                        { source: 'User', target: 'Ethical Guardian' },
                    ]
                }));
            }, 500);

            const timeout2 = setTimeout(() => {
                setGraphData(prev => ({
                    ...prev,
                    links: [
                        ...prev.links,
                        { source: 'Creative Thinker', target: 'Synthesizer' },
                        { source: 'Logical Analyst', target: 'Synthesizer' },
                        { source: 'Ethical Guardian', target: 'Synthesizer' },
                    ]
                }));
            }, 3000); // Simulate processing time

            return () => {
                clearTimeout(timeout1);
                clearTimeout(timeout2);
            }
        } else {
            // Reset links when not active/loading
            setGraphData(prev => ({ ...prev, links: [] }));
        }
    }, [active]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            id="topology-container"
            style={{
                background: '#111',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
        >
            <ForceGraph2D
                ref={graphRef}
                width={dimensions.w}
                height={dimensions.h}
                graphData={graphData}
                nodeLabel="id"
                nodeAutoColorBy="group"
                linkDirectionalParticles={active ? 2 : 0}
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="#0a0a0a"
                cooldownTicks={100}
                onEngineStop={() => graphRef.current.zoomToFit(400)}
            />
        </motion.div>
    );
};

export default NetworkTopology;
