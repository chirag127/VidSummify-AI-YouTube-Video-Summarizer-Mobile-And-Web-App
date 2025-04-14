import { supabase } from './supabase';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

/**
 * API service for making requests to the backend
 */
class ApiService {
  /**
   * Get the authorization header with the JWT token
   * @returns {Object} - Headers object
   */
  async getHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response data
   */
  async get(endpoint) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      console.error(`GET request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<Object>} - Response data
   */
  async post(endpoint, data) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      console.error(`POST request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<Object>} - Response data
   */
  async put(endpoint, data) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      console.error(`PUT request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response data
   */
  async delete(endpoint) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      return response.status === 204 ? {} : await response.json();
    } catch (error) {
      console.error(`DELETE request failed: ${error.message}`);
      throw error;
    }
  }

  // API endpoints

  /**
   * Generate a summary for a YouTube video
   * @param {Object} data - Request data
   * @param {string} data.videoUrl - YouTube video URL
   * @param {string} data.summaryType - Type of summary
   * @param {string} data.summaryLength - Length of summary
   * @returns {Promise<Object>} - Generated summary
   */
  async generateSummary(data) {
    return this.post('/summaries', data);
  }

  /**
   * Get all summaries for the current user
   * @returns {Promise<Array>} - List of summaries
   */
  async getUserSummaries() {
    return this.get('/summaries');
  }

  /**
   * Get a summary by ID
   * @param {string} id - Summary ID
   * @returns {Promise<Object>} - Summary
   */
  async getSummaryById(id) {
    return this.get(`/summaries/${id}`);
  }

  /**
   * Delete a summary
   * @param {string} id - Summary ID
   * @returns {Promise<void>}
   */
  async deleteSummary(id) {
    return this.delete(`/summaries/${id}`);
  }

  /**
   * Update a summary
   * @param {string} id - Summary ID
   * @param {Object} data - Request data
   * @returns {Promise<Object>} - Updated summary
   */
  async updateSummary(id, data) {
    return this.put(`/summaries/${id}`, data);
  }
}

export default new ApiService();
