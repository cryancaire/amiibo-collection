import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const Navigation = () => {
  const { colors } = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const navItems = [
    { path: '/', label: 'Dashboard', shortLabel: 'Dashboard', icon: '🏠' },
    { path: '/browse', label: 'Browse Amiibos', shortLabel: 'Browse', icon: '🔍' },
    { path: '/collection', label: 'My Collection', shortLabel: 'Collection', icon: '📦' },
    { path: '/wishlist', label: 'Wishlist', shortLabel: 'Wishlist', icon: '⭐' }
  ];

  return (
    <nav>
      {/* Hide navigation title on mobile to save space */}
      {!isMobile && (
        <h2 
          style={{ 
            color: colors.text.primary,
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px'
          }}
        >
          Navigation
        </h2>
      )}
      
      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0,
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        gap: isMobile ? '4px' : '8px',
        justifyContent: isMobile ? 'space-around' : 'flex-start'
      }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path} style={{ 
              marginBottom: isMobile ? 0 : '8px',
              flex: isMobile ? 1 : 'none'
            }}>
              <Link
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '4px' : '12px',
                  padding: isMobile ? '8px 4px' : '12px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: colors.text.primary,
                  backgroundColor: 'transparent',
                  border: isActive ? `2px solid #10b981` : `1px solid transparent`,
                  transition: 'all 0.2s ease',
                  fontSize: isMobile ? '11px' : '14px',
                  fontWeight: isActive ? '500' : '400',
                  textAlign: isMobile ? 'center' : 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = colors.background;
                    e.target.style.borderColor = colors.border;
                    e.target.style.color = colors.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.color = colors.text.primary;
                  }
                }}
              >
                <span style={{ 
                  fontSize: isMobile ? '14px' : '16px',
                  color: 'inherit'
                }}>
                  {item.icon}
                </span>
                <span style={{ color: 'inherit' }}>
                  {isMobile ? item.shortLabel : item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};