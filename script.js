/* ============================================
   KIHOTO - JavaScript Principal
   ============================================ */

/* ----------------------------------------
   1. MENU MOBILE (HAMBÚRGUER)
   ---------------------------------------- */

/* Elementos do DOM */
const botaoHamburguer = document.getElementById("botaoHamburguer");
const menuNavegacao = document.getElementById("menuNavegacao");
const menuLinks = document.querySelectorAll(".menu-link");

/* Criar overlay para o menu */
const menuOverlay = document.createElement("div");
menuOverlay.classList.add("menu-overlay");
document.body.appendChild(menuOverlay);

/* Função para abrir o menu */
function abrirMenu() {
  botaoHamburguer.classList.add("hamburguer-activo");
  botaoHamburguer.setAttribute("aria-expanded", "true");
  botaoHamburguer.setAttribute("aria-label", "Fechar menu");
  menuNavegacao.classList.add("menu-aberto");
  menuOverlay.classList.add("menu-overlay-visivel");
  document.body.style.overflow = "hidden";
}

/* Função para fechar o menu */
function fecharMenu() {
  botaoHamburguer.classList.remove("hamburguer-activo");
  botaoHamburguer.setAttribute("aria-expanded", "false");
  botaoHamburguer.setAttribute("aria-label", "Abrir menu");
  menuNavegacao.classList.remove("menu-aberto");
  menuOverlay.classList.remove("menu-overlay-visivel");
  document.body.style.overflow = "";
}

/* Evento: clicar no hambúrguer */
botaoHamburguer.addEventListener("click", function () {
  if (menuNavegacao.classList.contains("menu-aberto")) {
    fecharMenu();
  } else {
    abrirMenu();
  }
});

/* Evento: clicar no overlay fecha o menu */
menuOverlay.addEventListener("click", fecharMenu);

/* Evento: clicar num link do menu fecha o menu */
menuLinks.forEach(function (link) {
  link.addEventListener("click", fecharMenu);
});

/* ----------------------------------------
   2. CABEÇALHO COMPACTO AO FAZER SCROLL
   ---------------------------------------- */

const cabecalho = document.getElementById("cabecalho");

window.addEventListener("scroll", function () {
  if (window.scrollY > 50) {
    cabecalho.classList.add("cabecalho-compacto");
  } else {
    cabecalho.classList.remove("cabecalho-compacto");
  }
});

/* ----------------------------------------
   3. LINK ACTIVO NO MENU CONFORME SCROLL
   ---------------------------------------- */

/* Todas as secções que têm links no menu */
const seccoes = document.querySelectorAll("section[id]");

function actualizarLinkActivo() {
  const posicaoScroll = window.scrollY + 120;

  seccoes.forEach(function (seccao) {
    const topoSeccao = seccao.offsetTop;
    const alturaSeccao = seccao.offsetHeight;
    const idSeccao = seccao.getAttribute("id");

    if (
      posicaoScroll >= topoSeccao &&
      posicaoScroll < topoSeccao + alturaSeccao
    ) {
      /* Remover classe activo de todos os links */
      menuLinks.forEach(function (link) {
        link.classList.remove("ativo");
      });

      /* Adicionar classe activo ao link correspondente */
      const linkActivo = document.querySelector(
        '.menu-link[href="#' + idSeccao + '"]',
      );
      if (linkActivo) {
        linkActivo.classList.add("ativo");
      }
    }
  });
}

window.addEventListener("scroll", actualizarLinkActivo);

/* ----------------------------------------
   4. ANIMAÇÕES AO FAZER SCROLL
   ---------------------------------------- */

const elementosAnimaveis = document.querySelectorAll(".animar-ao-scroll");

/* Opções do Intersection Observer */
const opcoesObservador = {
  root: null,
  rootMargin: "0px 0px -60px 0px",
  threshold: 0.1,
};

/* Função que é chamada quando um elemento entra na vista */
const observador = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visivel");
      /* Parar de observar depois de animar (economiza recursos) */
      observador.unobserve(entrada.target);
    }
  });
}, opcoesObservador);

/* Observar cada elemento animável */
elementosAnimaveis.forEach(function (elemento) {
  observador.observe(elemento);
});

