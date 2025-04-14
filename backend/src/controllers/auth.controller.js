const { supabaseClient } = require('../utils/supabase');
const { AppError, catchAsync } = require('../utils/error');

/**
 * Register a new user
 */
const register = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });

  if (error) {
    return next(new AppError(error.message, 400));
  }

  res.status(201).json({
    status: 'success',
    data: {
      user: data.user,
      session: data.session
    }
  });
});

/**
 * Login a user
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return next(new AppError(error.message, 401));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: data.user,
      session: data.session
    }
  });
});

/**
 * Logout a user
 */
const logout = catchAsync(async (req, res, next) => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    return next(new AppError(error.message, 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.CORS_ORIGIN}/reset-password`,
  });

  if (error) {
    return next(new AppError(error.message, 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Password reset email sent'
  });
});

module.exports = {
  register,
  login,
  logout,
  resetPassword
};
