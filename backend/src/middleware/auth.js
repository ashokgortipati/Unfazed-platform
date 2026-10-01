/**
 * Authentication and Role-based Authorization Middleware
 * Session-based authentication ONLY (No JWT tokens used per strict project requirements)
 */

export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access this resource.',
    });
  }
  next();
};

export const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}]. Current role: ${req.session.user.role}`,
      });
    }

    next();
  };
};

export const requireTherapist = requireRole('therapist');
export const requireClient = requireRole('client');
export const requireTherapistOrClient = requireRole(['therapist', 'client']);
