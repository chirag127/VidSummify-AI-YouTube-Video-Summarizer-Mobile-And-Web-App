const { supabaseClient } = require('../utils/supabase');
const { AppError } = require('../utils/error');

/**
 * Middleware to verify JWT token from Supabase Auth
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided or invalid format', 401));
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(new AppError('No token provided', 401));
    }
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !user) {
      return next(new AppError('Invalid or expired token', 401));
    }
    
    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed', 401));
  }
};

module.exports = {
  verifyToken
};
