const { Sequelize } = require('sequelize');

// Configuração da conexão com o banco de dados SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db/data/database.sqlite', // Substitua com o caminho do seu arquivo SQLite
});

// Função para listar as tabelas existentes
async function listTables() {
  try {
    // Obtendo informações sobre as tabelas no banco de dados SQLite
    const tables = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';", {
      type: Sequelize.QueryTypes.SELECT
    });

    // Exibindo os nomes das tabelas existentes
    console.log('Tabelas existentes:');
    tables.forEach(table => {
      console.log(table.name);
    });
  } catch (error) {
    console.error('Erro ao listar as tabelas:', error);
  } finally {
    // Fechando a conexão com o banco de dados
    await sequelize.close();
  }
}

// Chamando a função para listar as tabelas
listTables();
