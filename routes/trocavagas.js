const express = require('express');
const router = express.Router();
const Trocavaga = require('../models/Trocavaga');

router.get('/test', (req, res) => {
    res.send('deu certo');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/auth/login');
    }
}

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
});

router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile');
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

module.exports = router;
