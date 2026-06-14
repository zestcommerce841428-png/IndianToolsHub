'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Divider,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState<string>(
    `# Hello Markdown! 👋\n\nIndianToolsHub provides this live editor to format and compile markdown instantly.\n\n## Custom Features\n- Real-time word count & character metrics\n- Interactive copy options\n- Styled code blocks\n\n### Sample Javascript Code\n\`\`\`js\nconst greeting = "Namaste India!";\nconsole.log(greeting);\n\`\`\`\n\nFeel free to clear this input and start typing your own README layout!`
  );
  const [html, setHtml] = useState<string>('');
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Robust client-side markdown compiler (supports heading levels, lists, quotes, inline code, blocks, tables)
  const compileMarkdownToHtml = (md: string) => {
    let clean = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Fenced code blocks
    clean = clean.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre style="background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: monospace; overflow-x: auto; margin: 12px 0;"><code class="language-$1">$2</code></pre>'
    );

    // 2. Inline code
    clean = clean.replace(
      /`([^`]+)`/g,
      '<code style="background: rgba(148,163,184,0.15); padding: 3px 6px; border-radius: 4px; font-family: monospace;">$1</code>'
    );

    // 3. Headings
    clean = clean.replace(/^###### (.+)$/gm, '<h6 style="margin: 12px 0 6px; font-weight: 700; font-size: 1rem;">$1</h6>');
    clean = clean.replace(/^##### (.+)$/gm, '<h5 style="margin: 14px 0 6px; font-weight: 700; font-size: 1.1rem;">$1</h5>');
    clean = clean.replace(/^#### (.+)$/gm, '<h4 style="margin: 16px 0 8px; font-weight: 700; font-size: 1.25rem;">$1</h4>');
    clean = clean.replace(/^### (.+)$/gm, '<h3 style="margin: 18px 0 8px; font-weight: 700; font-size: 1.4rem;">$1</h3>');
    clean = clean.replace(/^## (.+)$/gm, '<h2 style="margin: 20px 0 10px; font-weight: 700; font-size: 1.6rem; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 4px;">$1</h2>');
    clean = clean.replace(/^# (.+)$/gm, '<h1 style="margin: 22px 0 12px; font-weight: 800; font-size: 2rem;">$1</h1>');

    // 4. Bold / Italic / Strike
    clean = clean.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    clean = clean.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    clean = clean.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // 5. Blockquotes
    clean = clean.replace(
      /^&gt; (.+)$/gm,
      '<blockquote style="border-left: 4px solid #2563eb; padding-left: 12px; color: #64748b; margin: 12px 0; font-style: italic;">$1</blockquote>'
    );

    // 6. Lists
    clean = clean.replace(/^- (.+)$/gm, '<li>$1</li>');
    clean = clean.replace(/(<li>.*<\/li>\n?)+/g, '<ul style="padding-left: 20px; margin-bottom: 12px;">$&</ul>');

    // 7. Links
    clean = clean.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" style="color: #2563eb; text-decoration: underline;">$1</a>'
    );

    // 8. Paragraphs
    clean = clean.replace(/^(?!<[a-z]).+$/gm, '<p style="margin-bottom: 12px; line-height: 1.7;">$&</p>');
    clean = clean.replace(/<p><\/p>/g, '');

    return clean;
  };

  useEffect(() => {
    setHtml(compileMarkdownToHtml(markdown));
  }, [markdown]);

  // Statistics
  const getWordCount = () => (markdown.trim().match(/\S+/g) || []).length;
  const getCharCount = () => markdown.length;
  const getLineCount = () => (markdown ? markdown.split('\n').length : 0);

  const insertSample = () => {
    setMarkdown(
      `# Markdown Sample Document\n\nThis is a standard template containing basic elements:\n\n## Typography\nText can be **bold**, *italic*, or ~~strikethrough~~.\n\n### Unordered Lists\n- Bullet item A\n- Bullet item B\n- Nested or simple lists\n\n### Quotes\n> "This is a blockquote for emphasizing statements."\n\n### External Link\n[Visit IndianToolsHub](https://zestcommerce841428-png.github.io)`
    );
  };

  const handleCopyMd = () => {
    navigator.clipboard.writeText(markdown);
    setCopiedStatus('Markdown code copied!');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopiedStatus('HTML markup copied!');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleClear = () => {
    setMarkdown('');
    setCopiedStatus(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {copiedStatus && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          {copiedStatus}
        </Alert>
      )}

      {/* Toolbar */}
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ mb: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<InsertDriveFileIcon />} onClick={insertSample}>
          Insert Sample
        </Button>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClear}>
          Clear
        </Button>
        <Button variant="contained" color="secondary" startIcon={<CodeIcon />} onClick={handleCopyHtml}>
          Copy HTML
        </Button>
        <Button variant="contained" color="primary" startIcon={<ContentCopyIcon />} onClick={handleCopyMd}>
          Copy Markdown
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Editor */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Markdown Input
          </Typography>
          <TextField
            multiline
            rows={14}
            fullWidth
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
            variant="outlined"
            slotProps={{
              input: {
                style: { fontFamily: 'monospace', fontSize: '0.9rem' },
              },
            }}
          />
          {/* Stats footer */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Words: {getWordCount()} &bull; Characters: {getCharCount()} &bull; Lines: {getLineCount()}
          </Typography>
        </Grid>

        {/* Live Preview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Live Preview
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              height: 'calc(100% - 28px)',
              minHeight: 320,
              bgcolor: 'background.paper',
              borderRadius: 2,
              overflow: 'auto',
              maxHeight: 330,
            }}
          >
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
