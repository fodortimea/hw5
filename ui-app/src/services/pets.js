// src/services/pets.js
import { apiClient, albClient } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const petsService = {
  // Get all pets
  async getAll(useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(API_ENDPOINTS.pets);
      return response.data;
    } catch (error) {
      console.error('Error fetching pets:', error);
      throw error;
    }
  },

  // Get pet by ID
  async getById(id, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(`${API_ENDPOINTS.pets}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pet ${id}:`, error);
      throw error;
    }
  },

  // Create new pet
  async create(petData, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.post(API_ENDPOINTS.pets, petData);
      return response.data;
    } catch (error) {
      console.error('Error creating pet:', error);
      throw error;
    }
  },

  // Update existing pet
  async update(id, petData, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.put(`${API_ENDPOINTS.pets}/${id}`, petData);
      return response.data;
    } catch (error) {
      console.error(`Error updating pet ${id}:`, error);
      throw error;
    }
  },

  // Delete pet
  async delete(id, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      await client.delete(`${API_ENDPOINTS.pets}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting pet ${id}:`, error);
      throw error;
    }
  },

  // Search pets (if backend supports it)
  async search(query, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(`${API_ENDPOINTS.pets}?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching pets:', error);
      throw error;
    }
  },

  // Get pets with pagination
  async getPaginated(skip = 0, limit = 10, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(`${API_ENDPOINTS.pets}?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching paginated pets:', error);
      throw error;
    }
  }
};