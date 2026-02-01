import jwt from 'jsonwebtoken';
import Employee from '../models/employee.model.js';
import Organization from '../models/organization.model.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request
      req.user = decoded;
      
      next(); // Continue to next middleware/route
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check if user is organization admin
export const isOrganization = (req, res, next) => {
  if (req.user && req.user.role === 'organization') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Organization only.' });
  }
};

// Check if user is employee
export const isEmployee = (req, res, next) => {
  if (req.user && req.user.role === 'employee') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Employee only.' });
  }
};