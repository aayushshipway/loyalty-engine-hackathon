export const setLSWithExpiry = (key, value, ttl = process.env.REACT_APP_LOGIN_EXPIRY_MS) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  console.log("JSON.stringify(item)",JSON.stringify(item));
  localStorage.setItem(key, JSON.stringify(item));
};

export const getLSWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};