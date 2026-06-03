const { Router } = require('express');
import avaliacaoController = require("../controllers/avaliacaoController");

const router = Router()

router.get('/', avaliacaoController.listAvaliacoes)
router.post('/new', avaliacaoController.createAvaliacao)

export = router