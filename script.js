/* ================================== */
/* Fundo Interativo – Motor Canvas    */
/* ================================== */
var fundoCanvas = document.getElementById('fundoInterativo');
var ctx = fundoCanvas ? fundoCanvas.getContext('2d') : null;

var configuracaoFundo = {
    quantidadeParticulas: 70,
    distanciaLigacao: 160,
    velocidadeBase: 0.4,
    raioMinimo: 2,
    raioMaximo: 5,
    corPrimaria: { r: 0, g: 168, b: 150 },
    corSecundaria: { r: 21, g: 101, b: 192 },
    corFundo: { r: 10, g: 37, b: 64 },
    forcaRato: 120,
    forcaRepulsao: 80
};

var particulas = [];
var posicaoRato = { x: -9999, y: -9999 };
var ratoDentroHero = false;
var larguraCanvas = 0;
var alturaCanvas = 0;
var tempoAnimacao = 0;

/* Redimensionar canvas */
function redimensionarCanvas() {
    if (!fundoCanvas) return;
    var hero = document.getElementById('hero');
    if (!hero) return;
    larguraCanvas = hero.offsetWidth;
    alturaCanvas = hero.offsetHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    fundoCanvas.width = larguraCanvas * dpr;
    fundoCanvas.height = alturaCanvas * dpr;
    fundoCanvas.style.width = larguraCanvas + 'px';
    fundoCanvas.style.height = alturaCanvas + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* Construtor de Partícula */
function Particula(x, y) {
    this.x = x;
    this.y = y;
    this.raio = configuracaoFundo.raioMinimo + Math.random() * (configuracaoFundo.raioMaximo - configuracaoFundo.raioMinimo);
    this.velocidadeX = (Math.random() - 0.5) * configuracaoFundo.velocidadeBase * 2;
    this.velocidadeY = (Math.random() - 0.5) * configuracaoFundo.velocidadeBase * 2;
    this.angulo = Math.random() * Math.PI * 2;
    this.velocidadeAngular = (Math.random() - 0.5) * 0.02;
    this.tipo = Math.random();
    this.opacidade = 0.3 + Math.random() * 0.5;
    this.pulsarOffset = Math.random() * Math.PI * 2;
    this.pulsarVelocidade = 0.5 + Math.random() * 1.5;
    this.mistura = Math.random();
}

Particula.prototype.actualizar = function(tempo) {
    this.angulo += this.velocidadeAngular;
    this.x += this.velocidadeX + Math.sin(this.angulo) * 0.3;
    this.y += this.velocidadeY + Math.cos(this.angulo) * 0.3;
    this.raioActual = this.raio + Math.sin(tempo * this.pulsarVelocidade + this.pulsarOffset) * 1.2;

    if (this.x < -50) this.x = larguraCanvas + 50;
    if (this.x > larguraCanvas + 50) this.x = -50;
    if (this.y < -50) this.y = alturaCanvas + 50;
    if (this.y > alturaCanvas + 50) this.y = -50;

    if (ratoDentroHero) {
        var dx = this.x - posicaoRato.x;
        var dy = this.y - posicaoRato.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < configuracaoFundo.forcaRato && dist > 0) {
            var forca;
            if (dist < configuracaoFundo.forcaRepulsao) {
                forca = -2 * (1 - dist / configuracaoFundo.forcaRepulsao);
            } else {
                forca = 0.5 * (1 - dist / configuracaoFundo.forcaRato);
            }
            var anguloRato = Math.atan2(dy, dx);
            this.x += Math.cos(anguloRato) * forca;
            this.y += Math.sin(anguloRato) * forca;
        }
    }
};

