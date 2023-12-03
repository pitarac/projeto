// /controllers/trocavagaController.js

const { Trocavaga, Op } = require('../models/Trocavaga'); // Importe o modelo Trocavaga do seu projeto

const trocavagaController = {
  index: async (req, res) => {
    try {
      let search = req.query.trocavaga;
      let query = '%' + search + '%';

      let trocavagas;

      if (!search) {
        trocavagas = await Trocavaga.findAll({
          order: [['createdAt', 'DESC']]
        });
      } else {
        trocavagas = await Trocavaga.findAll({
          where: {
            [Op.or]: [
              { escola_origem: { [Op.like]: query } },
              { escola_destino: { [Op.like]: query } },
              { regiao_origem: { [Op.like]: query } },
              { regiao_destino: { [Op.like]: query } }
            ]
          },
          order: [['createdAt', 'DESC']]
        });
      }

      res.render('index', { trocavagas, search });
    } catch (err) {
      console.log(err);
      res.status(500).send('Erro ao buscar trocavagas');
    }
  },
};

module.exports = trocavagaController;