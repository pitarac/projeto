const User = require('../models/User'); // Importe o modelo do usuário

// Middleware para recuperar o CPF do usuário
const fetchUserCPF = async (req, res, next) => {
  try {
    // Aqui, você pode recuperar o ID do usuário de onde quer que esteja armazenado na sessão ou token
    const userId = req.user.id; // Supondo que você tenha o ID do usuário armazenado na propriedade "id" do objeto "user" na requisição

    // Consulta o banco de dados para obter o CPF do usuário com base no ID
    const user = await User.findByPk(userId, { attributes: ['cpf'] });

    if (!user) {
      return res.status(404).send('Usuário não encontrado'); // Trata o caso do usuário não existir
    }

    // Define o CPF do usuário como uma variável global para ser acessível em todas as views
    res.locals.userCPF = user.cpf;

    next(); // Chama o próximo middleware ou rota após definir o CPF do usuário
  } catch (error) {
    console.error('Erro ao buscar CPF do usuário:', error);
    res.status(500).send('Erro ao buscar CPF do usuário'); // Trata erros na busca do CPF
  }
};

module.exports = fetchUserCPF;
 