/* ----------------------------------------
   5. FORMULÁRIO -> ENVIAR PARA WHATSAPP
   ---------------------------------------- */

const formulario = document.getElementById("formularioContacto");
const botaoEnviar = document.getElementById("botaoEnviar");
const campoNome = document.getElementById("campo-nome");
const campoTelefone = document.getElementById("campo-telefone");
const campoServico = document.getElementById("campo-servico");
const campoMensagem = document.getElementById("campo-mensagem");
const formularioMensagem = document.getElementById("formularioMensagem");

/* Número de WhatsApp da empresa (com código de Angola +244) */
const numeroWhatsApp = "244923894645";

/* Função para validar o formulário */
function validarFormulario() {
  let formularioValido = true;
  const erros = [];

  /* Validar nome (mínimo 3 caracteres) */
  if (campoNome.value.trim().length < 3) {
    erros.push("O nome deve ter pelo menos 3 caracteres.");
    formularioValido = false;
  }

  /* Validar telefone (mínimo 9 dígitos) */
  const telefoneLimpo = campoTelefone.value.replace(/\D/g, "");
  if (telefoneLimpo.length < 9) {
    erros.push("O telefone deve ter pelo menos 9 dígitos.");
    formularioValido = false;
  }

  /* Validar serviço seleccionado */
  if (campoServico.value === "") {
    erros.push("Por favor, seleccione um serviço.");
    formularioValido = false;
  }

  /* Validar mensagem (mínimo 10 caracteres) */
  if (campoMensagem.value.trim().length < 5) {
    erros.push("A mensagem deve ter pelo menos 10 caracteres.");
    formularioValido = false;
  }

  return {
    valido: formularioValido,
    erros: erros,
  };
}

/* Função para mostrar mensagem de erro */
function mostrarErro(erros) {
  formularioMensagem.className = "formulario-mensagem mensagem-erro";
  formularioMensagem.textContent = erros.join(" ");
}

/* Função para mostrar mensagem de sucesso */
function mostrarSucesso() {
  formularioMensagem.className = "formulario-mensagem mensagem-sucesso";
  formularioMensagem.textContent =
    "Mensagem preparada com sucesso! A abrir o WhatsApp...";
}

/* Função para limpar mensagem */
function limparMensagem() {
  formularioMensagem.className = "formulario-mensagem";
  formularioMensagem.textContent = "";
}

/* Evento: submeter o formulário */
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
  limparMensagem();

  /* Validar */
  const resultado = validarFormulario();

  if (!resultado.valido) {
    mostrarErro(resultado.erros);
    return;
  }

  /* Desactivar botão enquanto envia */
  botaoEnviar.textContent = "A preparar...";
  botaoEnviar.disabled = true;

  /* Recolher dados do formulário */
  const nome = campoNome.value.trim();
  const telefone = campoTelefone.value.trim();
  const servico = campoServico.options[campoServico.selectedIndex].text;
  const mensagem = campoMensagem.value.trim();

  /* Construir mensagem organizada para o WhatsApp */
  const textoWhatsApp = encodeURIComponent(
    "🔔 *NOVA SOLICITAÇÃO DE ORÇAMENTO*\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "👤 *Nome:* " +
      nome +
      "\n" +
      "📞 *Telefone:* " +
      telefone +
      "\n" +
      "🛠️ *Serviço:* " +
      servico +
      "\n\n" +
      "💬 *Mensagem:*\n" +
      mensagem +
      "\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "📩 Enviado pelo site da KIHOTO",
  );

  /* Montar o link do WhatsApp */
  const linkWhatsApp =
    "https://wa.me/" + numeroWhatsApp + "?text=" + textoWhatsApp;

  /* Pequeno atraso para efeito visual */
  setTimeout(function () {
    mostrarSucesso();

    /* Limpar formulário */
    formulario.reset();

    /* Restaurar botão */
    botaoEnviar.textContent = "Enviar Mensagem";
    botaoEnviar.disabled = false;

    /* Abrir WhatsApp numa nova aba com a mensagem já preenchida */
    window.open(linkWhatsApp, "_blank");
  }, 800);
});

/* Limpar mensagem de erro ao digitar */
[campoNome, campoTelefone, campoServico, campoMensagem].forEach(
  function (campo) {
    campo.addEventListener("input", limparMensagem);
  },
);
