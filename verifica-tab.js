const db = require('../db/connection');
const User = require('../models/User');
const Trocavaga = require('../models/Trocavaga');

async function verificarTabelas() {
  try {
    await db.authenticate(); // Verifica a conexão com o banco de dados

    // Verifica se a tabela 'users' existe no banco de dados
    const existeTabelaUsers = await User.sync({ force: false });
    console.log(`Tabela 'users' existe no banco de dados? ${existeTabelaUsers}`);

    // Verifica se a tabela 'trocavagas' existe no banco de dados
    const existeTabelaTrocavaga = await Trocavaga.sync({ force: false });
    console.log(`Tabela 'trocavagas' existe no banco de dados? ${existeTabelaTrocavaga}`);
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
  } finally {
    await db.close(); // Fecha a conexão com o banco de dados
  }
}

verificarTabelas();
