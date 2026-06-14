'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * NavigationManager - Advanced keyboard navigation for accessibility
 * Provides navigation by headings, landmarks, lists, tables, and forms
 * 
 * Keyboard Shortcuts:
 * - H: Next heading
 * - Shift+H: Previous heading
 * - 1-6: Next heading of that level (e.g., 2 for H2)
 * - L: Next landmark
 * - Shift+L: Previous landmark
 * - T: Next table
 * - Shift+T: Previous table
 * - F: Next form/input
 * - Shift+F: Previous form/input
 * - M: Next list
 * - Shift+M: Previous list
 */

interface NavigationItem {
  element: Element;
  type: string;
  label: string;
}

export default function NavigationManager() {
  const a11y = useAccessibilityV2();
  const [currentFocus, setCurrentFocus] = useState<Element | null>(null);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [showNavHUD, setShowNavHUD] = useState(false);
  const [hudMessage, setHudMessage] = useState('');

  const scrollToElement = useCallback((element: Element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add focus indicator
    (element as HTMLElement).focus({ preventScroll: true });
    
    // Add temporary highlight
    element.classList.add('a11y-nav-highlight');
    setTimeout(() => {
      element.classList.remove('a11y-nav-highlight');
    }, 2000);
  }, []);

  const showHUDMessage = useCallback((message: string) => {
    setHudMessage(message);
    setShowNavHUD(true);
    setTimeout(() => setShowNavHUD(false), 2000);
  }, []);

  // Collect all navigable elements on page
  const collectNavigationItems = useCallback(() => {
    const items: NavigationItem[] = [];

    // Headings
    if (a11y.headingNavigation) {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(h => {
        items.push({
          element: h,
          type: 'heading',
          label: `${h.tagName}: ${h.textContent?.substring(0, 50) || ''}`,
        });
      });
    }

    // Landmarks (ARIA roles and semantic HTML)
    if (a11y.landmarkNavigation) {
      const landmarks = document.querySelectorAll(
        '[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], [role="search"], [role="form"], header, nav, main, aside, footer'
      );
      landmarks.forEach(l => {
        const role = l.getAttribute('role') || l.tagName.toLowerCase();
        const ariaLabel = l.getAttribute('aria-label');
        items.push({
          element: l,
          type: 'landmark',
          label: `${role}${ariaLabel ? ': ' + ariaLabel : ''}`,
        });
      });
    }

    // Tables
    if (a11y.tableNavigation) {
      const tables = document.querySelectorAll('table');
      tables.forEach((t, i) => {
        const caption = t.querySelector('caption')?.textContent;
        items.push({
          element: t,
          type: 'table',
          label: `Table ${i + 1}${caption ? ': ' + caption : ''}`,
        });
      });
    }

    // Forms and inputs
    if (a11y.formNavigation) {
      const formElements = document.querySelectorAll('input, textarea, select, button[type="submit"]');
      formElements.forEach(f => {
        const label = f.getAttribute('aria-label') || 
                     f.getAttribute('placeholder') ||
                     (f as HTMLInputElement).name ||
                     f.id;
        items.push({
          element: f,
          type: 'form',
          label: `${f.tagName}: ${label || 'Unlabeled'}`,
        });
      });
    }

    // Lists
    if (a11y.listNavigation) {
      const lists = document.querySelectorAll('ul, ol, dl');
      lists.forEach((l, i) => {
        items.push({
          element: l,
          type: 'list',
          label: `${l.tagName} with ${l.children.length} items`,
        });
      });
    }

    setNavigationItems(items);
  }, [a11y.headingNavigation, a11y.landmarkNavigation, a11y.tableNavigation, a11y.formNavigation, a11y.listNavigation]);

  // Navigate to next/previous element of specific type
  const navigateToElement = useCallback((type: string, direction: 'next' | 'previous', level?: number) => {
    const filtered = navigationItems.filter(item => {
      if (item.type !== type) return false;
      if (type === 'heading' && level) {
        return item.element.tagName === `H${level}`;
      }
      return true;
    });

    if (filtered.length === 0) {
      showHUDMessage(`No ${type}s found`);
      return;
    }

    let targetIndex = -1;

    if (!currentFocus) {
      targetIndex = direction === 'next' ? 0 : filtered.length - 1;
    } else {
      const currentIndex = filtered.findIndex(item => item.element === currentFocus);
      
      if (currentIndex === -1) {
        // Current focus not in filtered list, find closest
        const currentRect = currentFocus.getBoundingClientRect();
        targetIndex = filtered.findIndex(item => {
          const rect = item.element.getBoundingClientRect();
          return direction === 'next' ? rect.top > currentRect.top : rect.top < currentRect.top;
        });
        
        if (targetIndex === -1) {
          targetIndex = direction === 'next' ? 0 : filtered.length - 1;
        }
      } else {
        // Navigate from current position
        if (direction === 'next') {
          targetIndex = (currentIndex + 1) % filtered.length;
        } else {
          targetIndex = (currentIndex - 1 + filtered.length) % filtered.length;
        }
      }
    }

    const target = filtered[targetIndex];
    if (target) {
      scrollToElement(target.element);
      setCurrentFocus(target.element);
      showHUDMessage(`${target.label} (${targetIndex + 1}/${filtered.length})`);
    }
  }, [navigationItems, currentFocus, scrollToElement, showHUDMessage]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle if keyboard navigation is enabled
    if (!a11y.keyboardNavigation) return;

    // Don't interfere with form inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return;
    }

    const shift = e.shiftKey;
    const key = e.key.toLowerCase();

    // Heading navigation
    if (key === 'h' && a11y.headingNavigation) {
      e.preventDefault();
      navigateToElement('heading', shift ? 'previous' : 'next');
      return;
    }

    // Heading level navigation (1-6)
    if (['1', '2', '3', '4', '5', '6'].includes(key) && a11y.headingNavigation) {
      e.preventDefault();
      navigateToElement('heading', shift ? 'previous' : 'next', parseInt(key));
      return;
    }

    // Landmark navigation
    if (key === 'l' && a11y.landmarkNavigation) {
      e.preventDefault();
      navigateToElement('landmark', shift ? 'previous' : 'next');
      return;
    }

    // Table navigation
    if (key === 't' && a11y.tableNavigation) {
      e.preventDefault();
      navigateToElement('table', shift ? 'previous' : 'next');
      return;
    }

    // Form navigation
    if (key === 'f' && a11y.formNavigation) {
      e.preventDefault();
      navigateToElement('form', shift ? 'previous' : 'next');
      return;
    }

    // List navigation
    if (key === 'm' && a11y.listNavigation) {
      e.preventDefault();
      navigateToElement('list', shift ? 'previous' : 'next');
      return;
    }
  }, [a11y.keyboardNavigation, a11y.headingNavigation, a11y.landmarkNavigation, a11y.tableNavigation, a11y.formNavigation, a11y.listNavigation, navigateToElement]);

  // Setup keyboard listeners
  useEffect(() => {
    if (!a11y.keyboardNavigation) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [a11y.keyboardNavigation, handleKeyDown]);

  // Collect navigation items on mount and when settings change
  useEffect(() => {
    // Initial collection
    const timer = setTimeout(() => {
      collectNavigationItems();
    }, 0);
    
    // Re-collect on DOM changes
    const observer = new MutationObserver(() => {
      collectNavigationItems();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [collectNavigationItems]);

  // Show page structure view
  const renderPageStructureView = () => {
    if (!a11y.pageStructureView) return null;

    const headings = navigationItems.filter(item => item.type === 'heading');
    const landmarks = navigationItems.filter(item => item.type === 'landmark');

    return (
      <div
        style={{
          position: 'fixed',
          right: '20px',
          top: '80px',
          width: '300px',
          maxHeight: '600px',
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #1976d2',
          borderRadius: '8px',
          padding: '16px',
          zIndex: 9996,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          fontSize: '14px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>
          Page Structure
        </h3>

        {headings.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
              Headings ({headings.length})
            </h4>
            {headings.map((item, i) => {
              const level = parseInt(item.element.tagName.substring(1));
              return (
                <div
                  key={i}
                  onClick={() => scrollToElement(item.element)}
                  style={{
                    paddingLeft: `${(level - 1) * 12}px`,
                    padding: '4px',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${level === 1 ? '#e91e63' : level === 2 ? '#9c27b0' : '#3f51b5'}`,
                    marginLeft: `${(level - 1) * 8}px`,
                    marginBottom: '4px',
                    fontSize: '12px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        )}

        {landmarks.length > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
              Landmarks ({landmarks.length})
            </h4>
            {landmarks.map((item, i) => (
              <div
                key={i}
                onClick={() => scrollToElement(item.element)}
                style={{
                  padding: '4px',
                  cursor: 'pointer',
                  borderLeft: '3px solid #4caf50',
                  marginBottom: '4px',
                  fontSize: '12px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Show navigation HUD
  const renderNavigationHUD = () => {
    if (!showNavHUD && !a11y.keyboardNavHUD) return null;

    return (
      <>
        {/* Keyboard shortcuts help */}
        {a11y.keyboardNavHUD && (
          <div
            style={{
              position: 'fixed',
              left: '20px',
              bottom: '20px',
              background: 'rgba(0, 0, 0, 0.85)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              zIndex: 9996,
              maxWidth: '250px',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>Navigation Keys</div>
            {a11y.headingNavigation && <div>H / Shift+H: Headings</div>}
            {a11y.landmarkNavigation && <div>L / Shift+L: Landmarks</div>}
            {a11y.tableNavigation && <div>T / Shift+T: Tables</div>}
            {a11y.formNavigation && <div>F / Shift+F: Forms</div>}
            {a11y.listNavigation && <div>M / Shift+M: Lists</div>}
          </div>
        )}

        {/* Navigation message */}
        {showNavHUD && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(25, 118, 210, 0.95)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              zIndex: 9999,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              minWidth: '300px',
              textAlign: 'center',
            }}
          >
            {hudMessage}
          </div>
        )}
      </>
    );
  };

  if (!a11y.keyboardNavigation && !a11y.pageStructureView) {
    return null;
  }

  return (
    <>
      {renderPageStructureView()}
      {renderNavigationHUD()}
      
      {/* Navigation highlight CSS */}
      <style jsx global>{`
        .a11y-nav-highlight {
          outline: 3px solid #ff9800 !important;
          outline-offset: 2px !important;
          background: rgba(255, 152, 0, 0.1) !important;
          animation: a11y-highlight-pulse 2s ease;
        }

        @keyframes a11y-highlight-pulse {
          0%, 100% { outline-color: #ff9800; }
          50% { outline-color: #f44336; }
        }
      `}</style>
    </>
  );
}
