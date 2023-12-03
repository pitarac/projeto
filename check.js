const Trocavaga = require('./models/Trocavaga'); // Importe o modelo de Trocavaga

async function consultarTrocavagas() {
  try {
    const trocavagas = await Trocavaga.findAll();
    console.log(trocavagas); // Exibe as trocas de vagas no console

    // Faça o que precisar com os dados recuperados, como enviá-los para a página para exibição
  } catch (error) {
    console.error('Erro ao buscar trocas de vagas:', error);
    // Trate os erros adequadamente
  }
}

consultarTrocavagas();

