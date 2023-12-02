const User = require('./models/User'); // Importe o modelo de Usuário

// Consulta todos os usuários cadastrados
User.findAll()
  .then(usuarios => {
    console.log(usuarios); // Exibe os usuários cadastrados no console
    // Faça o que precisar com os dados recuperados, como enviá-los para a página para exibição
  })
  .catch(err => {
    console.error('Erro ao buscar usuários:', err);
    // Trate os erros adequadamente
  });
