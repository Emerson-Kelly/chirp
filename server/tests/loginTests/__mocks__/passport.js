export const authenticate = () => {
    return (req, res, next) => {
      // Skip real passport auth, pretend user is valid
      req.user = { id: 11122233, username: "test-user" };
      return next();
    };
  };
  
  export const initialize = () => {
    return (req, res, next) => next();
  };
  
  export const session = () => {
    return (req, res, next) => next();
  };
  
  export default {
    authenticate,
    initialize,
    session,
  };
  