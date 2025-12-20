import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HistorySidebar = ({ history, onSelectHistory, collapsed, setCollapsed }) => {
    // const [collapsed, setCollapsed] = useState(false); // Managed by parent now

    return (
        <div className={`history-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <button
                    className="menu-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? "Expand" : "Collapse"}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="#444746" />
                    </svg>
                </button>
                {!collapsed && <span className="sidebar-title">Recent Chats</span>}
            </div>

            <div className="sidebar-content">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {history.length === 0 ? (
                            <div className="no-history">
                                <p>No recent chats</p>
                            </div>
                        ) : (
                            <ul className="history-list">
                                {history.map((item, index) => (
                                    <li key={index} onClick={() => onSelectHistory(item)} className="history-item">
                                        <span className="history-icon">💬</span>
                                        <span className="history-query">{item.query.substring(0, 25)}...</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HistorySidebar;
