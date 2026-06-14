'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Pagination,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { BLOG_POSTS, BlogPost } from '@/data/blogs';
import SearchIcon from '@mui/icons-material/Search';

const POSTS_PER_PAGE = 10;
const CATEGORIES = ['All', 'Image Optimization', 'PDF Guides', 'Developer Utilities', 'Web Productivity', 'Calculators & Math'];

export default function BlogIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Reset page number on search/filter change
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  // Paginated items
  const paginatedPosts = useMemo(() => {
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, page]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
        {/* Hero Banner */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              fontFamily: '"Poppins", sans-serif',
              background: 'linear-gradient(135deg, #FF9933 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Insights & Guides Hub
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Learn tips, mathematics, design formulas, and workflows for our developer utilities and calculators.
          </Typography>
        </Box>

        {/* Search & Category Filter Section */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: 'background.paper' }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            {/* Search Input */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search articles by title, description or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }
                }}
                size="small"
              />
            </Grid>

            {/* Category Buttons */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { md: 'flex-end' } }}>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    size="small"
                    variant={selectedCategory === cat ? 'contained' : 'outlined'}
                    onClick={() => setSelectedCategory(cat)}
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                    }}
                  >
                    {cat}
                  </Button>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Blog Post Grid */}
        {paginatedPosts.length > 0 ? (
          <Grid container spacing={3}>
            {paginatedPosts.map((post) => (
              <Grid size={{ xs: 12, md: 6 }} key={post.slug}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip label={post.category} color="primary" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      <Typography variant="caption" color="text.secondary">
                        {post.publishDate} • {post.readTime}
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1.5, fontFamily: '"Poppins", sans-serif' }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>
                      {post.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {post.tags.map(tag => (
                        <Chip key={tag} label={`#${tag}`} size="small" sx={{ fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', width: '100%' }}>
                      <Button fullWidth variant="contained" color="secondary" sx={{ fontWeight: 600, borderRadius: 2 }}>
                        Read Article
                      </Button>
                    </Link>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No articles found matching your search.
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="large"
              shape="rounded"
            />
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
