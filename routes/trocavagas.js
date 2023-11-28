const express = require('express');
const router = express.Router();
const Trocavaga = require('../models/Trocavaga');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('auth/login');
    }
}

router.get('/test', (req, res) => {
    res.send('deu certo');
});

router.get('/view/:id', ensureAuthenticated, (req, res) => {
    Trocavaga.findOne({
        where: { id: req.params.id }
    })
        .then(trocavaga => {
            res.render('view', {
                Trocavaga: trocavaga
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Erro ao encontrar a vaga');
        });
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add');
    { isLoggedIn: req.isAuthenticated() }
});

router.post('/add', ensureAuthenticated, (req, res) => {
    const {
        responsavel,
        email,
        telefone,
        regiao_origem,
        escola_origem,
        grau_instrucao,
        serie_ano,
        turno_origem,
        regiao_destino,
        escola_destino,
        turno_destino,
        new_trocavaga
    } = req.body;

    // Inserir no banco de dados
    Trocavaga.create({
        responsavel,
        email,
        telefone,
        regiao_origem,
        escola_origem,
        grau_instrucao,
        serie_ano,
        turno_origem,
        regiao_destino,
        escola_destino,
        turno_destino,
        new_trocavaga
    })
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Erro ao adicionar a vaga');
        });
});

router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile');
  // Verifica se o usuário está logado para acessar a página do perfil
  if (isLoggedIn) {
    res.render('perfil', { isLoggedIn: isLoggedIn });
  } else {
    res.send('Você precisa estar logado para acessar esta página');
  }
});

module.exports = router;
