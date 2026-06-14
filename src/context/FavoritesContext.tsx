'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialization - load from localStorage only once
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('toolFavorites');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Failed to parse favorites:', error);
        return [];
      }
    }
    return [];
  });

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('toolFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (slug: string) => {
    setFavorites(prev => {
      if (!prev.includes(slug)) {
        return [...prev, slug];
      }
      return prev;
    });
  };

  const removeFavorite = (slug: string) => {
    setFavorites(prev => prev.filter(s => s !== slug));
  };

  const isFavorite = (slug: string) => {
    return favorites.includes(slug);
  };

  const toggleFavorite = (slug: string) => {
    if (isFavorite(slug)) {
      removeFavorite(slug);
    } else {
      addFavorite(slug);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