Particula.prototype.desenhar = function(contexto) {
    var r = Math.max(0.5, this.raioActual || this.raio);
    var cor = this.obterCor();
    contexto.save();
    contexto.globalAlpha = this.opacidade * 0.8;
    contexto.fillStyle = cor;
    contexto.strokeStyle = cor;
    contexto.lineWidth = 1.2;

    if (this.tipo < 0.33) {
        contexto.beginPath();
        for (var i = 0; i < 6; i++) {
            var a = (Math.PI / 3) * i - Math.PI / 6;
            var px = this.x + r * Math.cos(a);
            var py = this.y + r * Math.sin(a);
            if (i === 0) contexto.moveTo(px, py);
            else contexto.lineTo(px, py);
        }
        contexto.closePath();
        contexto.stroke();
        contexto.globalAlpha = this.opacidade * 0.15;
        contexto.fill();
    } else if (this.tipo < 0.66) {
        contexto.beginPath();
        for (var i2 = 0; i2 < 3; i2++) {
            var a2 = (Math.PI * 2 / 3) * i2 - Math.PI / 2;
            var px2 = this.x + r * 1.5 * Math.cos(a2);
            var py2 = this.y + r * 1.5 * Math.sin(a2);
            if (i2 === 0) contexto.moveTo(px2, py2);
            else contexto.lineTo(px2, py2);
        }
        contexto.closePath();
        contexto.stroke();
    } else {
        contexto.beginPath();
        contexto.arc(this.x, this.y, r, 0, Math.PI * 2);
        contexto.fill();
        contexto.globalAlpha = this.opacidade * 0.2;
        contexto.beginPath();
        contexto.arc(this.x, this.y, r * 2.5, 0, Math.PI * 2);
        contexto.fill();
    }
    contexto.restore();
};

Particula.prototype.obterCor = function() {
    var cp = configuracaoFundo.corPrimaria;
    var cs = configuracaoFundo.corSecundaria;
    var m = this.mistura;
    var rv = Math.round(cp.r * (1 - m) + cs.r * m);
    var gv = Math.round(cp.g * (1 - m) + cs.g * m);
    var bv = Math.round(cp.b * (1 - m) + cs.b * m);
    return 'rgb(' + rv + ',' + gv + ',' + bv + ')';
};

function inicializarParticulas() {
    particulas = [];
    var quantidade = window.innerWidth < 768 ? 35 : configuracaoFundo.quantidadeParticulas;
    for (var i = 0; i < quantidade; i++) {
        particulas.push(new Particula(
            Math.random() * larguraCanvas,
            Math.random() * alturaCanvas
        ));
    }
}

function desenharLigacoes(contexto) {
    var maxDist = configuracaoFundo.distanciaLigacao;
    var cp = configuracaoFundo.corPrimaria;
    var cs = configuracaoFundo.corSecundaria;
    for (var i = 0; i < particulas.length; i++) {
        for (var j = i + 1; j < particulas.length; j++) {
            var dx = particulas[i].x - particulas[j].x;
            var dy = particulas[i].y - particulas[j].y;
            var distancia = Math.sqrt(dx * dx + dy * dy);
            if (distancia < maxDist) {
                var opacidade = (1 - distancia / maxDist) * 0.15;
                var m = (particulas[i].mistura + particulas[j].mistura) / 2;
                var rv = Math.round(cp.r * (1 - m) + cs.r * m);
                var gv = Math.round(cp.g * (1 - m) + cs.g * m);
                var bv = Math.round(cp.b * (1 - m) + cs.b * m);
                contexto.save();
                contexto.globalAlpha = opacidade;
                contexto.strokeStyle = 'rgb(' + rv + ',' + gv + ',' + bv + ')';
                contexto.lineWidth = 1;
                contexto.beginPath();
                contexto.moveTo(particulas[i].x, particulas[i].y);
                contexto.lineTo(particulas[j].x, particulas[j].y);
                contexto.stroke();
                contexto.restore();
            }
        }
    }
}

function desenharLigacoesRato(contexto) {
    if (!ratoDentroHero) return;
    var cp = configuracaoFundo.corPrimaria;
    for (var i = 0; i < particulas.length; i++) {
        var dx = particulas[i].x - posicaoRato.x;
        var dy = particulas[i].y - posicaoRato.y;
        var distancia = Math.sqrt(dx * dx + dy * dy);
        if (distancia < configuracaoFundo.forcaRato) {
            var opacidade = (1 - distancia / configuracaoFundo.forcaRato) * 0.3;
            contexto.save();
            contexto.globalAlpha = opacidade;
            contexto.strokeStyle = 'rgb(' + cp.r + ',' + cp.g + ',' + cp.b + ')';
            contexto.lineWidth = 1.5;
            contexto.beginPath();
            contexto.moveTo(particulas[i].x, particulas[i].y);
            contexto.lineTo(posicaoRato.x, posicaoRato.y);
            contexto.stroke();
            contexto.restore();
        }
    }
}

