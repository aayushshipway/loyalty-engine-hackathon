// loginController.js
const pool = require('./../utils/db');
const { Buffer } = require('buffer');

const login = async (req, res) => {
  try {
    const { email, password, type } = req.body || {};

    if (!email || !password || !type) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const table = type === 'user' ? 'users' : 'merchants';

    // Base64 encode the password
    const encodedPassword = Buffer.from(password).toString('base64');

    // Query the appropriate table
    const [rows] = await pool.query(
      `SELECT * FROM \`${table}\` WHERE email = ? AND password = ? LIMIT 1`,
      [email, encodedPassword]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];
    // Return basic login response
    res.json({
      success: true,
      message: 'Login Success',
      type: type,
      data: {
        id: type === 'merchant' ? user.merchant_id : user.user_id,
        email: user.email,
        name: type === 'merchant' ? 'Merchant' : user.name,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { login };