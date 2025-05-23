const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');
const adminController = require('../controllers/admin');

router.post('/login', controller.login);
router.get('/merchant/shipway-loyalty', controller.getShipwayLoyalty);
router.get('/merchant/convertway-loyalty', controller.getConvertwayLoyalty);
router.get('/merchant/unicommerce-loyalty', controller.getUnicommerceLoyalty);
router.get('/merchant/grand-loyalty', controller.getGrandLoyalty);
router.get('/merchant/shipway-loyalty-history', controller.getShipwayLoyaltyHistory);
router.get('/merchant/convertway-loyalty-history', controller.getConvertwayLoyaltyHistory);
router.get('/merchant/unicommerce-loyalty-history', controller.getUnicommerceLoyaltyHistory);
router.get('/merchant/grand-loyalty-history', controller.getGrandLoyaltyHistory);

router.get('/user/top-grand-loyalty', adminController.getTopGrandLoyalty);
router.get('/user/shipway-high-loyalty-churn', adminController.getShipwayHighLoyaltyChurn);
router.get('/user/unicommerce-high-loyalty-churn', adminController.getUnicommerceHighLoyaltyChurn);
router.get('/user/convertway-high-loyalty-churn', adminController.getConvertwayHighLoyaltyChurn);

router.get('/user/shipway-average-loyalty-high-churn', adminController.getShipwayAverageLoyaltyHighChurn);
router.get('/user/unicommerce-average-loyalty-high-churn', adminController.getUnicommerceAverageLoyaltyHighChurn);
router.get('/user/convertway-average-loyalty-high-churn', adminController.getConvertwayAverageLoyaltyHighChurn);

module.exports = router;