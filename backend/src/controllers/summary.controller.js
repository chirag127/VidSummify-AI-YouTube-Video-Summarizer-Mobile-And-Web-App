const youtubeService = require('../services/youtube.service');
const geminiService = require('../services/gemini.service');
const summaryService = require('../services/summary.service');
const { AppError, catchAsync } = require('../utils/error');

/**
 * Generate a summary for a YouTube video
 */
const generateSummary = catchAsync(async (req, res, next) => {
  const { videoUrl, summaryType, summaryLength } = req.body;
  const userId = req.user.id;

  if (!videoUrl) {
    return next(new AppError('Video URL is required', 400));
  }

  // Validate YouTube URL
  if (!youtubeService.isValidYouTubeUrl(videoUrl)) {
    return next(new AppError('Invalid YouTube URL', 400));
  }

  // Get video information (transcript, title, thumbnail)
  const videoInfo = await youtubeService.getVideoInfo(videoUrl);

  if (!videoInfo.transcript) {
    return next(new AppError('No transcript or captions available for this video', 404));
  }

  // Generate summary using Gemini
  const summaryText = await geminiService.generateSummary({
    transcript: videoInfo.transcript,
    title: videoInfo.title,
    summaryType,
    summaryLength
  });

  // Save summary to database
  const summary = await summaryService.createSummary({
    videoUrl,
    videoTitle: videoInfo.title,
    videoThumbnail: videoInfo.thumbnail,
    summaryText,
    summaryType,
    summaryLength
  }, userId);

  res.status(201).json({
    status: 'success',
    data: {
      summary
    }
  });
});

/**
 * Get all summaries for a user
 */
const getUserSummaries = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const summaries = await summaryService.getUserSummaries(userId);

  res.status(200).json({
    status: 'success',
    results: summaries.length,
    data: {
      summaries
    }
  });
});

/**
 * Get a summary by ID
 */
const getSummaryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const summary = await summaryService.getSummaryById(id, userId);

  if (!summary) {
    return next(new AppError('Summary not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      summary
    }
  });
});

/**
 * Delete a summary
 */
const deleteSummary = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  await summaryService.deleteSummary(id, userId);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Update a summary
 */
const updateSummary = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { videoUrl, summaryType, summaryLength } = req.body;

  if (!videoUrl) {
    return next(new AppError('Video URL is required', 400));
  }

  // Validate YouTube URL
  if (!youtubeService.isValidYouTubeUrl(videoUrl)) {
    return next(new AppError('Invalid YouTube URL', 400));
  }

  // Get video information (transcript, title, thumbnail)
  const videoInfo = await youtubeService.getVideoInfo(videoUrl);

  if (!videoInfo.transcript) {
    return next(new AppError('No transcript or captions available for this video', 404));
  }

  // Generate new summary using Gemini
  const summaryText = await geminiService.generateSummary({
    transcript: videoInfo.transcript,
    title: videoInfo.title,
    summaryType,
    summaryLength
  });

  // Update summary in database
  const summary = await summaryService.updateSummary(id, {
    video_url: videoUrl,
    video_title: videoInfo.title,
    video_thumbnail_url: videoInfo.thumbnail,
    summary_text: summaryText,
    summary_type: summaryType,
    summary_length: summaryLength
  }, userId);

  res.status(200).json({
    status: 'success',
    data: {
      summary
    }
  });
});

module.exports = {
  generateSummary,
  getUserSummaries,
  getSummaryById,
  deleteSummary,
  updateSummary
};
