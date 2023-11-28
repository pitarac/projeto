const User = require('../models/User'); // Supondo que o modelo do usuário seja importado corretamente

const userService = {
    // Função para buscar informações de um usuário pelo CPF
    async getUserByCPF(cpf) {
        try {
            const user = await User.findOne({ where: { cpf } });
            return user;
        } catch (error) {
            throw new Error('Erro ao buscar usuário pelo CPF.', error);
        }
    },

    // Função para atualizar informações de um usuário pelo CPF
    async updateUserByCPF(cpf, userData) {
        try {
            const user = await User.findOne({ where: { cpf } });
            if (!user) {
                throw new Error('Usuário não encontrado.');
            }

            // Atualiza as informações do usuário
            await user.update(userData);

            return user;
        } catch (error) {
            throw new Error('Erro ao atualizar informações do usuário.', error);
        }
    }
};

module.exports = userService;
