const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Supondo que o modelo do usuário seja importado corretamente

const authService = {
    // Função para registrar um novo usuário usando CPF como identificador
    async registerUser(cpf, password) {
        try {
            // Verifica se o usuário (CPF) já existe
            const existingUser = await User.findOne({ where: { cpf } });
            if (existingUser) {
                throw new Error('CPF já está em uso.');
            }

            // Criptografa a senha antes de salvar no banco de dados
            const hashedPassword = await bcrypt.hash(password, 10);

            // Cria um novo usuário com o CPF e senha
            const newUser = await User.create({ cpf, password: hashedPassword });
            return newUser;
        } catch (error) {
            throw new Error('Ocorreu um erro durante o registro.', error);
        }
    },

    // Função para autenticar um usuário usando CPF como identificador
    async authenticateUser(cpf, password) {
        try {
            // Procura pelo usuário (CPF) no banco de dados
            const user = await User.findOne({ where: { cpf } });
            if (!user) {
                throw new Error('Credenciais inválidas.');
            }

            // Compara a senha fornecida com a senha armazenada no banco de dados
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Credenciais inválidas.');
            }

            return user; // Retorna o usuário autenticado
        } catch (error) {
            throw new Error('Ocorreu um erro durante a autenticação.', error);
        }
    }
};

module.exports = authService;
