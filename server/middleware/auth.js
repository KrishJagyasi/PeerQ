const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Guest access - allows both authenticated and unauthenticated users (view only)
const guestAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// User access - requires authenticated user (can post and vote)
const userAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role === 'guest') {
      return res.status(403).json({ message: 'Guest users cannot perform this action' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Admin or owner access - allows admin or the resource owner
const adminOrOwner = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      await auth(req, res, () => {});
      
      if (req.user.role === 'admin') {
        return next();
      }
      
      const ownerId = getOwnerId(req);
      if (req.user._id.toString() === ownerId.toString()) {
        return next();
      }
      
      return res.status(403).json({ message: 'Access denied' });
    } catch (error) {
      res.status(401).json({ message: 'Authentication failed' });
    }
  };
};

// Permission-based middleware
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      await auth(req, res, () => {});
      
      const userRole = req.user.role;
      
      switch (permission) {
        case 'view':
          // All roles can view
          return next();
        case 'post':
          // Only users and admins can post
          if (userRole === 'guest') {
            return res.status(403).json({ message: 'Guest users cannot post content' });
          }
          return next();
        case 'vote':
          // Only users and admins can vote
          if (userRole === 'guest') {
            return res.status(403).json({ message: 'Guest users cannot vote' });
          }
          return next();
        case 'moderate':
          // Only admins can moderate
          if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required for moderation' });
          }
          return next();
        default:
          return res.status(403).json({ message: 'Invalid permission' });
      }
    } catch (error) {
      res.status(401).json({ message: 'Authentication failed' });
    }
  };
};

module.exports = { 
  auth, 
  optionalAuth, 
  adminAuth, 
  guestAuth, 
  userAuth, 
  adminOrOwner,
  requirePermission
}; 