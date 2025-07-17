// src/services/foods.js
import { apiClient, albClient } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const foodsService = {
  // Get all foods
  async getAll(useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(API_ENDPOINTS.foods);
      return response.data;
    } catch (error) {
      console.error('Error fetching foods:', error);
      throw error;
    }
  },

  // Get food by ID
  async getById(id, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(`${API_ENDPOINTS.foods}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching food ${id}:`, error);
      throw error;
    }
  },

  // Create new food
  async create(foodData, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.post(API_ENDPOINTS.foods, foodData);
      return response.data;
    } catch (error) {
      console.error('Error creating food:', error);
      throw error;
    }
  },

  // Update existing food
  async update(id, foodData, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.put(`${API_ENDPOINTS.foods}/${id}`, foodData);
      return response.data;
    } catch (error) {
      console.error(`Error updating food ${id}:`, error);
      throw error;
    }
  },

  // Delete food
  async delete(id, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      await client.delete(`${API_ENDPOINTS.foods}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting food ${id}:`, error);
      throw error;
    }
  },

  // Get foods by category
  async getByCategory(category, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(`${API_ENDPOINTS.foods}?category=${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching foods for category ${category}:`, error);
      throw error;
    }
  },

  // Search foods (if backend supports it)
  async search(query, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(`${API_ENDPOINTS.foods}?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching foods:', error);
      throw error;
    }
  },

  // Get foods with pagination
  async getPaginated(skip = 0, limit = 10, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(`${API_ENDPOINTS.foods}?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching paginated foods:', error);
      throw error;
    }
  },

  // Get low stock foods
  async getLowStock(threshold = 10, useDirectMode = false) {
    try {
      const client = useDirectMode ? albClient : apiClient;
      const response = await client.get(`${API_ENDPOINTS.foods}?low_stock=${threshold}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock foods:', error);
      throw error;
    }
  }
};