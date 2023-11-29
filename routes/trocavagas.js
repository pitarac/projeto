const express = require('express');
const router = express.Router();
const Trocavaga = require('../models/Trocavaga');
const User  = require('../models/User'); // Verifique o caminho correto para o modelo User



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


//router.get('/add', ensureAuthenticated, (req, res) => {
   // res.render('add');
   //// { isLoggedIn: req.isAuthenticated() }
//});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add', { 
        isLoggedIn: req.isAuthenticated(),
        nome: req.user.nome,
        email: req.user.email,
        // Outras propriedades necessárias para a renderização
    });
});


router.post('/add', ensureAuthenticated, async (req, res) => {
    try {
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

        // Verificar se os campos recebidos estão preenchidos corretamente antes de criar a nova Trocavaga
        if (!responsavel || !email || !telefone || !regiao_origem /* ... verificação dos outros campos */) {
            throw new Error('Por favor, preencha todos os campos obrigatórios.'); // Lança um erro se algum campo estiver faltando
        }

        // Crie a nova Trocavaga associada ao usuário
        const userId = req.user.id;
        const createdTrocavaga = await Trocavaga.create({
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
            new_trocavaga,
            UserId: userId // Associe a Trocavaga ao ID do usuário autenticado
        });

        // Renderize a página de 'add' novamente com a mensagem de sucesso
        res.render('add', {
            isLoggedIn: req.isAuthenticated(),
            success: 'Vaga adicionada com sucesso!' // Mensagem de sucesso
        });
    } catch (error) {
        console.error('Erro ao adicionar a vaga:', error);

        // Renderize a página de 'add' novamente e passe o erro para a view
        res.render('add', {
            isLoggedIn: req.isAuthenticated(),
            error: 'Erro ao adicionar a vaga. Por favor, preencha todos os campos corretamente.' // Mensagem de erro
        });
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
                include: {
                    model: Trocavaga,
                    // Define as opções para a inclusão das vagas associadas, se necessário
                }// Inclui os dados das vagas associadas ao usuário
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
router.get('/perfil', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;

        // Consulta para obter os dados do perfil do usuário
        const userProfile = await UserProfile.findOne({ where: { UserId: userId } });

        // Log dos dados para verificação
        console.log('Dados do usuário:', req.user);
        console.log('Dados do perfil do usuário:', userProfile);

        // Renderiza a view 'perfil' passando os dados do usuário e do perfil
        res.render('perfil', { user: req.user, userProfile: userProfile });
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        res.status(500).send('Erro ao carregar perfil do usuário');
    }
});


module.exports = router;
