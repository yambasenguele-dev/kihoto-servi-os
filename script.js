/* ================================== */
/* Fundo Interativo – Motor Canvas    */
/* ================================== */
var fundoCanvas = document.getElementById("fundoInterativo");
var ctx = fundoCanvas ? fundoCanvas.getContext("2d") : null;
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
  forcaRepulsao: 80,
};
var particulas = [],
  posicaoRato = { x: -9999, y: -9999 },
  ratoDentroHero = false;
var larguraCanvas = 0,
  alturaCanvas = 0,
  tempoAnimacao = 0;

/* ============================== */
/* Canvas – Corrigido para mobile */
/* ============================== */
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
    /* Resetar escala para evitar acumulação */
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function Particula(x, y) {
  this.x = x;
  this.y = y;
  this.raio =
    configuracaoFundo.raioMinimo +
    Math.random() *
      (configuracaoFundo.raioMaximo - configuracaoFundo.raioMinimo);
  this.velocidadeX =
    (Math.random() - 0.5) * configuracaoFundo.velocidadeBase * 2;
  this.velocidadeY =
    (Math.random() - 0.5) * configuracaoFundo.velocidadeBase * 2;
  this.angulo = Math.random() * Math.PI * 2;
  this.velocidadeAngular = (Math.random() - 0.5) * 0.02;
  this.tipo = Math.random();
  this.opacidade = 0.3 + Math.random() * 0.5;
  this.pulsarOffset = Math.random() * Math.PI * 2;
  this.pulsarVelocidade = 0.5 + Math.random() * 1.5;
  this.mistura = Math.random();
}
Particula.prototype.actualizar = function (t) {
  this.angulo += this.velocidadeAngular;
  this.x += this.velocidadeX + Math.sin(this.angulo) * 0.3;
  this.y += this.velocidadeY + Math.cos(this.angulo) * 0.3;
  this.raioActual =
    this.raio + Math.sin(t * this.pulsarVelocidade + this.pulsarOffset) * 1.2;
  if (this.x < -50) this.x = larguraCanvas + 50;
  if (this.x > larguraCanvas + 50) this.x = -50;
  if (this.y < -50) this.y = alturaCanvas + 50;
  if (this.y > alturaCanvas + 50) this.y = -50;
  if (ratoDentroHero) {
    var dx = this.x - posicaoRato.x,
      dy = this.y - posicaoRato.y,
      dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < configuracaoFundo.forcaRato && dist > 0) {
      var f =
        dist < configuracaoFundo.forcaRepulsao
          ? -2 * (1 - dist / configuracaoFundo.forcaRepulsao)
          : 0.5 * (1 - dist / configuracaoFundo.forcaRato);
      var a = Math.atan2(dy, dx);
      this.x += Math.cos(a) * f;
      this.y += Math.sin(a) * f;
    }
  }
};
Particula.prototype.desenhar = function (c) {
  var r = Math.max(0.5, this.raioActual || this.raio),
    cor = this.obterCor();
  c.save();
  c.globalAlpha = this.opacidade * 0.8;
  c.fillStyle = cor;
  c.strokeStyle = cor;
  c.lineWidth = 1.2;
  if (this.tipo < 0.33) {
    c.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 3) * i - Math.PI / 6,
        px = this.x + r * Math.cos(a),
        py = this.y + r * Math.sin(a);
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.closePath();
    c.stroke();
    c.globalAlpha = this.opacidade * 0.15;
    c.fill();
  } else if (this.tipo < 0.66) {
    c.beginPath();
    for (var i2 = 0; i2 < 3; i2++) {
      var a2 = ((Math.PI * 2) / 3) * i2 - Math.PI / 2,
        px2 = this.x + r * 1.5 * Math.cos(a2),
        py2 = this.y + r * 1.5 * Math.sin(a2);
      i2 === 0 ? c.moveTo(px2, py2) : c.lineTo(px2, py2);
    }
    c.closePath();
    c.stroke();
  } else {
    c.beginPath();
    c.arc(this.x, this.y, r, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = this.opacidade * 0.2;
    c.beginPath();
    c.arc(this.x, this.y, r * 2.5, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
};
Particula.prototype.obterCor = function () {
  var cp = configuracaoFundo.corPrimaria,
    cs = configuracaoFundo.corSecundaria,
    m = this.mistura;
  return (
    "rgb(" +
    Math.round(cp.r * (1 - m) + cs.r * m) +
    "," +
    Math.round(cp.g * (1 - m) + cs.g * m) +
    "," +
    Math.round(cp.b * (1 - m) + cs.b * m) +
    ")"
  );
};

function inicializarParticulas() {
  particulas = [];
  var q = window.innerWidth < 768 ? 35 : configuracaoFundo.quantidadeParticulas;
  for (var i = 0; i < q; i++)
    particulas.push(
      new Particula(
        Math.random() * larguraCanvas,
        Math.random() * alturaCanvas,
      ),
    );
}

function desenharLigacoes(c) {
  var md = configuracaoFundo.distanciaLigacao,
    cp = configuracaoFundo.corPrimaria,
    cs = configuracaoFundo.corSecundaria;
  for (var i = 0; i < particulas.length; i++)
    for (var j = i + 1; j < particulas.length; j++) {
      var dx = particulas[i].x - particulas[j].x,
        dy = particulas[i].y - particulas[j].y,
        d = Math.sqrt(dx * dx + dy * dy);
      if (d < md) {
        var op = (1 - d / md) * 0.15,
          m = (particulas[i].mistura + particulas[j].mistura) / 2;
        c.save();
        c.globalAlpha = op;
        c.strokeStyle =
          "rgb(" +
          Math.round(cp.r * (1 - m) + cs.r * m) +
          "," +
          Math.round(cp.g * (1 - m) + cs.g * m) +
          "," +
          Math.round(cp.b * (1 - m) + cs.b * m) +
          ")";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(particulas[i].x, particulas[i].y);
        c.lineTo(particulas[j].x, particulas[j].y);
        c.stroke();
        c.restore();
      }
    }
}

function desenharLigacoesRato(c) {
  if (!ratoDentroHero) return;
  var cp = configuracaoFundo.corPrimaria;
  for (var i = 0; i < particulas.length; i++) {
    var dx = particulas[i].x - posicaoRato.x,
      dy = particulas[i].y - posicaoRato.y,
      d = Math.sqrt(dx * dx + dy * dy);
    if (d < configuracaoFundo.forcaRato) {
      c.save();
      c.globalAlpha = (1 - d / configuracaoFundo.forcaRato) * 0.3;
      c.strokeStyle = "rgb(" + cp.r + "," + cp.g + "," + cp.b + ")";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(particulas[i].x, particulas[i].y);
      c.lineTo(posicaoRato.x, posicaoRato.y);
      c.stroke();
      c.restore();
    }
  }
}

function desenharOndasFundo(c, t) {
  var cp = configuracaoFundo.corPrimaria,
    cs = configuracaoFundo.corSecundaria;
  c.save();
  c.globalAlpha = 0.04;
  c.fillStyle = "rgb(" + cp.r + "," + cp.g + "," + cp.b + ")";
  c.beginPath();
  c.moveTo(0, alturaCanvas);
  for (var x = 0; x <= larguraCanvas; x += 10)
    c.lineTo(
      x,
      alturaCanvas * 0.7 +
        Math.sin(x * 0.005 + t * 0.5) * 60 +
        Math.sin(x * 0.01 + t * 0.3) * 30,
    );
  c.lineTo(larguraCanvas, alturaCanvas);
  c.closePath();
  c.fill();
  c.restore();
  c.save();
  c.globalAlpha = 0.03;
  c.fillStyle = "rgb(" + cs.r + "," + cs.g + "," + cs.b + ")";
  c.beginPath();
  c.moveTo(0, alturaCanvas);
  for (var x2 = 0; x2 <= larguraCanvas; x2 += 10)
    c.lineTo(
      x2,
      alturaCanvas * 0.8 +
        Math.sin(x2 * 0.004 + t * 0.7 + 2) * 50 +
        Math.cos(x2 * 0.008 + t * 0.4) * 25,
    );
  c.lineTo(larguraCanvas, alturaCanvas);
  c.closePath();
  c.fill();
  c.restore();
}

function animarFundo() {
  if (!ctx || !fundoCanvas) return;
  tempoAnimacao += 0.016;
  ctx.clearRect(0, 0, larguraCanvas, alturaCanvas);
  desenharOndasFundo(ctx, tempoAnimacao);
  for (var i = 0; i < particulas.length; i++)
    particulas[i].actualizar(tempoAnimacao);
  desenharLigacoes(ctx);
  desenharLigacoesRato(ctx);
  for (var j = 0; j < particulas.length; j++) particulas[j].desenhar(ctx);
  if (ratoDentroHero) {
    ctx.save();
    var g = ctx.createRadialGradient(
      posicaoRato.x,
      posicaoRato.y,
      0,
      posicaoRato.x,
      posicaoRato.y,
      100,
    );
    g.addColorStop(0, "rgba(0,168,150,0.08)");
    g.addColorStop(1, "rgba(0,168,150,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(posicaoRato.x, posicaoRato.y, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  requestAnimationFrame(animarFundo);
}

var seccaoHero = document.getElementById("hero");
if (seccaoHero) {
  seccaoHero.addEventListener("mousemove", function (e) {
    var r = seccaoHero.getBoundingClientRect();
    posicaoRato.x = e.clientX - r.left;
    posicaoRato.y = e.clientY - r.top;
    ratoDentroHero = true;
  });
  seccaoHero.addEventListener("mouseleave", function () {
    ratoDentroHero = false;
    posicaoRato.x = -9999;
    posicaoRato.y = -9999;
  });
  seccaoHero.addEventListener(
    "touchmove",
    function (e) {
      var r = seccaoHero.getBoundingClientRect();
      posicaoRato.x = e.touches[0].clientX - r.left;
      posicaoRato.y = e.touches[0].clientY - r.top;
      ratoDentroHero = true;
    },
    { passive: true },
  );
  seccaoHero.addEventListener("touchend", function () {
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
window.addEventListener("resize", function () {
  clearTimeout(temporizadorRedim);
  temporizadorRedim = setTimeout(function () {
    if (fundoCanvas && ctx) {
      redimensionarCanvas();
      inicializarParticulas();
    }
  }, 250);
});

/* ============================== */
/* Cabeçalho ao Rolar             */
/* ============================== */
var cabecalho = document.getElementById("cabecalho");
function controlarCabecalhoRolado() {
  if (cabecalho) {
    window.scrollY > 50
      ? cabecalho.classList.add("rolado")
      : cabecalho.classList.remove("rolado");
  }
}
window.addEventListener("scroll", controlarCabecalhoRolado, { passive: true });

/* ============================== */
/* Menu Mobile                     */
/* ============================== */
var botaoHamburguer = document.getElementById("botaoHamburguer");
var menuOverlay = document.getElementById("menuOverlay");
var menuPainel = document.getElementById("menuPainel");
var linksMobile = document.querySelectorAll(".link-mobile");
function abrirMenuMobile() {
  menuPainel.classList.add("aberto");
  menuOverlay.classList.add("visivel");
  botaoHamburguer.classList.add("aberto");
  botaoHamburguer.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}
function fecharMenuMobile() {
  menuPainel.classList.remove("aberto");
  menuOverlay.classList.remove("visivel");
  botaoHamburguer.classList.remove("aberto");
  botaoHamburguer.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}
if (botaoHamburguer)
  botaoHamburguer.addEventListener("click", function () {
    menuPainel.classList.contains("aberto")
      ? fecharMenuMobile()
      : abrirMenuMobile();
  });
if (menuOverlay) menuOverlay.addEventListener("click", fecharMenuMobile);
linksMobile.forEach(function (l) {
  l.addEventListener("click", fecharMenuMobile);
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && menuPainel.classList.contains("aberto"))
    fecharMenuMobile();
});

/* ============================== */
/* Animações ao Scroll            */
/* ============================== */
function inicializarAnimacoesScroll() {
  var el = document.querySelectorAll(".animar");
  if (!("IntersectionObserver" in window)) {
    el.forEach(function (e) {
      e.classList.add("visivel");
    });
    return;
  }
  var obs = new IntersectionObserver(
    function (ent) {
      ent.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visivel");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );
  el.forEach(function (e) {
    obs.observe(e);
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
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            var larguraTotal = marqueePista.scrollWidth;
            var larguraConjunto = larguraTotal / 2;

            /* Velocidade: mais lento em mobile, mais rápido em desktop */
            var velocidade = window.innerWidth < 768 ? 25 : 40;
            var duracao = Math.max(10, larguraConjunto / velocidade);

            marqueePista.style.setProperty('--marquee-duracao', duracao + 's');
            marqueePista.classList.add('rodando');
        });
    });

    /* Pausar ao hover / toque */
    marqueePista.addEventListener('mouseenter', function () {
        marqueePista.style.animationPlayState = 'paused';
    });
    marqueePista.addEventListener('mouseleave', function () {
        marqueePista.style.animationPlayState = 'running';
    });
    marqueePista.addEventListener('touchstart', function () {
        marqueePista.style.animationPlayState = 'paused';
    }, { passive: true });
    marqueePista.addEventListener('touchend', function () {
        marqueePista.style.animationPlayState = 'running';
    }, { passive: true });
}

/* Recalcular marquee ao redimensionar */
var temporizadorMarquee = null;
window.addEventListener('resize', function () {
    clearTimeout(temporizadorMarquee);
    temporizadorMarquee = setTimeout(function () {
        if (!marqueePista) return;
        marqueePista.classList.remove('rodando');
        marqueePista.style.animationPlayState = '';
        inicializarMarquee();
    }, 400);
});
    /* Remover animação, resetar posição */
    marqueePista.classList.remove("rodando");
    marqueePista.style.animationPlayState = "";

    /* Re-duplicar: remover clones (ficar só com original) */
    var cartoes = marqueePista.querySelectorAll(".cartao-avaliacao");
    var metade = Math.floor(cartoes.length / 2);
    for (var i = cartoes.length - 1; i >= metade; i--) {
      cartoes[i].remove();
    }

    /* Reiniciar */
    inicializarMarquee();
  }, 300);
});

/* ============================== */
/* Formulário → WhatsApp          */
/* ============================== */
var formularioContacto = document.getElementById("formularioContacto");
var mensagemFormulario = document.getElementById("mensagemFormulario");
var numeroWhatsApp = "244923894645";

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarMensagemFormulario(tipo, texto) {
  mensagemFormulario.classList.remove("sucesso", "erro");
  mensagemFormulario.className = "formulario-mensagem";
  mensagemFormulario.classList.add(tipo);
  mensagemFormulario.textContent = texto;
  setTimeout(function () {
    mensagemFormulario.classList.remove("sucesso", "erro");
    mensagemFormulario.className = "formulario-mensagem";
  }, 6000);
}

if (formularioContacto) {
  formularioContacto.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var dados = new FormData(formularioContacto);
    var nome = dados.get("nome") ? dados.get("nome").trim() : "";
    var email = dados.get("email") ? dados.get("email").trim() : "";
    var telefone = dados.get("telefone") ? dados.get("telefone").trim() : "";
    var servico = dados.get("servico") ? dados.get("servico").trim() : "";
    var mensagem = dados.get("mensagem") ? dados.get("mensagem").trim() : "";

    /* Validação */
    var erros = [];
    if (nome.length < 2) erros.push("Insira o seu nome.");
    if (!validarEmail(email)) erros.push("Insira um e-mail válido.");
    if (mensagem.length < 10)
      erros.push("A mensagem deve ter pelo menos 10 caracteres.");
    if (erros.length > 0) {
      mostrarMensagemFormulario("erro", erros.join(" "));
      return;
    }

    /* Construir mensagem para WhatsApp */
    var textoWhatsApp = "🔔 *Novo Contacto via Website KIHOTO*\n\n";
    textoWhatsApp += "👤 *Nome:* " + nome + "\n";
    textoWhatsApp += "📧 *E-mail:* " + email + "\n";
    if (telefone) textoWhatsApp += "📱 *Telefone:* " + telefone + "\n";
    if (servico) textoWhatsApp += "🔧 *Serviço:* " + servico + "\n";
    textoWhatsApp += "\n💬 *Mensagem:*\n" + mensagem;

    /* Codificar e abrir WhatsApp */
    var urlWhatsApp =
      "https://wa.me/" +
      numeroWhatsApp +
      "?text=" +
      encodeURIComponent(textoWhatsApp);
    window.open(urlWhatsApp, "_blank");

    /* Feedback visual */
    mostrarMensagemFormulario(
      "sucesso",
      "Mensagem encaminhada para o WhatsApp! A KIHOTO responderá em breve.",
    );
    formularioContacto.reset();
  });
}

