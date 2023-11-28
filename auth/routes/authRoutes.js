const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


// Rota para registro de novo usuário
router.post('/register', async (req, res) => {
    const { cpf, email, birthDate, password } = req.body;

    try {
        const newUser = await authController.registerUser(cpf, email, birthDate, password);
        res.status(201).json({ message: 'Usuário registrado com sucesso.', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para autenticação de usuário
router.post('/login', authController.authenticateUser);

// Rota para logout de usuário
router.get('/logout', authController.logoutUser);

module.exports = router;
