const { YtDlp } = require('ytdlp-nodejs');
const { AppError } = require('../utils/error');

/**
 * YouTube service for handling video processing
 */
class YouTubeService {
  constructor() {
    this.ytdlp = new YtDlp();
  }

  /**
   * Validate a YouTube URL
   * @param {string} url - YouTube URL to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  }

  /**
   * Get video information including transcript, title, and thumbnail
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} - Video information
   */
  async getVideoInfo(url) {
    try {
      if (!this.isValidYouTubeUrl(url)) {
        throw new AppError('Invalid YouTube URL', 400);
      }

      // Get video info using ytdlp
      const info = await this.ytdlp.getInfoAsync(url);
      
      if (!info) {
        throw new AppError('Failed to fetch video information', 404);
      }

      // Extract relevant information
      const videoInfo = {
        title: info.title || 'Unknown Title',
        thumbnail: info.thumbnail || null,
        duration: info.duration,
        transcript: null
      };

      // Check if subtitles/captions are available
      if (info.subtitles && Object.keys(info.subtitles).length > 0) {
        // Get the first available subtitle track
        const subtitleLang = Object.keys(info.subtitles)[0];
        const subtitleUrl = info.subtitles[subtitleLang][0]?.url;
        
        if (subtitleUrl) {
          // Fetch and parse the subtitle content
          const subtitleContent = await this.fetchSubtitleContent(subtitleUrl);
          videoInfo.transcript = subtitleContent;
        }
      }

      // If no subtitles, try to get automatic captions
      if (!videoInfo.transcript && info.automatic_captions && Object.keys(info.automatic_captions).length > 0) {
        const captionLang = Object.keys(info.automatic_captions)[0];
        const captionUrl = info.automatic_captions[captionLang][0]?.url;
        
        if (captionUrl) {
          // Fetch and parse the caption content
          const captionContent = await this.fetchSubtitleContent(captionUrl);
          videoInfo.transcript = captionContent;
        }
      }

      if (!videoInfo.transcript) {
        throw new AppError('No transcript or captions available for this video', 404);
      }

      return videoInfo;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(`Failed to process YouTube video: ${error.message}`, 500);
    }
  }

  /**
   * Fetch subtitle content from URL
   * @param {string} url - Subtitle URL
   * @returns {Promise<string>} - Parsed subtitle content
   */
  async fetchSubtitleContent(url) {
    try {
      // This is a simplified version. In a real implementation,
      // you would fetch the subtitle file and parse it based on its format
      // (e.g., SRT, VTT, etc.)
      
      // For now, we'll return a placeholder
      return "This is a placeholder for the transcript content. In a real implementation, this would be the actual transcript fetched from the subtitle URL.";
    } catch (error) {
      console.error('Error fetching subtitle content:', error);
      return null;
    }
  }
}

module.exports = new YouTubeService();
