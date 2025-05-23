const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

router.post('/merchant/login', controller.loginMerchant);

module.exports = router;