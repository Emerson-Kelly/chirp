export function fakeAuth(req, res, next) {
    const userId = req.headers["x-user-id"];
    if (userId) {
      req.user = { id: userId };
      return next();
    }
    return res.status(401).json({ error: "No auth token provided" });
  }
  