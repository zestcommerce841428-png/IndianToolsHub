'use client';

import { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  MenuBook,
  Add,
  Delete,
  Edit,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  PictureAsPdf,
  Download,
  Preview,
  Save,
  Upload,
} from '@mui/icons-material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Link } from '@tiptap/extension-link';
import jsPDF from 'jspdf';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

// Book structure types
type FrontMatterType = 'dedication' | 'epigraph' | 'foreword' | 'preface' | 'acknowledgements';
type BackMatterType = 'epilogue' | 'afterword' | 'appendix' | 'glossary' | 'about';

interface BookMetadata {
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  year: string;
  isbn: string;
  edition: string;
  copyright: string;
}

interface FrontMatter {
  type: FrontMatterType;
  title: string;
  content: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  unitId?: string;
}

interface Unit {
  id: string;
  number: number;
  title: string;
}

interface BackMatter {
  type: BackMatterType;
  title: string;
  content: string;
}

interface Manuscript {
  metadata: BookMetadata;
  coverImage: string | null;
  frontMatter: FrontMatter[];
  units: Unit[];
  chapters: Chapter[];
  backMatter: BackMatter[];
}

const FRONT_MATTER_OPTIONS: { value: FrontMatterType; label: string }[] = [
  { value: 'dedication', label: 'Dedication' },
  { value: 'epigraph', label: 'Epigraph' },
  { value: 'foreword', label: 'Foreword' },
  { value: 'preface', label: 'Preface' },
  { value: 'acknowledgements', label: 'Acknowledgements' },
];

const BACK_MATTER_OPTIONS: { value: BackMatterType; label: string }[] = [
  { value: 'epilogue', label: 'Epilogue' },
  { value: 'afterword', label: 'Afterword' },
  { value: 'appendix', label: 'Appendix' },
  { value: 'glossary', label: 'Glossary' },
  { value: 'about', label: 'About the Author' },
];

