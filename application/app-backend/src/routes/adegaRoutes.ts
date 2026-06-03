const { Router } = require('express');
import adegaController = require('../controllers/adegaController');

const router = Router();

router.get('/', adegaController.listAdegas);
router.post('/new', adegaController.createAdega);
router.put('/:id', adegaController.updateAdega);

export = router;