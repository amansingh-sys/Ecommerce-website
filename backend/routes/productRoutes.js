const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const controller = require('../controllers/productController');
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', protect, adminOnly, controller.create);
router.put('/:id', protect, adminOnly, controller.update);
router.delete('/:id', protect, adminOnly, controller.archive);
module.exports = router;