export default function AuthorProPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [manuscript, setManuscript] = useState<Manuscript>({
    metadata: {
      title: '',
      subtitle: '',
      author: '',
      publisher: '',
      year: new Date().getFullYear().toString(),
      isbn: '',
      edition: '1st Edition',
      copyright: '',
    },
    coverImage: null,
    frontMatter: [],
    units: [],
    chapters: [],
    backMatter: [],
  });

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentFrontMatter, setCurrentFrontMatter] = useState<FrontMatter | null>(null);
  const [currentBackMatter, setCurrentBackMatter] = useState<BackMatter | null>(null);
  const [editorDialog, setEditorDialog] = useState(false);
  const [editorType, setEditorType] = useState<'chapter' | 'front' | 'back'>('chapter');
  const [previewDialog, setPreviewDialog] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Link,
    ],
    content: '<p>Start writing your manuscript...</p>',
  });

  // Metadata handlers
  const handleMetadataChange = (field: keyof BookMetadata, value: string) => {
    setManuscript(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  // Cover image handler
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManuscript(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Front Matter handlers
  const addFrontMatter = (type: FrontMatterType) => {
    const label = FRONT_MATTER_OPTIONS.find(opt => opt.value === type)?.label || '';
    setCurrentFrontMatter({ type, title: label, content: '' });
    setEditorType('front');
    setEditorDialog(true);
    editor?.commands.setContent('<p>Start writing...</p>');
  };

  const saveFrontMatter = () => {
    if (!currentFrontMatter) return;
    const content = editor?.getHTML() || '';
    const updated = { ...currentFrontMatter, content };
    
    setManuscript(prev => {
      const existing = prev.frontMatter.findIndex(fm => fm.type === updated.type);
      if (existing >= 0) {
        const newFrontMatter = [...prev.frontMatter];
        newFrontMatter[existing] = updated;
        return { ...prev, frontMatter: newFrontMatter };
      }
      return { ...prev, frontMatter: [...prev.frontMatter, updated] };
    });
    
    setEditorDialog(false);
    setCurrentFrontMatter(null);
  };

  const deleteFrontMatter = (type: FrontMatterType) => {
    setManuscript(prev => ({
      ...prev,
      frontMatter: prev.frontMatter.filter(fm => fm.type !== type),
    }));
  };

  // Unit handlers
  const addUnit = () => {
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      number: manuscript.units.length + 1,
      title: `Unit ${manuscript.units.length + 1}`,
    };
    setManuscript(prev => ({ ...prev, units: [...prev.units, newUnit] }));
  };

  const deleteUnit = (id: string) => {
    setManuscript(prev => ({
      ...prev,
      units: prev.units.filter(u => u.id !== id),
      chapters: prev.chapters.map(ch => ch.unitId === id ? { ...ch, unitId: undefined } : ch),
    }));
  };

  // Chapter handlers
  const addChapter = (unitId?: string) => {
    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      number: manuscript.chapters.length + 1,
      title: `Chapter ${manuscript.chapters.length + 1}`,
      content: '',
      unitId,
    };
    setCurrentChapter(newChapter);
    setEditorType('chapter');
    setEditorDialog(true);
    editor?.commands.setContent('<p>Start writing your chapter...</p>');
  };

  const editChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setEditorType('chapter');
    setEditorDialog(true);
    editor?.commands.setContent(chapter.content || '<p>Start writing...</p>');
  };

  const saveChapter = () => {
    if (!currentChapter) return;
    const content = editor?.getHTML() || '';
    const updated = { ...currentChapter, content };
    
    setManuscript(prev => {
      const existing = prev.chapters.findIndex(ch => ch.id === updated.id);
      if (existing >= 0) {
        const newChapters = [...prev.chapters];
        newChapters[existing] = updated;
        return { ...prev, chapters: newChapters };
      }
      return { ...prev, chapters: [...prev.chapters, updated] };
    });
    
    setEditorDialog(false);
    setCurrentChapter(null);
  };

  const deleteChapter = (id: string) => {
    setManuscript(prev => ({
      ...prev,
      chapters: prev.chapters.filter(ch => ch.id !== id),
    }));
  };

  // Back Matter handlers
  const addBackMatter = (type: BackMatterType) => {
    const label = BACK_MATTER_OPTIONS.find(opt => opt.value === type)?.label || '';
    setCurrentBackMatter({ type, title: label, content: '' });
    setEditorType('back');
    setEditorDialog(true);
    editor?.commands.setContent('<p>Start writing...</p>');
  };

  const saveBackMatter = () => {
    if (!currentBackMatter) return;
    const content = editor?.getHTML() || '';
    const updated = { ...currentBackMatter, content };
    
    setManuscript(prev => {
      const existing = prev.backMatter.findIndex(bm => bm.type === updated.type);
      if (existing >= 0) {
        const newBackMatter = [...prev.backMatter];
        newBackMatter[existing] = updated;
        return { ...prev, backMatter: newBackMatter };
      }
      return { ...prev, backMatter: [...prev.backMatter, updated] };
    });
    
    setEditorDialog(false);
    setCurrentBackMatter(null);
  };

  const deleteBackMatter = (type: BackMatterType) => {
    setManuscript(prev => ({
      ...prev,
      backMatter: prev.backMatter.filter(bm => bm.type !== type),
    }));
  };

  // Export handlers
  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let pageNumber = 1;
    const pageHeight = 297;
    const margin = 20;
    let yPosition = margin;

    const addNewPage = () => {
      pdf.addPage();
      pageNumber++;
      yPosition = margin;
    };

    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        addNewPage();
      }
    };

    // Title page
    pdf.setFontSize(28);
    pdf.text(manuscript.metadata.title, 105, 100, { align: 'center' });
    if (manuscript.metadata.subtitle) {
      pdf.setFontSize(18);
      pdf.text(manuscript.metadata.subtitle, 105, 120, { align: 'center' });
    }
    pdf.setFontSize(16);
    pdf.text(manuscript.metadata.author, 105, 160, { align: 'center' });
    
    addNewPage();

    // Copyright page
    pdf.setFontSize(10);
    pdf.text(`© ${manuscript.metadata.year} ${manuscript.metadata.author}`, margin, yPosition);
    yPosition += 10;
    if (manuscript.metadata.publisher) {
      pdf.text(`Published by ${manuscript.metadata.publisher}`, margin, yPosition);
      yPosition += 10;
    }
    if (manuscript.metadata.isbn) {
      pdf.text(`ISBN: ${manuscript.metadata.isbn}`, margin, yPosition);
    }
    
    addNewPage();

    // Front Matter
    manuscript.frontMatter.forEach(fm => {
      pdf.setFontSize(20);
      pdf.text(fm.title, 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      pdf.setFontSize(11);
      const contentLines = pdf.splitTextToSize(
        fm.content.replace(/<[^>]*>/g, ''),
        170
      );
      contentLines.forEach((line: string) => {
        checkNewPage(10);
        pdf.text(line, margin, yPosition);
        yPosition += 7;
      });
      
      addNewPage();
    });

    // Chapters
    manuscript.chapters.forEach(chapter => {
      pdf.setFontSize(22);
      checkNewPage(30);
      pdf.text(`Chapter ${chapter.number}`, 105, yPosition, { align: 'center' });
      yPosition += 10;
      pdf.text(chapter.title, 105, yPosition, { align: 'center' });
      yPosition += 20;
      
      pdf.setFontSize(11);
      const contentLines = pdf.splitTextToSize(
        chapter.content.replace(/<[^>]*>/g, ''),
        170
      );
      contentLines.forEach((line: string) => {
        checkNewPage(10);
        pdf.text(line, margin, yPosition);
        yPosition += 7;
      });
      
      addNewPage();
    });

    // Back Matter
    manuscript.backMatter.forEach(bm => {
      pdf.setFontSize(20);
      pdf.text(bm.title, 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      pdf.setFontSize(11);
      const contentLines = pdf.splitTextToSize(
        bm.content.replace(/<[^>]*>/g, ''),
        170
      );
      contentLines.forEach((line: string) => {
        checkNewPage(10);
        pdf.text(line, margin, yPosition);
        yPosition += 7;
      });
      
      addNewPage();
    });

    // Add page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      if (i > 2) {
        pdf.setFontSize(10);
        pdf.text(i.toString(), 105, pageHeight - 10, { align: 'center' });
      }
    }

    pdf.save(`${manuscript.metadata.title || 'manuscript'}.pdf`);
  };

  const generateEPUB = () => {
    alert('EPUB export functionality - For production use, integrate epub-gen-memory library with proper book structure and metadata.');
  };

  const saveManuscript = () => {
    const json = JSON.stringify(manuscript, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${manuscript.metadata.title || 'manuscript'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadManuscript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loaded = JSON.parse(event.target?.result as string);
          setManuscript(loaded);
        } catch (error) {
          alert('Failed to load manuscript file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleEditorSave = () => {
    if (editorType === 'chapter') saveChapter();
    else if (editorType === 'front') saveFrontMatter();
    else if (editorType === 'back') saveBackMatter();
  };

  return (
    <ProtectedRoute>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MenuBook sx={{ fontSize: 48, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              AuthorPro
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Professional Manuscript Formatter
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<Save />} onClick={saveManuscript} size="small">
            Save
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
            size="small"
          >
            Load
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={loadManuscript}
          />
          <Button
            variant="outlined"
            startIcon={<Preview />}
            onClick={() => setPreviewDialog(true)}
            size="small"
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={generatePDF}
            disabled={!manuscript.metadata.title || manuscript.chapters.length === 0}
            size="small"
          >
            PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={generateEPUB}
            disabled={!manuscript.metadata.title || manuscript.chapters.length === 0}
            size="small"
          >
            EPUB
          </Button>
        </Stack>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Create professional manuscripts with automatic formatting, table of contents, running headers, and export to PDF/EPUB.
      </Alert>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Sidebar - Structure */}
        <Box sx={{ minWidth: { md: '250px' }, maxWidth: { md: '250px' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Book Structure
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Metadata
            </Typography>
            <Chip
              label={manuscript.metadata.title || 'Untitled'}
              size="small"
              sx={{ mb: 2 }}
              color={manuscript.metadata.title ? 'primary' : 'default'}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Front Matter
            </Typography>
            {manuscript.frontMatter.map(fm => (
              <Chip
                key={fm.type}
                label={fm.title}
                size="small"
                onDelete={() => deleteFrontMatter(fm.type)}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            <Box sx={{ my: 1 }} />

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Chapters ({manuscript.chapters.length})
            </Typography>
            {manuscript.chapters.slice(0, 5).map(ch => (
              <Chip
                key={ch.id}
                label={`Ch ${ch.number}`}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {manuscript.chapters.length > 5 && (
              <Typography variant="caption" color="text.secondary">
                +{manuscript.chapters.length - 5} more
              </Typography>
            )}
            <Box sx={{ my: 1 }} />

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Back Matter
            </Typography>
            {manuscript.backMatter.map(bm => (
              <Chip
                key={bm.type}
                label={bm.title}
                size="small"
                onDelete={() => deleteBackMatter(bm.type)}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Paper>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
              <Tab label="Metadata" />
              <Tab label="Front Matter" />
              <Tab label="Content" />
              <Tab label="Back Matter" />
            </Tabs>

            {/* Metadata Tab */}
            {activeTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Book Title *"
                  value={manuscript.metadata.title}
                  onChange={(e) => handleMetadataChange('title', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Subtitle"
                  value={manuscript.metadata.subtitle}
                  onChange={(e) => handleMetadataChange('subtitle', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Author Name *"
                  value={manuscript.metadata.author}
                  onChange={(e) => handleMetadataChange('author', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Publisher"
                  value={manuscript.metadata.publisher}
                  onChange={(e) => handleMetadataChange('publisher', e.target.value)}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Year"
                    value={manuscript.metadata.year}
                    onChange={(e) => handleMetadataChange('year', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="ISBN"
                    value={manuscript.metadata.isbn}
                    onChange={(e) => handleMetadataChange('isbn', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Edition"
                    value={manuscript.metadata.edition}
                    onChange={(e) => handleMetadataChange('edition', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Copyright Notice"
                  value={manuscript.metadata.copyright}
                  onChange={(e) => handleMetadataChange('copyright', e.target.value)}
                  multiline
                  rows={2}
                />
                <Box>
                  <Button variant="outlined" component="label">
                    Upload Cover Image
                    <input type="file" hidden accept="image/*" onChange={handleCoverUpload} />
                  </Button>
                  {manuscript.coverImage && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={manuscript.coverImage}
                        alt="Cover"
                        style={{ maxWidth: '200px', borderRadius: '8px' }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Front Matter Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Front Matter Sections
                </Typography>
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {FRONT_MATTER_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => addFrontMatter(option.value)}
                      disabled={manuscript.frontMatter.some(fm => fm.type === option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Box>

                {manuscript.frontMatter.length === 0 ? (
                  <Alert severity="info">
                    Add front matter sections like dedication, preface, or acknowledgements.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {manuscript.frontMatter.map(fm => (
                      <Card key={fm.type}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{fm.title}</Typography>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setCurrentFrontMatter(fm);
                                  setEditorType('front');
                                  setEditorDialog(true);
                                  editor?.commands.setContent(fm.content || '<p>Start writing...</p>');
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton size="small" onClick={() => deleteFrontMatter(fm.type)}>
                                <Delete />
                              </IconButton>
                            </Stack>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                            dangerouslySetInnerHTML={{ __html: fm.content.substring(0, 200) + '...' }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Content Tab */}
            {activeTab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6">
                    Chapters & Units
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" startIcon={<Add />} onClick={addUnit}>
                      Add Unit
                    </Button>
                    <Button variant="contained" size="small" startIcon={<Add />} onClick={() => addChapter()}>
                      Add Chapter
                    </Button>
                  </Stack>
                </Box>

                {manuscript.chapters.length === 0 && manuscript.units.length === 0 ? (
                  <Alert severity="info">
                    Start by adding chapters to your manuscript. Optionally organize them into units (parts/sections).
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {manuscript.chapters
                      .filter(ch => !ch.unitId)
                      .map(chapter => (
                        <Card key={chapter.id}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6">
                                Chapter {chapter.number}: {chapter.title}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <IconButton size="small" onClick={() => editChapter(chapter)}>
                                  <Edit />
                                </IconButton>
                                <IconButton size="small" onClick={() => deleteChapter(chapter.id)}>
                                  <Delete />
                                </IconButton>
                              </Stack>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                              dangerouslySetInnerHTML={{
                                __html: chapter.content.substring(0, 200) + (chapter.content.length > 200 ? '...' : ''),
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Back Matter Tab */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Back Matter Sections
                </Typography>
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {BACK_MATTER_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => addBackMatter(option.value)}
                      disabled={manuscript.backMatter.some(bm => bm.type === option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Box>

                {manuscript.backMatter.length === 0 ? (
                  <Alert severity="info">
                    Add back matter sections like epilogue, appendix, or about the author.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {manuscript.backMatter.map(bm => (
                      <Card key={bm.type}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{bm.title}</Typography>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setCurrentBackMatter(bm);
                                  setEditorType('back');
                                  setEditorDialog(true);
                                  editor?.commands.setContent(bm.content || '<p>Start writing...</p>');
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton size="small" onClick={() => deleteBackMatter(bm.type)}>
                                <Delete />
                              </IconButton>
                            </Stack>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                            dangerouslySetInnerHTML={{ __html: bm.content.substring(0, 200) + '...' }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Editor Dialog */}
      <Dialog open={editorDialog} onClose={() => setEditorDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editorType === 'chapter' && `Edit Chapter ${currentChapter?.number}: ${currentChapter?.title}`}
          {editorType === 'front' && `Edit ${currentFrontMatter?.title}`}
          {editorType === 'back' && `Edit ${currentBackMatter?.title}`}
        </DialogTitle>
        <DialogContent>
          {editorType === 'chapter' && (
            <TextField
              fullWidth
              label="Chapter Title"
              value={currentChapter?.title || ''}
              onChange={(e) =>
                setCurrentChapter(prev => (prev ? { ...prev, title: e.target.value } : null))
              }
              sx={{ mb: 2 }}
            />
          )}
          
          {/* TipTap Editor Toolbar */}
          <Paper variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              color={editor?.isActive('bold') ? 'primary' : 'default'}
            >
              <FormatBold />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              color={editor?.isActive('italic') ? 'primary' : 'default'}
            >
              <FormatItalic />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              color={editor?.isActive('underline') ? 'primary' : 'default'}
            >
              <FormatUnderlined />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <IconButton
              size="small"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              color={editor?.isActive('bulletList') ? 'primary' : 'default'}
            >
              <FormatListBulleted />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              color={editor?.isActive('orderedList') ? 'primary' : 'default'}
            >
              <FormatListNumbered />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Button
              size="small"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              variant={editor?.isActive('heading', { level: 1 }) ? 'contained' : 'text'}
            >
              H1
            </Button>
            <Button
              size="small"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              variant={editor?.isActive('heading', { level: 2 }) ? 'contained' : 'text'}
            >
              H2
            </Button>
            <Button
              size="small"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              variant={editor?.isActive('heading', { level: 3 }) ? 'contained' : 'text'}
            >
              H3
            </Button>
          </Paper>

          {/* Editor Content */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              minHeight: '400px',
              '& .ProseMirror': {
                outline: 'none',
                minHeight: '380px',
                '& p': { margin: '0 0 1em 0' },
                '& h1, & h2, & h3': { marginTop: '1em', marginBottom: '0.5em' },
                '& ul, & ol': { paddingLeft: '1.5em' },
              },
            }}
          >
            <EditorContent editor={editor} />
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditorSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manuscript Preview</DialogTitle>
        <DialogContent>
          <Typography variant="h4" align="center" gutterBottom>
            {manuscript.metadata.title}
          </Typography>
          {manuscript.metadata.subtitle && (
            <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
              {manuscript.metadata.subtitle}
            </Typography>
          )}
          <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
            by {manuscript.metadata.author}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Structure Summary
          </Typography>
          <Typography variant="body2">
            • Front Matter: {manuscript.frontMatter.length} sections
          </Typography>
          <Typography variant="body2">
            • Units: {manuscript.units.length}
          </Typography>
          <Typography variant="body2">
            • Chapters: {manuscript.chapters.length}
          </Typography>
          <Typography variant="body2">
            • Back Matter: {manuscript.backMatter.length} sections
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      </Container>
      <Footer />
    </ProtectedRoute>
  );
}
