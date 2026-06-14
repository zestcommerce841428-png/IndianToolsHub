'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface NativeToolWrapperProps {
  filename: string;
}

export default function NativeToolWrapper({ filename }: NativeToolWrapperProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production';
    const basePath = isProd ? '/IndianToolsHub' : '';
    
    fetch(`${basePath}/${filename}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load tool assets');
        return res.text();
      })
      .then(data => {
        setHtml(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [filename]);

  useEffect(() => {
    if (!html || !containerRef.current) return;

    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract body content and wrap it
    const bodyHtml = doc.body.innerHTML;
    containerRef.current.innerHTML = `<div class="native-tool-container">${bodyHtml}</div>`;

    // Extract and scope styles
    const styleElements = Array.from(doc.querySelectorAll('style'));
    const linkStyleElements = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    const scopedStyles: HTMLStyleElement[] = [];

    // Simple CSS scoping helper to scope rules to .native-tool-container
    const scopeCSS = (cssText: string) => {
      return cssText
        .replace(/body/g, '.native-tool-container')
        .replace(/html/g, '.native-tool-container')
        .replace(/([^\r\n,{}]+)(?=[^{}]*\{)/g, (match) => {
          if (match.includes('.native-tool-container') || match.trim().startsWith('@') || match.trim().startsWith(':')) {
            return match;
          }
          return `.native-tool-container ${match.trim()}`;
        });
    };

    styleElements.forEach(style => {
      const scopedStyleEl = document.createElement('style');
      scopedStyleEl.innerHTML = scopeCSS(style.innerHTML);
      scopedStyleEl.setAttribute('data-tool-style', 'true');
      document.head.appendChild(scopedStyleEl);
      scopedStyles.push(scopedStyleEl);
    });

    // Copy link stylesheets
    const isProd = process.env.NODE_ENV === 'production';
    const basePath = isProd ? '/IndianToolsHub' : '';
    const linkStyles: HTMLLinkElement[] = [];
    linkStyleElements.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = href.startsWith('http') ? href : `${basePath}/${href}`;
        linkEl.setAttribute('data-tool-style', 'true');
        document.head.appendChild(linkEl);
        linkStyles.push(linkEl);
      }
    });

    // Extract and execute scripts
    const scriptElements = Array.from(doc.querySelectorAll('script'));
    const executedScripts: HTMLScriptElement[] = [];

    const loadScript = (index: number) => {
      if (index >= scriptElements.length) return;
      const script = scriptElements[index];
      
      // Skip inline google analytics scripts or search scripts
      const scriptHtml = script.innerHTML;
      if (scriptHtml.includes('gtag') || scriptHtml.includes('googletagmanager')) {
        loadScript(index + 1);
        return;
      }

      const scriptEl = document.createElement('script');
      const src = script.getAttribute('src');
      if (src) {
        scriptEl.src = src.startsWith('http') ? src : `${basePath}/${src}`;
        scriptEl.onload = () => loadScript(index + 1);
        scriptEl.onerror = () => loadScript(index + 1);
      } else {
        scriptEl.innerHTML = scriptHtml;
        // Run sequentially
        setTimeout(() => loadScript(index + 1), 10);
      }
      scriptEl.setAttribute('data-tool-script', 'true');
      document.body.appendChild(scriptEl);
      executedScripts.push(scriptEl);
    };

    // Start sequential script loading
    loadScript(0);

    return () => {
      // Cleanup styles and scripts on unmount
      scopedStyles.forEach(style => {
        if (style.parentNode) style.parentNode.removeChild(style);
      });
      linkStyles.forEach(link => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
      executedScripts.forEach(script => {
        if (script.parentNode) script.parentNode.removeChild(script);
      });
    };
  }, [html]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return <Box ref={containerRef} sx={{ width: '100%', minHeight: '80vh' }} />;
}