function desenharOndasFundo(contexto, tempo) {
    var cp = configuracaoFundo.corPrimaria;
    var cs = configuracaoFundo.corSecundaria;

    contexto.save();
    contexto.globalAlpha = 0.04;
    contexto.fillStyle = 'rgb(' + cp.r + ',' + cp.g + ',' + cp.b + ')';
    contexto.beginPath();
    contexto.moveTo(0, alturaCanvas);
    for (var x = 0; x <= larguraCanvas; x += 10) {
        var y = alturaCanvas * 0.7 + Math.sin(x * 0.005 + tempo * 0.5) * 60 + Math.sin(x * 0.01 + tempo * 0.3) * 30;
        contexto.lineTo(x, y);
    }
    contexto.lineTo(larguraCanvas, alturaCanvas);
    contexto.closePath();
    contexto.fill();
    contexto.restore();

    contexto.save();
    contexto.globalAlpha = 0.03;
    contexto.fillStyle = 'rgb(' + cs.r + ',' + cs.g + ',' + cs.b + ')';
    contexto.beginPath();
    contexto.moveTo(0, alturaCanvas);
    for (var x2 = 0; x2 <= larguraCanvas; x2 += 10) {
        var y2 = alturaCanvas * 0.8 + Math.sin(x2 * 0.004 + tempo * 0.7 + 2) * 50 + Math.cos(x2 * 0.008 + tempo * 0.4) * 25;
        contexto.lineTo(x2, y2);
    }
    contexto.lineTo(larguraCanvas, alturaCanvas);
    contexto.closePath();
    contexto.fill();
    contexto.restore();
}

