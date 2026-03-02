import React from 'react';
import { motion } from 'framer-motion';
import { useTelegram } from './useTelegram';

const tabs = [
  { id: 'home',     icon: '🏠', label: 'Bosh' },
  { id: 'products', icon: '📦', label: 'Mahsulotlar' },
  { id: 'search',   icon: '🔍', label: 'Qidiruv' },
  { id: 'profile',  icon: '👤', label: 'Profil' },
];

export default function TMABottomNav({ activeTab, onTabChange }) {
  const { haptic } = useTelegram();

  const handleTab = (id) => {
    haptic.selection();
    onTabChange(id);
  };

  return (
    <div className="tma-bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tma-bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => handleTab(tab.id)}
        >
          <motion.span
            className="tma-bottom-nav-icon"
            animate={{ scale: activeTab === tab.id ? 1.15 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {tab.icon}
          </motion.span>
          <span className="tma-bottom-nav-label">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              style={{
                position: 'absolute',
                bottom: -1,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--accent)',
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
