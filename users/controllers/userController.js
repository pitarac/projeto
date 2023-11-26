const User = require('../models/User'); // Supondo que o modelo do usuário seja importado corretamente

const userController = {
    // Função para obter informações de um usuário pelo CPF
    async getUserByCPF(req, res) {
        const { cpf } = req.params;

        try {
            const user = await User.findOne({ where: { cpf } });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }

            return res.status(200).json({ user });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // Função para atualizar informações de um usuário pelo CPF
    async updateUserByCPF(req, res) {
        const { cpf } = req.params;
        const { email, birthDate } = req.body;

        try {
            const user = await User.findOne({ where: { cpf } });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }

            // Atualiza as informações do usuário
            user.email = email;
            user.birthDate = birthDate;

            await user.save();

            return res.status(200).json({ message: 'Informações do usuário atualizadas com sucesso.', user });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = userController;
