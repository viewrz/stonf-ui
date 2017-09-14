export const getAuthToken = _ => localStorage.getItem('AUTH_TOKEN');
export const setAuthToken = t =>
  t
    ? localStorage.setItem('AUTH_TOKEN', t)
    : localStorage.removeItem('AUTH_TOKEN', t);

export const authMiddleware = {
  applyMiddleware: (req, next) => {
    const t = getAuthToken();
    if (t) {
      req.options.headers = req.options.headers || {};
      req.options.headers.authorization = `Bearer ${t}`;
    }
    next();
  }
};
