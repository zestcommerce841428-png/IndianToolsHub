'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  InputAdornment,
  Breadcrumbs,
  Link as MuiLink,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import BuildIcon from '@mui/icons-material/Build';
import ArticleIcon from '@mui/icons-material/Article';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { TOOLS } from '@/data/tools';
import { BLOG_POSTS } from '@/data/blogs';
import Link from 'next/link';

interface SitemapItem {
  title: string;
  url: string;
  description?: string;
  priority: number;
  category: string;
  icon?: React.ReactNode;
  children?: SitemapItem[];
}

export default function SitemapPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  // Build sitemap data
  const sitemapData: SitemapItem[] = useMemo(() => [
    {
      title: 'Home',
      url: '/',
      description: 'IndianToolsHub - Free Online Tools & Utilities',
      priority: 1.0,
      category: 'Core',
      icon: <HomeIcon />,
    },
    {
      title: 'Tools',
      url: '/tools',
      description: 'All our free online tools',
      priority: 0.9,
      category: 'Tools',
      icon: <BuildIcon />,
      children: TOOLS.map(tool => ({
        title: tool.title,
        url: `/tools/${tool.slug}`,
        description: tool.description,
        priority: 0.9,
        category: 'Tools',
      })),
    },
    {
      title: 'Blog',
      url: '/blog',
      description: 'Latest articles and tutorials',
      priority: 0.9,
      category: 'Content',
      icon: <ArticleIcon />,
      children: BLOG_POSTS.map(post => ({
        title: post.title,
        url: `/blog/${post.slug}`,
        description: post.description,
        priority: 0.8,
        category: 'Content',
      })),
    },
    {
      title: 'About',
      url: '/about',
      description: 'Learn more about IndianToolsHub',
      priority: 0.8,
      category: 'Core',
      icon: <InfoIcon />,
    },
    {
      title: 'Privacy Policy',
      url: '/privacy-policy',
      description: 'Our privacy policy and data handling',
      priority: 0.5,
      category: 'Legal',
      icon: <SecurityIcon />,
    },
    {
      title: 'Terms & Conditions',
      url: '/term-conditions',
      description: 'Terms of service and usage guidelines',
      priority: 0.5,
      category: 'Legal',
      icon: <SecurityIcon />,
    },
    {
      title: 'Contact',
      url: '/contact',
      description: 'Get in touch with us',
      priority: 0.7,
      category: 'Core',
      icon: <InfoIcon />,
    },
  ], []);

  // Flatten sitemap for search
  const flattenedSitemap = useMemo(() => {
    const flattened: SitemapItem[] = [];
    const flatten = (items: SitemapItem[]) => {
      items.forEach(item => {
        flattened.push(item);
        if (item.children) {
          flatten(item.children);
        }
      });
    };
    flatten(sitemapData);
    return flattened;
  }, [sitemapData]);

  // Filter sitemap based on search
  const filteredSitemap = useMemo(() => {
    if (!searchQuery.trim()) return sitemapData;
    
    const query = searchQuery.toLowerCase();
    return flattenedSitemap.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [searchQuery, flattenedSitemap, sitemapData]);

  // Filter by category
  const categories = ['All', 'Core', 'Tools', 'Content', 'Legal'];
  const currentCategory = categories[selectedTab];
  
  const displayedItems = useMemo(() => {
    if (searchQuery.trim()) return filteredSitemap;
    if (currentCategory === 'All') return sitemapData;
    return sitemapData.filter(item => item.category === currentCategory);
  }, [currentCategory, searchQuery, filteredSitemap, sitemapData]);

  const getCategoryCount = (category: string) => {
    if (category === 'All') return flattenedSitemap.length;
    return flattenedSitemap.filter(item => item.category === category).length;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 6 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <MuiLink component={Link} href="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </MuiLink>
          <Typography color="text.primary">Sitemap</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Site Navigation
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Explore all {flattenedSitemap.length} pages on IndianToolsHub
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search pages, tools, articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        </Box>

        {/* Category Tabs */}
        {!searchQuery.trim() && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs 
              value={selectedTab} 
              onChange={(_, newValue) => setSelectedTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {categories.map((category, index) => (
                <Tab 
                  key={category}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category}
                      <Chip 
                        label={getCategoryCount(category)} 
                        size="small" 
                        color={selectedTab === index ? 'primary' : 'default'}
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Sitemap Items */}
        <Box>
          {displayedItems.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No results found for "{searchQuery}"
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try different keywords or browse by category
                </Typography>
              </CardContent>
            </Card>
          ) : searchQuery.trim() ? (
            // Search Results View
            <Grid container spacing={2}>
              {displayedItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    component={Link}
                    href={item.url}
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.3s',
                      textDecoration: 'none',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {item.icon && (
                          <Box sx={{ mr: 1, color: 'primary.main' }}>
                            {item.icon}
                          </Box>
                        )}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1,
                        }}
                      >
                        {item.description || 'No description available'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {item.url}
                      </Typography>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        sx={{ mt: 1 }} 
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Category View with Accordions
            <Box>
              {displayedItems.map((item, index) => (
                <Accordion 
                  key={index}
                  defaultExpanded={item.children && item.children.length > 0}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary 
                    expandIcon={item.children ? <ExpandMoreIcon /> : null}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      {item.icon && (
                        <Box sx={{ color: 'primary.main' }}>
                          {item.icon}
                        </Box>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.title}
                          {item.children && (
                            <Chip 
                              label={item.children.length} 
                              size="small" 
                              sx={{ ml: 2 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                      <MuiLink
                        component={Link}
                        href={item.url}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ 
                          px: 2, 
                          py: 1, 
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          color: 'white',
                          textDecoration: 'none',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        }}
                      >
                        Visit
                      </MuiLink>
                    </Box>
                  </AccordionSummary>
                  {item.children && item.children.length > 0 && (
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {item.children.map((child, childIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={childIndex}>
                            <Card 
                              component={Link}
                              href={child.url}
                              sx={{ 
                                height: '100%',
                                transition: 'all 0.3s',
                                textDecoration: 'none',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows[4],
                                },
                              }}
                            >
                              <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {child.title}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {child.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  )}
                </Accordion>
              ))}
            </Box>
          )}
        </Box>

        {/* XML Sitemap Link */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Looking for the XML sitemap for search engines?
          </Typography>
          <MuiLink
            href="/sitemap.xml"
            target="_blank"
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: 600,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            View XML Sitemap
          </MuiLink>
        </Box>
      </Container>
    </Box>
  );
}
