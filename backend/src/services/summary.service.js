const { supabaseAdmin } = require('../utils/supabase');
const { AppError } = require('../utils/error');

/**
 * Summary service for database operations
 */
class SummaryService {
  /**
   * Create a new summary in the database
   * @param {Object} summaryData - Summary data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created summary
   */
  async createSummary(summaryData, userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('summaries')
        .insert({
          user_id: userId,
          video_url: summaryData.videoUrl,
          video_title: summaryData.videoTitle,
          video_thumbnail_url: summaryData.videoThumbnail,
          summary_text: summaryData.summaryText,
          summary_type: summaryData.summaryType,
          summary_length: summaryData.summaryLength
        })
        .select()
        .single();

      if (error) {
        throw new AppError(`Failed to create summary: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(`Failed to create summary: ${error.message}`, 500);
    }
  }

  /**
   * Get all summaries for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of summaries
   */
  async getUserSummaries(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('summaries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new AppError(`Failed to fetch summaries: ${error.message}`, 500);
      }

      return data || [];
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(`Failed to fetch summaries: ${error.message}`, 500);
    }
  }

  /**
   * Get a summary by ID
   * @param {string} summaryId - Summary ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Summary
   */
  async getSummaryById(summaryId, userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('summaries')
        .select('*')
        .eq('id', summaryId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw new AppError(`Failed to fetch summary: ${error.message}`, 404);
      }

      return data;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(`Failed to fetch summary: ${error.message}`, 500);
    }
  }

  /**
   * Delete a summary
   * @param {string} summaryId - Summary ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteSummary(summaryId, userId) {
    try {
      const { error } = await supabaseAdmin
        .from('summaries')
        .delete()
        .eq('id', summaryId)
        .eq('user_id', userId);

      if (error) {
        throw new AppError(`Failed to delete summary: ${error.message}`, 500);
      }
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(`Failed to delete summary: ${error.message}`, 500);
    }
  }

  /**
   * Update a summary
   * @param {string} summaryId - Summary ID
   * @param {Object} summaryData - Summary data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated summary
   */
  async updateSummary(summaryId, summaryData, userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('summaries')
        .update(summaryData)
        .eq('id', summaryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new AppError(`Failed to update summary: ${error.message}`, 500);
      }

      return data;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(`Failed to update summary: ${error.message}`, 500);
    }
  }
}

module.exports = new SummaryService();
