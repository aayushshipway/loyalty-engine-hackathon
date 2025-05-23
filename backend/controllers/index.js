const axios = require('axios');

const loginMerchant = async (req, res) => {
    try {
        const aRes = { success: false, message: 'There was some error in fetching stages', data: {} };

        aRes.success = true;
        aRes.message = 'Success';
        aRes.data.users = users;
        res.status(200).json(aRes);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Process failed' });
    }
}

module.exports = {
    loginMerchant
}