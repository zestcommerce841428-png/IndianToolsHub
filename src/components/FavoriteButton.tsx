'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavorites } from '@/context/FavoritesContext';

interface FavoriteButtonProps {
  toolSlug: string;
  size?: 'small' | 'medium' | 'large';
}

export default function FavoriteButton({ toolSlug, size = 'small' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(toolSlug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(toolSlug);
  };

  return (
    <Tooltip title={favorite ? 'Remove from favorites' : 'Add to favorites'}>
      <IconButton
        onClick={handleClick}
        size={size}
        sx={{
          color: favorite ? '#FF9933' : 'rgba(0, 0, 0, 0.54)',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#FF9933',
            transform: 'scale(1.1)',
          },
        }}
      >
        {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
}