/* ============================== */
/* Navegação Activa ao Scroll     */
/* ============================== */
function atualizarNavegacaoActiva() {
  var seccoes = document.querySelectorAll("section[id]");
  var links = document.querySelectorAll(".navegacao-menu a");
  var pos = window.scrollY + 120;
  seccoes.forEach(function (s) {
    var t = s.offsetTop,
      h = s.offsetHeight,
      id = s.getAttribute("id");
    if (pos >= t && pos < t + h) {
      links.forEach(function (l) {
        l.classList.remove("activo");
        if (l.getAttribute("href") === "#" + id) l.classList.add("activo");
      });
    }
  });
}
window.addEventListener("scroll", atualizarNavegacaoActiva, { passive: true });

/* Scroll suave para âncoras */
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (e) {
    var h = this.getAttribute("href");
    if (h === "#") return;
    var a = document.querySelector(h);
    if (a) {
      e.preventDefault();
      window.scrollTo({ top: a.offsetTop - 80, behavior: "smooth" });
    }
  });
});

/* ============================== */
/* Inicialização Geral            */
/* ============================== */
document.addEventListener("DOMContentLoaded", function () {
  controlarCabecalhoRolado();
  inicializarAnimacoesScroll();
  iniciarFundoInterativo();
  inicializarMarquee();
});
