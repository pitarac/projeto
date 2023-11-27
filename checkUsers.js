const Trocavaga = require('./models/Trocavaga'); // Importe o modelo Trocavaga

// Consulta para buscar todos os registros na tabela Trocavaga no banco de dados
Trocavaga.findAll()
  .then(registros => {
    if (registros.length > 0) {
      console.log('Registros encontrados na tabela Trocavaga:');
      registros.forEach(registro => {
        console.log(`ID: ${registro.id}, Telefone: ${registro.telefone}, Região Origem: ${registro.regiao_origem}`);
        // Adicione os outros campos conforme necessário
      });
    } else {
      console.log('Nenhum registro encontrado na tabela Trocavaga.');
    }
  })
  .catch(error => {
    console.error('Erro ao buscar registros na tabela Trocavaga:', error);
  });
//abacate 