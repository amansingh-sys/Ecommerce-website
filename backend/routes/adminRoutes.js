const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const controller = require('../controllers/adminController');
router.use(protect, adminOnly);
router.get('/stats', controller.stats);
router.get('/products', controller.products);
router.get('/users', controller.users);
module.exports = router;
