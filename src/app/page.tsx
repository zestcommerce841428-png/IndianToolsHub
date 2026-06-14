'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Chip,
  Paper,
  Pagination,
  Divider,
  Badge,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useTheme } from '@mui/material/styles';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolIcon from '@/components/ToolIcon';
import WelcomeModal from '@/components/WelcomeModal';
import FavoriteButton from '@/components/FavoriteButton';
import { TOOLS, CATEGORIES } from '@/data/tools';
import { BLOG_POSTS } from '@/data/blogs';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';

// Note: Metadata generation moved to layout.tsx since this is a client component
 
export default function Home() {
  const { t } = useLanguage();
  const theme = useTheme();
  const { favorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [blogPage, setBlogPage] = useState(1);

  const blogsPerPage = 6;
  const totalBlogPages = Math.ceil(BLOG_POSTS.length / blogsPerPage);

  const currentBlogs = useMemo(() => {
    const start = (blogPage - 1) * blogsPerPage;
    return BLOG_POSTS.slice(start, start + blogsPerPage);
  }, [blogPage]);

  const handleBlogPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setBlogPage(value);
    const element = document.getElementById('latest-blogs-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Filter tools based on tab and search query
  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      // Handle favorites tab
      if (activeTab === 'favorites') {
        const matchesFavorites = favorites.includes(tool.slug);
        if (!matchesFavorites) return false;
      } else {
        const matchesTab = activeTab === 'all' || tool.category === activeTab;
        if (!matchesTab) return false;
      }
      
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !cleanQuery ||
        tool.title.toLowerCase().includes(cleanQuery) ||
        tool.description.toLowerCase().includes(cleanQuery) ||
        tool.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery));

      return matchesSearch;
    });
  }, [activeTab, searchQuery, favorites]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <WelcomeModal />

      {/* Hero Section with Dynamic Palette Gradient */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: '#ffffff',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.8,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 850,
              fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
              mb: 3,
              lineHeight: 1.2,
              fontFamily: '"Poppins", sans-serif',
              textShadow: '0 4px 12px rgba(0,0,0,0.15)',
              color: '#ffffff',
            }}
          >
            {t('heroTitle').split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < t('heroTitle').split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '1.02rem', md: '1.2rem' },
              color: 'rgba(255, 255, 255, 0.92)',
              mb: 5,
              maxWidth: '650px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            {t('heroSubtitle')}
          </Typography>

          {/* Search Box inside Hero */}
          <Paper
            elevation={3}
            sx={{
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 650,
              mx: 'auto',
              borderRadius: 3,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              bgcolor: 'background.paper',
            }}
          >
            <TextField
              fullWidth
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="standard"
              slotProps={{
                input: {
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 2, color: 'text.secondary' }}>
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  style: {
                    paddingTop: 1.5,
                    paddingBottom: 1.5,
                    fontSize: '1.05rem',
                    color: 'text.primary',
                  },
                },
              }}
            />
          </Paper>
        </Container>
      </Box>

      {/* Main Contents Section */}
      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
        {/* Category Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="tool categories"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.95rem',
                minWidth: 'auto',
                px: 3,
                py: 2,
                textTransform: 'none',
              },
            }}
          >
            <Tab value="all" label={t('allUtilities')} />
            <Tab
              value="favorites"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FavoriteIcon sx={{ fontSize: 18 }} />
                  Favorites
                  {favorites.length > 0 && (
                    <Badge
                      badgeContent={favorites.length}
                      color="error"
                      sx={{ ml: 0.5 }}
                    />
                  )}
                </Box>
              }
            />
            {CATEGORIES.map((cat) => (
              <Tab
                key={cat.id}
                value={cat.id}
                label={cat.title}
                id={cat.id}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tools Grid */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: '1.65rem',
            mb: 3,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          {activeTab === 'all'
            ? t('categoriesTitle')
            : CATEGORIES.find((c) => c.id === activeTab)?.title}
          <Chip
            label={`${filteredTools.length} ${filteredTools.length === 1 ? 'tool' : 'tools'}`}
            color="primary"
            size="small"
            sx={{ fontWeight: 700, color: '#ffffff' }}
          />
        </Typography>

        {filteredTools.length > 0 ? (
          <Grid container spacing={3}>
            {filteredTools.map((tool) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tool.slug}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                    <FavoriteButton toolSlug={tool.slug} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}1f 0%, ${theme.palette.secondary.light}1f 100%)`,
                        color: 'primary.main',
                        mb: 2.5,
                      }}
                    >
                      <ToolIcon name={tool.icon} sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        mb: 1,
                        color: 'text.primary',
                      }}
                    >
                      {tool.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        fontSize: '0.92rem',
                      }}
                    >
                      {tool.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Link href={`/tools/${tool.slug}`} passHref style={{ textDecoration: 'none', width: '100%' }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          fontWeight: 700,
                          py: 1,
                          borderColor: 'divider',
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: '#ffffff',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        {t('useTool')}
                      </Button>
                    </Link>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <Typography variant="h6" sx={{ fontWeight: 650, mb: 1 }}>
              {t('noTools')}
            </Typography>
            <Typography variant="body2">
              {t('noToolsDesc')}
            </Typography>
          </Box>
        )}
      </Container>

      {/* Blog Section */}
      <Container maxWidth="lg" sx={{ pb: 8 }} id="latest-blogs-section">
        <Divider sx={{ mb: 6 }} />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: '1.65rem',
            mb: 1,
            color: 'text.primary',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Latest Blog Posts & Technical Guides
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          Stay updated with deep dives into security, web optimization, and local developer practices.
        </Typography>

        <Grid container spacing={3}>
          {currentBlogs.map((post) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.slug}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={post.category} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />
                    <Chip label={post.readTime} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 1.5, color: 'text.primary', lineHeight: 1.4 }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                    {post.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Link href={`/blog/${post.slug}`} passHref style={{ textDecoration: 'none', width: '100%' }}>
                    <Button variant="outlined" color="secondary" fullWidth sx={{ fontWeight: 700 }}>
                      Read Post
                    </Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {totalBlogPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination
              count={totalBlogPages}
              page={blogPage}
              onChange={handleBlogPageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
