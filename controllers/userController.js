const User = require('../models/User'); // Importe o modelo de usuário

// Controlador para buscar todos os usuários
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll(); // Busca todos os usuários no banco de dados
        res.status(200).json(users); // Retorna os usuários em formato JSON
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
};

// Controlador para buscar um usuário por ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id); // Busca um usuário pelo ID no banco de dados
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json(user); // Retorna o usuário em formato JSON
    } catch (error) {
        console.error('Erro ao buscar o usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar o usuário.' });
    }
};

// Outras funções do controlador podem incluir criar, atualizar e excluir usuários

module.exports = {
    getAllUsers,
    getUserById,
    // ... outras funções do controlador
};
