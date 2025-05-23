const pool = require('./../utils/db');

const getTopGrandLoyalty = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT merchant_id, grand_score, grand_badge 
        FROM merchants_scores 
        WHERE grand_score IS NOT NULL 
        ORDER BY grand_score DESC 
        LIMIT 50`
        );

        res.json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getShipwayHighLoyaltyChurn = async (req, res) => {
    try {
        const query = `
      SELECT merchant_id, loyalty_score_shipway, churn_rate_shipway
      FROM merchants_scores
      WHERE loyalty_score_shipway IS NOT NULL AND churn_rate_shipway IS NOT NULL
      ORDER BY loyalty_score_shipway DESC, churn_rate_shipway DESC
      LIMIT 10;
    `;

        const [rows] = await pool.query(query);

        return res.json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error('Error fetching top shipway merchants:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}

const getUnicommerceHighLoyaltyChurn = async (req, res) => {
    try {
        const query = `
      SELECT merchant_id, loyalty_score_unicommerce, churn_rate_unicommerce
      FROM merchants_scores
      WHERE loyalty_score_unicommerce IS NOT NULL AND churn_rate_unicommerce IS NOT NULL
      ORDER BY loyalty_score_unicommerce DESC, churn_rate_unicommerce DESC
      LIMIT 10;
    `;

        const [rows] = await pool.query(query);

        return res.json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error('Error fetching top shipway merchants:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}

const getConvertwayHighLoyaltyChurn = async (req, res) => {
    try {
        const query = `
      SELECT merchant_id, loyalty_score_convertway, churn_rate_convertway
      FROM merchants_scores
      WHERE loyalty_score_convertway IS NOT NULL AND churn_rate_convertway IS NOT NULL
      ORDER BY loyalty_score_convertway DESC, churn_rate_convertway DESC
      LIMIT 10;
    `;

        const [rows] = await pool.query(query);

        return res.json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error('Error fetching top shipway merchants:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
}

const getShipwayAverageLoyaltyHighChurn = async (req,res) => {
    try {
    const [rows] = await pool.query(`
      SELECT merchant_id, loyalty_score_shipway, churn_rate_shipway
      FROM merchants_scores
      WHERE loyalty_score_shipway BETWEEN 20 AND 40
        AND churn_rate_shipway > 40
      ORDER BY churn_rate_shipway DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching average-loyalty high-churn merchants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

const getConvertwayAverageLoyaltyHighChurn = async (req,res) => {
    try {
    const [rows] = await pool.query(`
      SELECT merchant_id, loyalty_score_convertway, churn_rate_convertway
      FROM merchants_scores
      WHERE loyalty_score_convertway BETWEEN 20 AND 40
        AND churn_rate_convertway > 40
      ORDER BY churn_rate_convertway DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching average-loyalty high-churn merchants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

const getUnicommerceAverageLoyaltyHighChurn = async (req,res) => {
    try {
    const [rows] = await pool.query(`
      SELECT merchant_id, loyalty_score_unicommerce, churn_rate_unicommerce
      FROM merchants_scores
      WHERE loyalty_score_unicommerce BETWEEN 20 AND 40
        AND churn_rate_unicommerce > 40
      ORDER BY churn_rate_unicommerce DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching average-loyalty high-churn merchants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = { getTopGrandLoyalty, getShipwayHighLoyaltyChurn, getConvertwayHighLoyaltyChurn, getUnicommerceHighLoyaltyChurn, getShipwayAverageLoyaltyHighChurn, getConvertwayAverageLoyaltyHighChurn, getUnicommerceAverageLoyaltyHighChurn };