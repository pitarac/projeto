const express = require('express');
const router = express.Router();
const Trocavaga = require('../models/Trocavaga');

// Rota para teste
router.get('/test', (req, res) => {
    res.send('deu certo');
});

// Detalhe da vaga -> view/1, view/2
router.get('/view/:id', (req, res) => {
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

// Formulário de envio
router.get('/add', (req, res) => {
    res.render('add');
});

// Página de perfil
router.get('/profile', (req, res) => {
    res.render('profile');
});

// Página de login (atente-se para a correção do nome da rota)
router.get('/login', (req, res) => {
    res.render('login');
});

// Adicionar vaga via POST
router.post('/add', (req, res) => {
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

module.exports = router;
