const { Router } = require('express');
import adegaRoutes = require('./adegaRoutes');
import userRoutes = require('./userRoutes');
import avalicaoRoutes = require('./avaliacaoRoutes');

const router = Router();

router.use('/adegas', adegaRoutes);
router.use('/usuario', userRoutes);
router.user('/avaliacao', avalicaoRoutes);

export = router;