function animarFundo() {
    if (!ctx || !fundoCanvas) return;
    tempoAnimacao += 0.016;
    ctx.clearRect(0, 0, larguraCanvas, alturaCanvas);

    desenharOndasFundo(ctx, tempoAnimacao);

    for (var i = 0; i < particulas.length; i++) {
        particulas[i].actualizar(tempoAnimacao);
    }

    desenharLigacoes(ctx);
    desenharLigacoesRato(ctx);

    for (var j = 0; j < particulas.length; j++) {
        particulas[j].desenhar(ctx);
    }

    if (ratoDentroHero) {
        ctx.save();
        var gradienteRato = ctx.createRadialGradient(
            posicaoRato.x, posicaoRato.y, 0,
            posicaoRato.x, posicaoRato.y, 100
        );
        gradienteRato.addColorStop(0, 'rgba(0,168,150,0.08)');
        gradienteRato.addColorStop(1, 'rgba(0,168,150,0)');
        ctx.fillStyle = gradienteRato;
        ctx.beginPath();
        ctx.arc(posicaoRato.x, posicaoRato.y, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    requestAnimationFrame(animarFundo);
}

/* Eventos do rato/toque no Hero */
var seccaoHero = document.getElementById('hero');
if (seccaoHero) {
    seccaoHero.addEventListener('mousemove', function(evento) {
        var rect = seccaoHero.getBoundingClientRect();
        posicaoRato.x = evento.clientX - rect.left;
        posicaoRato.y = evento.clientY - rect.top;
        ratoDentroHero = true;
    });
    seccaoHero.addEventListener('mouseleave', function() {
        ratoDentroHero = false;
        posicaoRato.x = -9999;
        posicaoRato.y = -9999;
    });
    seccaoHero.addEventListener('touchmove', function(evento) {
        var rect = seccaoHero.getBoundingClientRect();
        var toque = evento.touches[0];
        posicaoRato.x = toque.clientX - rect.left;
        posicaoRato.y = toque.clientY - rect.top;
        ratoDentroHero = true;
    }, { passive: true });
    seccaoHero.addEventListener('touchend', function() {
        ratoDentroHero = false;
        posicaoRato.x = -9999;
        posicaoRato.y = -9999;
    });
}

function iniciarFundoInterativo() {
    if (!fundoCanvas || !ctx) return;
    redimensionarCanvas();
    inicializarParticulas();
    animarFundo();
}

var temporizadorRedim = null;
window.addEventListener('resize', function() {
    clearTimeout(temporizadorRedim);
    temporizadorRedim = setTimeout(function() {
        if (fundoCanvas && ctx) {
            redimensionarCanvas();
            inicializarParticulas();
        }
    }, 250);
});


/* ============================== */
/* Cabeçalho – Efeito ao Rolar    */
/* ============================== */
var cabecalho = document.getElementById('cabecalho');

function controlarCabecalhoRolado() {
    if (!cabecalho) return;
    if (window.scrollY > 50) {
        cabecalho.classList.add('rolado');
    } else {
        cabecalho.classList.remove('rolado');
    }
}

window.addEventListener('scroll', controlarCabecalhoRolado, { passive: true });


/* ============================== */
/* Menu Mobile                     */
/* ============================== */
var botaoHamburguer = document.getElementById('botaoHamburguer');
var menuOverlay = document.getElementById('menuOverlay');
var menuPainel = document.getElementById('menuPainel');
var linksMobile = document.querySelectorAll('.link-mobile');

function abrirMenuMobile() {
    if (!menuPainel || !menuOverlay || !botaoHamburguer) return;
    menuPainel.classList.add('aberto');
    menuOverlay.classList.add('visivel');
    botaoHamburguer.classList.add('aberto');
    botaoHamburguer.setAttribute('aria-expanded', 'true');
    menuOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function fecharMenuMobile() {
    if (!menuPainel || !menuOverlay || !botaoHamburguer) return;
    menuPainel.classList.remove('aberto');
    menuOverlay.classList.remove('visivel');
    botaoHamburguer.classList.remove('aberto');
    botaoHamburguer.setAttribute('aria-expanded', 'false');
    menuOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function alternarMenuMobile() {
    if (menuPainel && menuPainel.classList.contains('aberto')) {
        fecharMenuMobile();
    } else {
        abrirMenuMobile();
    }
}

if (botaoHamburguer) {
    botaoHamburguer.addEventListener('click', alternarMenuMobile);
}

if (menuOverlay) {
    menuOverlay.addEventListener('click', fecharMenuMobile);
}

linksMobile.forEach(function(link) {
    link.addEventListener('click', fecharMenuMobile);
});

document.addEventListener('keydown', function(evento) {
    if (evento.key === 'Escape' && menuPainel && menuPainel.classList.contains('aberto')) {
        fecharMenuMobile();
    }
});


/* ============================== */
/* Animações ao Scroll            */
/* ============================== */
function inicializarAnimacoesScroll() {
    var elementosAnimar = document.querySelectorAll('.animar');
    if (!('IntersectionObserver' in window)) {
        elementosAnimar.forEach(function(el) {
            el.classList.add('visivel');
        });
        return;
    }
    var observador = new IntersectionObserver(
        function(entradas) {
            entradas.forEach(function(entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visivel');
                    observador.unobserve(entrada.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    elementosAnimar.forEach(function(el) {
        observador.observe(el);
    });
}


/* ============================== */
/* Marquee de Avaliações           */
/* ============================== */
var marqueePista = document.getElementById('marqueePista');

function inicializarMarquee() {
    if (!marqueePista) return;

    /* Remover clones anteriores se existirem */
    var cartoesExistentes = marqueePista.querySelectorAll('.cartao-avaliacao');
    var metade = Math.floor(cartoesExistentes.length / 2);
    if (cartoesExistentes.length > 6) {
        for (var r = cartoesExistentes.length - 1; r >= metade; r--) {
            cartoesExistentes[r].remove();
        }
    }

    /* Duplicar para loop infinito */
    var htmlOriginal = marqueePista.innerHTML;
    marqueePista.innerHTML = htmlOriginal + htmlOriginal;

    /* Esperar renderização e calcular velocidade */
    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            var larguraTotal = marqueePista.scrollWidth;
            var larguraConjunto = larguraTotal / 2;
            var velocidade = window.innerWidth < 768 ? 25 : 40;
            var duracao = Math.max(10, larguraConjunto / velocidade);

            marqueePista.style.setProperty('--marquee-duracao', duracao + 's');
            marqueePista.classList.add('rodando');
        });
    });

    /* Pausar ao hover / toque */
    marqueePista.addEventListener('mouseenter', function() {
        marqueePista.style.animationPlayState = 'paused';
    });
    marqueePista.addEventListener('mouseleave', function() {
        marqueePista.style.animationPlayState = 'running';
    });
    marqueePista.addEventListener('touchstart', function() {
        marqueePista.style.animationPlayState = 'paused';
    }, { passive: true });
    marqueePista.addEventListener('touchend', function() {
        marqueePista.style.animationPlayState = 'running';
    }, { passive: true });
}

var temporizadorMarquee = null;
window.addEventListener('resize', function() {
    clearTimeout(temporizadorMarquee);
    temporizadorMarquee = setTimeout(function() {
        if (!marqueePista) return;
        marqueePista.classList.remove('rodando');
        marqueePista.style.animationPlayState = '';
        inicializarMarquee();
    }, 400);
});


/* ============================== */
/* Formulário → WhatsApp          */
/* ============================== */
var formularioContacto = document.getElementById('formularioContacto');
var mensagemFormulario = document.getElementById('mensagemFormulario');
var numeroWhatsApp = '244923894645';

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarMensagemFormulario(tipo, texto) {
    if (!mensagemFormulario) return;
    mensagemFormulario.classList.remove('sucesso', 'erro');
    mensagemFormulario.className = 'formulario-mensagem';
    mensagemFormulario.classList.add(tipo);
    mensagemFormulario.textContent = texto;
    setTimeout(function() {
        mensagemFormulario.classList.remove('sucesso', 'erro');
        mensagemFormulario.className = 'formulario-mensagem';
    }, 6000);
}

if (formularioContacto) {
    formularioContacto.addEventListener('submit', function(evento) {
        evento.preventDefault();

        var dados = new FormData(formularioContacto);
        var nome = dados.get('nome') ? dados.get('nome').trim() : '';
        var email = dados.get('email') ? dados.get('email').trim() : '';
        var telefone = dados.get('telefone') ? dados.get('telefone').trim() : '';
        var servico = dados.get('servico') ? dados.get('servico').trim() : '';
        var mensagem = dados.get('mensagem') ? dados.get('mensagem').trim() : '';

        /* Validação */
        var erros = [];
        if (nome.length < 2) erros.push('Insira o seu nome completo.');
        if (!validarEmail(email)) erros.push('Insira um e-mail válido.');
        if (mensagem.length < 10) erros.push('A mensagem deve ter pelo menos 10 caracteres.');
        if (erros.length > 0) {
            mostrarMensagemFormulario('erro', erros.join(' '));
            return;
        }

        /* Construir mensagem para WhatsApp */
        var textoWhatsApp = '🔔 *Novo Contacto via Website KIHOTO*\n\n';
        textoWhatsApp += '👤 *Nome:* ' + nome + '\n';
        textoWhatsApp += '📧 *E-mail:* ' + email + '\n';
        if (telefone) textoWhatsApp += '📱 *Telefone:* ' + telefone + '\n';
        if (servico) textoWhatsApp += '🔧 *Serviço:* ' + servico + '\n';
        textoWhatsApp += '\n💬 *Mensagem:*\n' + mensagem;

        /* Codificar e abrir WhatsApp */
        var urlWhatsApp = 'https://wa.me/' + numeroWhatsApp + '?text=' + encodeURIComponent(textoWhatsApp);
        window.open(urlWhatsApp, '_blank');

        /* Feedback visual */
        mostrarMensagemFormulario('sucesso', 'Mensagem encaminhada para o WhatsApp! A KIHOTO responderá em breve.');
        formularioContacto.reset();
    });
}


/* ============================== */
/* Navegação Activa ao Scroll     */
/* ============================== */
function actualizarNavegacaoActiva() {
    var seccoes = document.querySelectorAll('section[id]');
    var links = document.querySelectorAll('.navegacao-menu a');
    var posicaoScroll = window.scrollY + 120;

    seccoes.forEach(function(seccao) {
        var topoSecao = seccao.offsetTop;
        var alturaSecao = seccao.offsetHeight;
        var idSecao = seccao.getAttribute('id');

        if (posicaoScroll >= topoSecao && posicaoScroll < topoSecao + alturaSecao) {
            links.forEach(function(link) {
                link.classList.remove('activo');
                if (link.getAttribute('href') === '#' + idSecao) {
                    link.classList.add('activo');
                }
            });
        }
    });
}

window.addEventListener('scroll', actualizarNavegacaoActiva, { passive: true });


/* Scroll suave para âncoras */
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(evento) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var alvo = document.querySelector(href);
        if (alvo) {
            evento.preventDefault();
            var offsetTop = alvo.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});


/* ============================== */
/* Inicialização Geral            */
/* ============================== */
document.addEventListener('DOMContentLoaded', function() {
    controlarCabecalhoRolado();
    inicializarAnimacoesScroll();
    iniciarFundoInterativo();
    inicializarMarquee();
});
