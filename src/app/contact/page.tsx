'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function ContactPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Execute reCAPTCHA
      if (!executeRecaptcha) {
        throw new Error('ReCAPTCHA not loaded');
      }

      const recaptchaToken = await executeRecaptcha('contact_form');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 32, color: '#3b82f6' }} />,
      title: 'Email Us',
      value: 'admin@zestcommerce.in',
      link: 'mailto:admin@zestcommerce.in',
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 32, color: '#10b981' }} />,
      title: 'Call Us',
      value: '+91 7492 068 998',
      link: 'tel:+917492068998',
    },
    {
      icon: <WhatsAppIcon sx={{ fontSize: 32, color: '#25D366' }} />,
      title: 'WhatsApp Us',
      value: '+91 7492 068 998',
      link: 'https://wa.me/917492068998',
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
      title: 'Visit Us',
      value: 'India',
      link: null,
    },
  ];

  const socialLinks = [
    { icon: <TwitterIcon />, name: 'Twitter', url: '#', color: '#1DA1F2' },
    { icon: <LinkedInIcon />, name: 'LinkedIn', url: '#', color: '#0A66C2' },
    { icon: <GitHubIcon />, name: 'GitHub', url: 'https://github.com/zestcommerce841428-png/IndianToolsHub', color: '#333' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 8, flexGrow: 1 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
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
            Get in Touch
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', fontSize: '1.1rem' }}>
            Have a question, feedback, or need assistance? We&apos;re here to help! Reach out to us and we&apos;ll get back to you as soon as possible.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontFamily: '"Poppins", sans-serif' }}>
                Send us a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Fill out the form below and we&apos;ll respond within 24 hours
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for contacting us! We&apos;ve received your message and will get back to you soon.
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      multiline
                      rows={6}
                      placeholder="Tell us how we can help you..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Contact Info & Social */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Contact Information */}
              {contactInfo.map((info, index) => (
                <Card key={index} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ mt: 0.5 }}>{info.icon}</Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.secondary' }}>
                          {info.title}
                        </Typography>
                        {info.link ? (
                          <Typography
                            component="a"
                            href={info.link}
                            sx={{
                              color: 'primary.main',
                              textDecoration: 'none',
                              fontSize: '1rem',
                              fontWeight: 600,
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {info.value}
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                            {info.value}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Social Media */}
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: '"Poppins", sans-serif' }}>
                  Follow Us
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {socialLinks.map((social, index) => (
                    <Box
                      key={index}
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${social.color}15`,
                        color: social.color,
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                        '&:hover': {
                          bgcolor: social.color,
                          color: '#fff',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {social.icon}
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Office Hours */}
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(37, 99, 235, 0.03)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: '"Poppins", sans-serif' }}>
                  Office Hours
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Monday - Friday</Typography>
                    <Typography variant="body2" color="text.secondary">9:00 AM - 6:00 PM IST</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Saturday</Typography>
                    <Typography variant="body2" color="text.secondary">10:00 AM - 4:00 PM IST</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Sunday</Typography>
                    <Typography variant="body2" color="text.secondary">Closed</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontFamily: '"Poppins", sans-serif', textAlign: 'center' }}>
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={3}>
            {[
              { q: 'How quickly will I get a response?', a: 'We typically respond within 24 hours during business days.' },
              { q: 'Is my data secure?', a: 'Yes, all communications are encrypted and we never share your information.' },
              { q: 'Can I suggest new features?', a: 'Absolutely! We love hearing feedback and feature suggestions from our users.' },
            ].map((faq, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                    {faq.q}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {faq.a}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
