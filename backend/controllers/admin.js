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

const getShipwayAverageLoyaltyHighChurn = async (req, res) => {
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

const getConvertwayAverageLoyaltyHighChurn = async (req, res) => {
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

const getUnicommerceAverageLoyaltyHighChurn = async (req, res) => {
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

const getTopShipwayLoyalty = async (req, res) => {
    try {
        // Step 1: Fetch top 50 merchants by loyalty score
        const [rows] = await pool.query(
            `SELECT merchant_id, loyalty_score_shipway 
       FROM merchants_scores 
       WHERE loyalty_score_shipway IS NOT NULL 
       ORDER BY loyalty_score_shipway DESC 
       LIMIT 5`
        );

        // Step 2: For each merchant, get total orders and billing amount
        const enrichedMerchants = await Promise.all(
            rows.map(async (merchant) => {
                const [summary] = await pool.query(
                    `SELECT 
             SUM(order_count) AS total_orders, 
             SUM(billing_amount) AS total_billing 
           FROM data_shipway 
           WHERE merchant_id = ?`,
                    [merchant.merchant_id]
                );

                return {
                    ...merchant,
                    total_orders: summary[0].total_orders || 0,
                    total_billing: summary[0].total_billing || 0,
                };
            })
        );

        res.json({
            success: true,
            data: enrichedMerchants,
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getTopConvertwayLoyalty = async (req, res) => {
    try {
        // Step 1: Fetch top 50 merchants by loyalty score
        const [rows] = await pool.query(
            `SELECT merchant_id, loyalty_score_convertway
       FROM merchants_scores 
       WHERE loyalty_score_convertway IS NOT NULL 
       ORDER BY loyalty_score_convertway DESC 
       LIMIT 5`
        );

        // Step 2: For each merchant, get total orders and billing amount
        const enrichedMerchants = await Promise.all(
            rows.map(async (merchant) => {
                const [summary] = await pool.query(
                    `SELECT 
             SUM(order_count) AS total_orders, 
             SUM(billing_amount) AS total_billing 
           FROM data_convertway
           WHERE merchant_id = ?`,
                    [merchant.merchant_id]
                );

                return {
                    ...merchant,
                    total_orders: summary[0].total_orders || 0,
                    total_billing: summary[0].total_billing || 0,
                };
            })
        );

        res.json({
            success: true,
            data: enrichedMerchants,
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getTopUnicommerceLoyalty = async (req, res) => {
    try {
        // Step 1: Fetch top 50 merchants by loyalty score
        const [rows] = await pool.query(
            `SELECT merchant_id, loyalty_score_unicommerce 
       FROM merchants_scores 
       WHERE loyalty_score_unicommerce IS NOT NULL 
       ORDER BY loyalty_score_unicommerce DESC 
       LIMIT 5`
        );

        // Step 2: For each merchant, get total orders and billing amount
        const enrichedMerchants = await Promise.all(
            rows.map(async (merchant) => {
                const [summary] = await pool.query(
                    `SELECT 
             SUM(order_count) AS total_orders, 
             SUM(billing_amount) AS total_billing 
           FROM data_unicommerce 
           WHERE merchant_id = ?`,
                    [merchant.merchant_id]
                );

                return {
                    ...merchant,
                    total_orders: summary[0].total_orders || 0,
                    total_billing: summary[0].total_billing || 0,
                };
            })
        );

        res.json({
            success: true,
            data: enrichedMerchants,
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateShipwayMerchantStats = async (req, res) => {
    const data = req.body;

    const { merchant_id, from_date, till_date, ...fields } = data;

    // Validate required fields
    if (!merchant_id || !from_date || !till_date) {
        return res.status(400).json({
            success: false,
            message: 'merchant_id, from_date, and till_date are required',
        });
    }

    // Clean the fields — remove undefined, null, or empty string values
    const cleanedFields = {};
    for (const key in fields) {
        const value = fields[key];
        if (value !== undefined && value !== null && value !== '') {
            cleanedFields[key] = value;
        }
    }

    if (Object.keys(cleanedFields).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'At least one additional field with a non-empty value is required',
        });
    }

    const additiveFields = [
        'order_count', 'billing_amount', 'margin_amount', 'services_amount',
        'delayed_orders', 'undelivered_orders', 'returned_orders', 'complaint_count'
    ];

    const overwriteFields = [
        'nps_score', 'wallet_share', 'average_resolution_tat'
    ];

    const whereClause = `merchant_id = ? AND from_date = ? AND till_date = ?`;
    const whereValues = [merchant_id, from_date, till_date];

    try {
        const [existingRows] = await pool.execute(
            `SELECT * FROM data_shipway WHERE ${whereClause}`,
            whereValues
        );

        if (existingRows.length > 0) {
            const existing = existingRows[0];

            const updatedValues = {};
            for (const key of Object.keys(cleanedFields)) {
                if (additiveFields.includes(key)) {
                    updatedValues[key] = Number(existing[key] || 0) + Number(cleanedFields[key]);
                } else if (overwriteFields.includes(key)) {
                    updatedValues[key] = cleanedFields[key];
                }
            }

            if (Object.keys(updatedValues).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update after cleaning.',
                });
            }

            const updateQuery = `
                UPDATE data_shipway
                SET ${Object.keys(updatedValues).map(k => `${k} = ?`).join(', ')}
                WHERE ${whereClause}
            `;

            await pool.execute(updateQuery, [...Object.values(updatedValues), ...whereValues]);

            return res.json({ success: true, message: 'Shipway data updated successfully' });

        } else {
            const insertFields = ['merchant_id', 'from_date', 'till_date', ...Object.keys(cleanedFields)];
            const insertValues = [merchant_id, from_date, till_date, ...Object.values(cleanedFields)];

            const insertQuery = `
                INSERT INTO data_shipway (${insertFields.join(', ')})
                VALUES (${insertFields.map(() => '?').join(', ')})
            `;

            await pool.execute(insertQuery, insertValues);

            return res.json({ success: true, message: 'Shipway data inserted successfully' });
        }

    } catch (err) {
        console.error('Error updating shipway data:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


const updateConvertwayMerchantStats = async (req, res) => {
    const data = req.body;

    const { merchant_id, from_date, till_date, ...fields } = data;

    // Validate required fields
    if (!merchant_id || !from_date || !till_date) {
        return res.status(400).json({
            success: false,
            message: 'merchant_id, from_date, and till_date are required',
        });
    }

    // Clean the fields — remove undefined, null, or empty string values
    const cleanedFields = {};
    for (const key in fields) {
        const value = fields[key];
        if (value !== undefined && value !== null && value !== '') {
            cleanedFields[key] = value;
        }
    }

    if (Object.keys(cleanedFields).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'At least one additional field with a non-empty value is required',
        });
    }

    const whereClause = `merchant_id = ? AND from_date = ? AND till_date = ?`;
    const whereValues = [merchant_id, from_date, till_date];

    try {
        const [existingRows] = await pool.execute(
            `SELECT * FROM data_convertway WHERE ${whereClause}`,
            whereValues
        );

        if (existingRows.length > 0) {
            const existing = existingRows[0];
            const updatedValues = {};

            for (const key of Object.keys(cleanedFields)) {
                updatedValues[key] = cleanedFields[key];
            }

            const updateQuery = `
                UPDATE data_convertway
                SET ${Object.keys(updatedValues).map(k => `${k} = ?`).join(', ')}
                WHERE ${whereClause}
            `;

            await pool.execute(updateQuery, [...Object.values(updatedValues), ...whereValues]);

            return res.json({ success: true, message: 'Convertway data updated successfully' });

        } else {
            const insertFields = ['merchant_id', 'from_date', 'till_date', ...Object.keys(cleanedFields)];
            const insertValues = [merchant_id, from_date, till_date, ...Object.values(cleanedFields)];

            const insertQuery = `
                INSERT INTO data_convertway (${insertFields.join(', ')})
                VALUES (${insertFields.map(() => '?').join(', ')})
            `;

            await pool.execute(insertQuery, insertValues);

            return res.json({ success: true, message: 'Convertway data inserted successfully' });
        }

    } catch (err) {
        console.error('Convertway update error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


const updateUnicommerceMerchantStats = async (req, res) => {
    const data = req.body;

    const { merchant_id, from_date, till_date, ...rest } = data;

    if (!merchant_id || !from_date || !till_date) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Remove keys with '', null, or undefined values
    const cleanedFields = {};
    for (const key in rest) {
        const value = rest[key];
        if (value !== '' && value !== null && value !== undefined) {
            cleanedFields[key] = value;
        }
    }

    const whereClause = `merchant_id = ? AND from_date = ? AND till_date = ?`;
    const whereValues = [merchant_id, from_date, till_date];

    try {
        const [existingRows] = await pool.execute(
            `SELECT * FROM data_unicommerce WHERE ${whereClause}`,
            whereValues
        );

        if (existingRows.length > 0) {
            const existing = existingRows[0];
            const updated = {};

            for (const key in cleanedFields) {
                if (
                    ['order_count', 'billing_amount', 'margin_amount', 'services_amount', 'complaint_count'].includes(key)
                ) {
                    updated[key] = Number(existing[key] || 0) + Number(cleanedFields[key] || 0);
                } else {
                    updated[key] = cleanedFields[key];
                }
            }

            if (Object.keys(updated).length === 0) {
                return res.status(400).json({ success: false, message: 'No valid fields to update.' });
            }

            await pool.execute(
                `UPDATE data_unicommerce
                 SET ${Object.keys(updated).map(key => `${key} = ?`).join(', ')}
                 WHERE ${whereClause}`,
                [...Object.values(updated), ...whereValues]
            );

            return res.json({ success: true, message: 'Unicommerce data updated successfully' });

        } else {
            const insertFields = ['merchant_id', 'from_date', 'till_date', ...Object.keys(cleanedFields)];
            const insertValues = [merchant_id, from_date, till_date, ...Object.values(cleanedFields)];

            await pool.execute(
                `INSERT INTO data_unicommerce (${insertFields.join(', ')})
                 VALUES (${insertFields.map(() => '?').join(', ')})`,
                insertValues
            );

            return res.json({ success: true, message: 'Unicommerce data inserted successfully' });
        }

    } catch (err) {
        console.error('Error updating unicommerce data:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { updateUnicommerceMerchantStats, updateConvertwayMerchantStats, updateShipwayMerchantStats, getTopConvertwayLoyalty, getTopUnicommerceLoyalty, getTopShipwayLoyalty, getTopGrandLoyalty, getShipwayHighLoyaltyChurn, getConvertwayHighLoyaltyChurn, getUnicommerceHighLoyaltyChurn, getShipwayAverageLoyaltyHighChurn, getConvertwayAverageLoyaltyHighChurn, getUnicommerceAverageLoyaltyHighChurn };