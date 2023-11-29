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

    // Verificar se o usuário está autenticado
    if (req.user) {
        // Inserir no banco de dados associando a vaga ao usuário autenticado
        req.user.createTrocavaga({
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
    } else {
        res.status(401).send('Usuário não autenticado');
    }
});

router.get('/profile', ensureAuthenticated, async (req, res) => {
    // Verifica se o usuário está autenticado
    if (req.isAuthenticated()) {
        try {
            const userId = req.user.id;

            // Busca os dados do usuário e suas vagas associadas
            const userWithVagas = await User.findOne({
                where: { id: userId },
                include: Trocavaga // Inclui os dados das vagas associadas ao usuário
            });

            res.render('perfil', { isLoggedIn: true, user: userWithVagas }); // Passa dados do usuário e suas vagas para a visualização
        } catch (error) {
            console.error('Erro ao buscar dados do usuário e suas vagas:', error);
            res.status(500).send('Erro ao buscar dados do usuário');
        }
    } else {
        res.send('Você precisa estar logado para acessar esta página');
    }
});

// Rota '/perfil'
router.get('/perfil', ensureAuthenticated, (req, res) => {
    res.render('perfil', { user: req.user });
});

module.exports = router;
