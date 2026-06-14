'use client';

import { useEffect, useCallback } from 'react';
import { useAccessibilityV2 } from '@/context/AccessibilityContextV2';

/**
 * PDFExportManager - Export page as accessible PDF
 * Applies accessibility settings to page before exporting
 * - Simplified layout
 * - High contrast
 * - Larger text
 * - Removes decorative elements
 * 
 * Uses browser's print-to-PDF functionality
 */

export default function PDFExportManager() {
  const a11y = useAccessibilityV2();

  // Apply PDF-friendly styles when PDF mode is active
  useEffect(() => {
    if (!a11y.pdfMode) {
      return;
    }

    // Add PDF-specific styles
    const style = document.createElement('style');
    style.id = 'a11y-pdf-mode';
    style.textContent = `
      /* PDF Export Mode Styles */
      @media print, screen {
        /* Remove unnecessary elements */
        nav, header, footer, aside, 
        .advertisement, .sidebar, .social-share,
        button:not(.print-keep), 
        [role="navigation"]:not(.print-keep),
        [role="banner"]:not(.print-keep),
        [role="contentinfo"]:not(.print-keep) {
          display: none !important;
        }

        /* Simplify layout */
        body {
          background: white !important;
          color: black !important;
          font-family: Arial, sans-serif !important;
          font-size: 14pt !important;
          line-height: 1.8 !important;
          margin: 0 !important;
          padding: 20px !important;
        }

        /* Make main content full width */
        main, article, [role="main"] {
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* Typography */
        h1 {
          font-size: 24pt !important;
          font-weight: bold !important;
          margin: 20px 0 10px 0 !important;
          page-break-after: avoid !important;
        }

        h2 {
          font-size: 20pt !important;
          font-weight: bold !important;
          margin: 16px 0 8px 0 !important;
          page-break-after: avoid !important;
        }

        h3 {
          font-size: 16pt !important;
          font-weight: bold !important;
          margin: 14px 0 7px 0 !important;
          page-break-after: avoid !important;
        }

        h4, h5, h6 {
          font-size: 14pt !important;
          font-weight: bold !important;
          margin: 12px 0 6px 0 !important;
          page-break-after: avoid !important;
        }

        p {
          margin: 8px 0 !important;
          page-break-inside: avoid !important;
        }

        /* Lists */
        ul, ol {
          margin: 8px 0 !important;
          padding-left: 30px !important;
        }

        li {
          margin: 4px 0 !important;
          page-break-inside: avoid !important;
        }

        /* Links */
        a {
          color: #0066cc !important;
          text-decoration: underline !important;
        }

        a[href]:after {
          content: " (" attr(href) ")" !important;
          font-size: 10pt !important;
          color: #666 !important;
        }

        /* Images */
        img {
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid !important;
          border: 1px solid #ddd !important;
        }

        img[alt]:after {
          content: "Alt: " attr(alt) !important;
          display: block !important;
          font-size: 10pt !important;
          color: #666 !important;
          font-style: italic !important;
          margin-top: 4px !important;
        }

        /* Tables */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          page-break-inside: avoid !important;
          margin: 12px 0 !important;
        }

        th, td {
          border: 1px solid #333 !important;
          padding: 8px !important;
          text-align: left !important;
        }

        th {
          background: #f0f0f0 !important;
          font-weight: bold !important;
        }

        /* Remove animations and decorations */
        * {
          animation: none !important;
          transition: none !important;
          box-shadow: none !important;
          text-shadow: none !important;
          background-image: none !important;
        }

        /* Page breaks */
        .page-break {
          page-break-after: always !important;
        }

        /* High contrast mode for PDF */
        ${a11y.highContrast ? `
          body {
            background: black !important;
            color: yellow !important;
          }
          
          h1, h2, h3, h4, h5, h6 {
            color: yellow !important;
          }
          
          a {
            color: cyan !important;
          }
          
          table th {
            background: #333 !important;
            color: yellow !important;
          }
          
          table td {
            background: black !important;
            color: yellow !important;
          }
        ` : ''}

        /* Accessibility widget - keep visible for instructions */
        [data-accessibility-widget] {
          display: none !important;
        }
      }

      /* Print-specific */
      @media print {
        @page {
          size: A4;
          margin: 2cm;
        }

        body {
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('a11y-pdf-mode');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [a11y.pdfMode, a11y.highContrast]);

  const exportToPDF = useCallback(() => {
    // Prepare document for PDF export
    const originalTitle = document.title;
    document.title = `${originalTitle} - Accessible Export`;

    // Add PDF metadata
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Accessible PDF export generated with accessibility settings applied';
    document.head.appendChild(meta);

    // Trigger browser print dialog
    setTimeout(() => {
      window.print();
      
      // Cleanup
      document.title = originalTitle;
      meta.remove();
    }, 500);
  }, []);

  // Listen for export command (Ctrl+P when PDF mode is active)
  useEffect(() => {
    if (!a11y.pdfMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        exportToPDF();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [a11y.pdfMode, exportToPDF]);

  if (!a11y.pdfMode) {
    return null;
  }

  return (
    <>
      {/* PDF Mode Indicator */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(156, 39, 176, 0.95)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 9997,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minWidth: '250px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <span>PDF Export Mode Active</span>
        </div>
        
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          Page optimized for accessible PDF export
        </div>

        <button
          onClick={exportToPDF}
          className="print-keep"
          style={{
            background: 'white',
            color: '#9c27b0',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '4px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
          Print/Export (Ctrl+P)
        </button>

        <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
          Tips:
          <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
            <li>Choose &quot;Save as PDF&quot; in print dialog</li>
            <li>Enable background graphics for high contrast</li>
            <li>Use portrait orientation</li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* Ensure PDF mode indicator is hidden when printing */
          [data-pdf-indicator] {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
