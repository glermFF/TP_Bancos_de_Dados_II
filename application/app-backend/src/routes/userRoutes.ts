const { Router } = require('express');
import userController = require("../controllers/userController");

const router = Router()

router.post('/new', userController.createUser)
router.put('/:id', userController.updateUser)

export = router