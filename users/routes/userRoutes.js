const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../auth/controllers/authController');
const User = require('../../models/userModel'); // Importando o modelo de usuário

// Rota protegida para atualizar informações do usuário pelo CPF
router.put('/update/:cpf', authController.ensureAuthenticated, async (req, res) => {
    const { cpf } = req.params;
    const { email, birthDate } = req.body;

    try {
        const updatedUser = await userController.updateUserByCPF(cpf, { email, birthDate });
        res.status(200).json({ message: 'Informações do usuário atualizadas com sucesso.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota protegida para obter informações do usuário pelo CPF
router.get('/:cpf', authController.ensureAuthenticated, async (req, res) => {
    const { cpf } = req.params;

    try {
        const user = await userController.getUserByCPF(cpf);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
