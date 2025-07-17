// src/utils/constants.js

// Colors
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  disabled: '#3C3C43'
};

// Typography
export const TYPOGRAPHY = {
  fontSize: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// Screen dimensions
export const SCREEN = {
  padding: SPACING.md,
  borderRadius: 8
};

// API Endpoints
export const API_ENDPOINTS = {
  pets: '/petstore/pets',
  foods: '/petstore/foods',
  health: '/health'
};

// Form validation
export const VALIDATION = {
  minPasswordLength: 8,
  maxNameLength: 50,
  maxDescriptionLength: 500,
  minAge: 0,
  maxAge: 50,
  minPrice: 0,
  maxPrice: 10000,
  minStock: 0,
  maxStock: 99999
};

// Pet categories
export const PET_BREEDS = [
  'Golden Retriever',
  'Labrador',
  'German Shepherd',
  'Bulldog',
  'Poodle',
  'Beagle',
  'Rottweiler',
  'Siamese Cat',
  'Persian Cat',
  'Maine Coon',
  'British Shorthair',
  'Other'
];

// Food categories
export const FOOD_CATEGORIES = [
  'dog',
  'cat',
  'bird',
  'fish',
  'small-animal',
  'reptile',
  'other'
];

// Animation durations
export const ANIMATION = {
  fast: 200,
  medium: 300,
  slow: 500
};