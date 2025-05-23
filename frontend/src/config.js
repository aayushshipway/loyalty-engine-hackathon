const BACKEND_BASE_URL =
  window.location.hostname === 'localhost'
    ? process.env.REACT_APP_BACKEND_BASE_LOCAL
    : process.env.REACT_APP_BACKEND_BASE_REMOTE;

export default BACKEND_BASE_URL;