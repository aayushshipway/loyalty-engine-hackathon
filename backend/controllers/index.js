// loginController.js
const pool = require('./../utils/db');
const { Buffer } = require('buffer');
const axios = require('axios');

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

const getShipwayLoyalty = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        // Step 1: Get merchant_id using email
        const [merchantResult] = await pool.query(
            'SELECT merchant_id FROM merchants WHERE email = ?',
            [email]
        );

        if (merchantResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Merchant not found.' });
        }

        const merchantId = merchantResult[0].merchant_id;

        // Step 2: Get the latest shipway_data if it's synced
        const [dataResult] = await pool.query(
            `SELECT loyalty_score_shipway, churn_rate_shipway
       FROM merchants_scores
       WHERE merchant_id = ? AND sync_till_shipway >= NOW()
       ORDER BY sync_till_shipway DESC
       LIMIT 1`,
            [merchantId]
        );
        if (dataResult.length > 0) {
            // Use cached/synced data
            return res.json({
                success: true,
                source: 'database',
                merchantId,
                loyalty_score_shipway: dataResult[0].loyalty_score_shipway,
                churn_rate_shipway: dataResult[0].churn_rate_shipway,
            });
        };
        // Step 3: No synced data found – hit the scoring API
        const scoreApiUrl = `${process.env.AIML_API_URL}/loyalty-score?email=${email}&platform=shipway`;
        const scoringResponse = await axios.get(scoreApiUrl, {
          params: { email } // Correct way to pass query parameters
        });

        if (!scoringResponse) {
            return res.status(500).json({ success: false, message: 'Failed to fetch scoring data.' });
        }
        const loyalty_score_shipway = scoringResponse.loyalty_score || scoringResponse.data.loyalty_score;
        const churn_rate_shipway = scoringResponse.merchant_churn_rate || scoringResponse.data.merchant_churn_rate;
        return res.json({
            success: true,
            source: 'realtime',
            merchantId,
            loyalty_score_shipway,
            churn_rate_shipway
        });
    } catch (err) {
        console.error('Error in getShipwayLoyalty:', err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getConvertwayLoyalty = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        // Step 1: Get merchant_id using email
        const [merchantResult] = await pool.query(
            'SELECT merchant_id FROM merchants WHERE email = ?',
            [email]
        );

        if (merchantResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Merchant not found.' });
        }

        const merchantId = merchantResult[0].merchant_id;

        // Step 2: Get the latest shipway_data if it's synced
        const [dataResult] = await pool.query(
            `SELECT loyalty_score_convertway, churn_rate_convertway
       FROM merchants_scores
       WHERE merchant_id = ? AND sync_till_shipway >= NOW()
       ORDER BY sync_till_shipway DESC
       LIMIT 1`,
            [merchantId]
        );
        if (dataResult.length > 0) {
            // Use cached/synced data
            return res.json({
                success: true,
                source: 'database',
                merchantId,
                loyalty_score_convertway: dataResult[0].loyalty_score_convertway,
                churn_rate_convertway: dataResult[0].churn_rate_convertway,
            });
        };
        const scoreApiUrl = `${process.env.AIML_API_URL}/loyalty-score?email=${email}&platform=convertway`;
        const scoringResponse = await axios.get(scoreApiUrl, {
          params: { email } // Correct way to pass query parameters
        });

        if (!scoringResponse) {
            return res.status(500).json({ success: false, message: 'Failed to fetch scoring data.' });
        }

        const loyalty_score_convertway = scoringResponse.loyalty_score || scoringResponse.data.loyalty_score;
        const churn_rate_convertway = scoringResponse.merchant_churn_rate || scoringResponse.data.merchant_churn_rate;

        return res.json({
            success: true,
            source: 'realtime',
            merchantId,
            loyalty_score_convertway,
            churn_rate_convertway
        });
    } catch (err) {
        console.error('Error in getConvertwayLoyalty:', err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getUnicommerceLoyalty = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        // Step 1: Get merchant_id using email
        const [merchantResult] = await pool.query(
            'SELECT merchant_id FROM merchants WHERE email = ?',
            [email]
        );

        if (merchantResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Merchant not found.' });
        }

        const merchantId = merchantResult[0].merchant_id;

        // Step 2: Get the latest shipway_data if it's synced
        const [dataResult] = await pool.query(
            `SELECT loyalty_score_unicommerce, churn_rate_unicommerce
       FROM merchants_scores
       WHERE merchant_id = ? AND sync_till_shipway >= NOW()
       ORDER BY sync_till_shipway DESC
       LIMIT 1`,
            [merchantId]
        );
        if (dataResult.length > 0) {
            // Use cached/synced data
            return res.json({
                success: true,
                source: 'database',
                merchantId,
                loyalty_score_unicommerce: dataResult[0].loyalty_score_unicommerce,
                churn_rate_unicommerce: dataResult[0].churn_rate_unicommerce,
            });
        };
        const scoreApiUrl = `${process.env.AIML_API_URL}/loyalty-score?email=${email}&platform=unicommerce`;
        const scoringResponse = await axios.get(scoreApiUrl, {
          params: { email } // Correct way to pass query parameters
        });

        if (!scoringResponse) {
            return res.status(500).json({ success: false, message: 'Failed to fetch scoring data.' });
        }

        const loyalty_score_unicommerce = scoringResponse.loyalty_score || scoringResponse.data.loyalty_score;
        const churn_rate_unicommerce = scoringResponse.merchant_churn_rate || scoringResponse.data.merchant_churn_rate;

        return res.json({
            success: true,
            source: 'realtime',
            merchantId,
            loyalty_score_unicommerce,
            churn_rate_unicommerce
        });
    } catch (err) {
        console.error('Error in getUnicommerceLoyalty:', err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getGrandLoyalty = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        // Step 1: Get merchant_id using email
        const [merchantResult] = await pool.query(
            'SELECT merchant_id FROM merchants WHERE email = ?',
            [email]
        );

        if (merchantResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Merchant not found.' });
        }

        const merchantId = merchantResult[0].merchant_id;

        // Step 2: Get the latest shipway_data if it's synced
        const [dataResult] = await pool.query(
            `SELECT grand_score, grand_badge
       FROM merchants_scores
       WHERE merchant_id = ? AND sync_till_grand >= NOW()
       ORDER BY sync_till_grand DESC
       LIMIT 1`,
            [merchantId]
        );
        if (dataResult.length > 0) {
            // Use cached/synced data
            return res.json({
                success: true,
                source: 'database',
                merchantId,
                grand_score: dataResult[0].grand_score,
                grand_badge: dataResult[0].grand_badge,
            });
        };
        const scoreApiUrl = `${process.env.AIML_API_URL}/loyalty-score/multi-platform`;
        const scoringResponse = await axios.get(scoreApiUrl, {
          params: { email } // Correct way to pass query parameters
        });
        if (!scoringResponse || !(scoringResponse.data.grand_loyalty_score && scoringResponse.grand_loyalty_score)) {
            return res.status(500).json({ success: false, message: 'Failed to fetch scoring data.' });
        }
        const grand_score = scoringResponse.data.grand_loyalty_score || scoringResponse.grand_loyalty_score;
        const grand_badge = scoringResponse.data.grand_badge;
        return res.json({
            success: true,
            source: 'realtime',
            merchantId,
            grand_score,
            grand_badge
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch scoring data.' });
    }
}


const getShipwayLoyaltyHistory = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    console.warn('Email missing in request');
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    console.log(`Fetching merchant_id for email: ${email}`);
    const [merchantResult] = await pool.query('SELECT merchant_id FROM merchants WHERE email = ?', [email]);

    if (merchantResult.length === 0) {
      console.warn('No merchant found for email:', email);
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }
    const merchantId = merchantResult[0].merchant_id;
    const [historyResult] = await pool.query(
      `SELECT merchant_id, from_date, till_date, loyalty_score_shipway 
       FROM merchants_scores_history 
       WHERE merchant_id = ? AND loyalty_score_shipway IS NOT NULL
       ORDER BY from_date ASC`,
      [merchantId]
    );

    if (historyResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Merchant history not found' });
    }

    const enhancedHistory = historyResult.map(entry => {
      const fromDate = new Date(entry.from_date);
      const isValidDate = !isNaN(fromDate.getTime());

      return {
        ...entry,
        month: isValidDate ? fromDate.toLocaleString('default', { month: 'long' }) : null,
        year: isValidDate ? fromDate.getFullYear() : null
      };
    });

    return res.json({
      success: true,
      merchantId,
      history: enhancedHistory
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getConvertwayLoyaltyHistory = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    console.warn('Email missing in request');
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    console.log(`Fetching merchant_id for email: ${email}`);
    const [merchantResult] = await pool.query('SELECT merchant_id FROM merchants WHERE email = ?', [email]);

    if (merchantResult.length === 0) {
      console.warn('No merchant found for email:', email);
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }
    const merchantId = merchantResult[0].merchant_id;
    const [historyResult] = await pool.query(
      `SELECT merchant_id, from_date, till_date, loyalty_score_convertway
       FROM merchants_scores_history 
       WHERE merchant_id = ? AND loyalty_score_convertway IS NOT NULL
       ORDER BY from_date ASC`,
      [merchantId]
    );

    if (historyResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Merchant history not found' });
    }

    const enhancedHistory = historyResult.map(entry => {
      const fromDate = new Date(entry.from_date);
      const isValidDate = !isNaN(fromDate.getTime());

      return {
        ...entry,
        month: isValidDate ? fromDate.toLocaleString('default', { month: 'long' }) : null,
        year: isValidDate ? fromDate.getFullYear() : null
      };
    });

    return res.json({
      success: true,
      merchantId,
      history: enhancedHistory
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUnicommerceLoyaltyHistory = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    console.warn('Email missing in request');
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    console.log(`Fetching merchant_id for email: ${email}`);
    const [merchantResult] = await pool.query('SELECT merchant_id FROM merchants WHERE email = ?', [email]);

    if (merchantResult.length === 0) {
      console.warn('No merchant found for email:', email);
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }
    const merchantId = merchantResult[0].merchant_id;
    const [historyResult] = await pool.query(
      `SELECT merchant_id, from_date, till_date, loyalty_score_unicommerce
       FROM merchants_scores_history 
       WHERE merchant_id = ? AND loyalty_score_unicommerce IS NOT NULL 
       ORDER BY from_date ASC`,
      [merchantId]
    );

    if (historyResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Merchant history not found' });
    }

    console.log("historyResult",historyResult);

    const enhancedHistory = historyResult.map(entry => {
      const fromDate = new Date(entry.from_date);
      const isValidDate = !isNaN(fromDate.getTime());

      return {
        ...entry,
        month: isValidDate ? fromDate.toLocaleString('default', { month: 'long' }) : null,
        year: isValidDate ? fromDate.getFullYear() : null
      };
    });

    return res.json({
      success: true,
      merchantId,
      history: enhancedHistory
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getGrandLoyaltyHistory = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    console.warn('Email missing in request');
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    console.log(`Fetching merchant_id for email: ${email}`);
    const [merchantResult] = await pool.query('SELECT merchant_id FROM merchants WHERE email = ?', [email]);

    if (merchantResult.length === 0) {
      console.warn('No merchant found for email:', email);
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }
    const merchantId = merchantResult[0].merchant_id;
    const [historyResult] = await pool.query(
      `SELECT merchant_id, from_date, till_date, grand_score
       FROM merchants_scores_history 
       WHERE merchant_id = ? AND grand_score IS NOT NULL 
       ORDER BY from_date ASC`,
      [merchantId]
    );

    if (historyResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Merchant history not found' });
    }


    const enhancedHistory = historyResult.map(entry => {
      const fromDate = new Date(entry.from_date);
      const isValidDate = !isNaN(fromDate.getTime());

      return {
        ...entry,
        month: isValidDate ? fromDate.toLocaleString('default', { month: 'long' }) : null,
        year: isValidDate ? fromDate.getFullYear() : null
      };
    });

    return res.json({
      success: true,
      merchantId,
      history: enhancedHistory
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { login, getShipwayLoyalty, getConvertwayLoyalty, getUnicommerceLoyalty, getGrandLoyalty, getShipwayLoyaltyHistory, getConvertwayLoyaltyHistory, getUnicommerceLoyaltyHistory, getGrandLoyaltyHistory };