import React, { useEffect } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Controls,
    Background
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

const initialNodes = [
    { id: 'User', position: { x: 250, y: 0 }, data: { label: 'User Query' }, type: 'input', style: { background: '#333', color: '#fff', border: '1px solid #777' } },
    { id: 'Creative Expert', position: { x: 50, y: 150 }, data: { label: 'Creative Expert' }, style: { background: '#e8f5e9', border: '1px solid #4caf50', width: 120, cursor: 'pointer' } },
    { id: 'Logical Expert', position: { x: 250, y: 150 }, data: { label: 'Logical Expert' }, style: { background: '#e3f2fd', border: '1px solid #2196f3', width: 120, cursor: 'pointer' } },
    { id: 'Ethical Expert', position: { x: 450, y: 150 }, data: { label: 'Ethical Expert' }, style: { background: '#fff3e0', border: '1px solid #ff9800', width: 120, cursor: 'pointer' } },
    { id: 'Synthesizer', position: { x: 250, y: 300 }, data: { label: 'Synthesizer' }, type: 'output', style: { background: '#f3e5f5', border: '1px solid #9c27b0', width: 150, fontWeight: 'bold' } },
];

const initialEdges = [
    { id: 'e1', source: 'User', target: 'Creative Expert', animated: true },
    { id: 'e2', source: 'User', target: 'Logical Expert', animated: true },
    { id: 'e3', source: 'User', target: 'Ethical Expert', animated: true },
    { id: 'e4', source: 'Creative Expert', target: 'Synthesizer', animated: false },
    { id: 'e5', source: 'Logical Expert', target: 'Synthesizer', animated: false },
    { id: 'e6', source: 'Ethical Expert', target: 'Synthesizer', animated: false },
];

const ProcessGraph = ({ active, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        if (active) {
            setEdges((eds) => eds.map((e) => {
                if (e.target === 'Synthesizer') return { ...e, animated: true, style: { stroke: '#9c27b0', strokeWidth: 2 } };
                return { ...e, animated: true, style: { stroke: '#fff', strokeWidth: 2 } };
            }));
        } else {
            setEdges(initialEdges);
        }
    }, [active, setEdges]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ height: '100%', background: 'transparent', width: '100%' }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
            >
                <Background color="#444" gap={16} />
                <Controls />
            </ReactFlow>
        </motion.div>
    );
};

export default ProcessGraph;
