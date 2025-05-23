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
        const scoreApiUrl = `${process.env.AIML_API_URL}/score-shipway`;
        const scoringResponse = await axios.post(scoreApiUrl, { merchant_id: merchantId });

        if (!scoringResponse.data || !scoringResponse.data.success) {
            return res.status(500).json({ success: false, message: 'Failed to fetch scoring data.' });
        }

        const { loyalty_score_shipway, churn_rate_shipway } = scoringResponse.data;

        return res.json({
            success: true,
            source: 'realtime',
            merchantId,
            loyalty_score_shipway,
            churn_rate_shipway,
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
        const scoreApiUrl = `${process.env.AIML_API_URL}/score-shipway`;
        const scoringResponse = await axios.post(scoreApiUrl, { merchant_id: merchantId });

        if (!scoringResponse.data || !scoringResponse.data.success) {
            return res.status(500).json({ success: false, message: 'Failed to fetch scoring data.' });
        }

        const { loyalty_score_shipway, churn_rate_shipway } = scoringResponse.data;

        return res.json({
            success: true,
            source: 'realtime',
            merchantId,
            loyalty_score_shipway,
            churn_rate_shipway,
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
        const scoreApiUrl = `${process.env.AIML_API_URL}/score-shipway`;
        const scoringResponse = await axios.post(scoreApiUrl, { merchant_id: merchantId });

        if (!scoringResponse.data || !scoringResponse.data.success) {
            return res.status(500).json({ success: false, message: 'Failed to fetch scoring data.' });
        }

        const { loyalty_score_shipway, churn_rate_shipway } = scoringResponse.data;

        return res.json({
            success: true,
            source: 'realtime',
            merchantId,
            loyalty_score_shipway,
            churn_rate_shipway,
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
        // Step 3: No synced data found – hit the scoring API
        const scoreApiUrl = `${process.env.AIML_API_URL}/score-grand`;
        const scoringResponse = await axios.post(scoreApiUrl, { merchant_id: merchantId });

        if (!scoringResponse.data || !scoringResponse.data.success) {
            return res.status(500).json({ success: false, message: 'Failed to fetch scoring data.' });
        }

        const { loyalty_score_shipway, churn_rate_shipway } = scoringResponse.data;

        return res.json({
            success: true,
            source: 'realtime',
            merchantId,
            loyalty_score_shipway,
            churn_rate_shipway,
        });
    } catch (err) {
        console.error('Error in getShipwayLoyalty:', err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

module.exports = { login, getShipwayLoyalty, getConvertwayLoyalty, getUnicommerceLoyalty, getGrandLoyalty };