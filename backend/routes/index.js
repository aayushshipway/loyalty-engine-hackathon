const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

router.post('/login', controller.login);
router.get('/merchant/shipway-loyalty', controller.getShipwayLoyalty);
router.get('/merchant/convertway-loyalty', controller.getConvertwayLoyalty);
router.get('/merchant/unicommerce-loyalty', controller.getUnicommerceLoyalty);
router.get('/merchant/grand-loyalty', controller.getGrandLoyalty);

module.exports = router;