const { Trocavaga } = require('./models/Trocavaga'); // Supondo que o modelo esteja exportado corretamente

async function verificarVagasCadastradas() {
  try {
    // Encontrar todas as vagas cadastradas
    const vagas = await Trocavaga.findAll();

    if (vagas.length === 0) {
      console.log('Não foram encontradas vagas cadastradas.');
    } else {
      console.log('Vagas cadastradas:');
      vagas.forEach((vaga, index) => {
        console.log(`Vaga ${index + 1}:`);
        console.log(`ID: ${vaga.id}`);
        console.log(`Usuário ID: ${vaga.UserId}`);
        console.log(`Telefone: ${vaga.telefone}`);
        console.log(`Região Origem: ${vaga.regiao_origem}`);
        console.log(`Escola Origem: ${vaga.escola_origem}`);
        console.log(`Grau de Instrução: ${vaga.grau_instrucao}`);
        console.log(`Série/Ano: ${vaga.serie_ano}`);
        console.log(`Turno Origem: ${vaga.turno_origem}`);
        console.log(`Região Destino: ${vaga.regiao_destino}`);
        console.log(`Escola Destino: ${vaga.escola_destino}`);
        console.log(`Turno Destino: ${vaga.turno_destino}`);
        console.log(`Nova Vaga?: ${vaga.new_trocavaga ? 'Sim' : 'Não'}`);
        console.log('-----------------------');
      });
    }
  } catch (error) {
    console.error('Erro ao verificar as vagas cadastradas:', error);
  }
}

verificarVagasCadastradas();


