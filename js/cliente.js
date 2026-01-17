// cliente.js - Lógica do Painel do Cliente - DWM Hotel 2026

// ========== VERIFICAÇÃO DE LOGIN ==========

// Verifica se o usuário está logado
const usuarioLogado = JSON.parse(localStorage.getItem('usuario-logado'));
if (!usuarioLogado || usuarioLogado.tipo !== 'cliente') {
    window.location.href = 'login.html';
}

// ========== VARIÁVEIS GLOBAIS ==========

// Dados temporários para nova reserva
let reservaTemporaria = null;

// ========== FUNÇÕES PRINCIPAIS ==========

// Mostra uma seção específica
function mostrarSecao(idSecao) {
    // Esconde todas as seções
    const secoes = ['dashboard', 'minhas-reservas', 'nova-reserva', 'perfil'];
    secoes.forEach(secao => {
        document.getElementById(secao).style.display = 'none';
    });
    
    // Mostra a seção selecionada
    document.getElementById(idSecao).style.display = 'block';
    
    // Atualiza menu ativo
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Carrega dados da seção
    switch(idSecao) {
        case 'dashboard':
            carregarDashboardCliente();
            break;
        case 'minhas-reservas':
            carregarMinhasReservas();
            break;
        case 'nova-reserva':
            inicializarNovaReserva();
            break;
        case 'perfil':
            carregarPerfil();
            break;
    }
}

// ========== DASHBOARD DO CLIENTE ==========

// Carrega o dashboard do cliente
function carregarDashboardCliente() {
    // Atualiza nome do usuário
    document.getElementById('nome-usuario').textContent = usuarioLogado.nome;
    document.getElementById('sidebar-nome').textContent = usuarioLogado.nome;
    
    // Busca reservas do cliente
    const minhasReservas = hotelDB.buscarReservasCliente(usuarioLogado.email);
    const reservasAtivas = minhasReservas.filter(r => r.status === 'confirmada');
    
    // Calcula estatísticas
    const totalReservas = reservasAtivas.length;
    const totalNoites = reservasAtivas.reduce((soma, r) => soma + r.noites, 0);
    const totalGasto = reservasAtivas.reduce((soma, r) => soma + r.total, 0);
    
    // Atualiza cartões de estatísticas
    document.getElementById('minhas-reservas-count').textContent = totalReservas;
    document.getElementById('minhas-noites').textContent = totalNoites;
    document.getElementById('total-gasto').textContent = '€' + totalGasto;
    document.getElementById('membro-desde').textContent = '2026';
    
    // Carrega próximas reservas
    carregarProximasReservas();
}

// Carrega próximas reservas no dashboard
function carregarProximasReservas() {
    const minhasReservas = hotelDB.buscarReservasCliente(usuarioLogado.email);
    const hoje = new Date().toISOString().split('T')[0];
    
    // Filtra reservas futuras (confirmadas)
    const proximas = minhasReservas
        .filter(r => r.status === 'confirmada' && r.checkIn >= hoje)
        .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
        .slice(0, 5); // Mostra apenas as 5 próximas
    
    const container = document.getElementById('proximas-reservas');
    
    if (proximas.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                Você não tem reservas futuras. 
                <a href="#" onclick="mostrarSecao('nova-reserva')">Faça sua primeira reserva para 2026!</a>
            </div>
        `;
        return;
    }
    
    let html = '<div class="list-group">';
    
    proximas.forEach(reserva => {
        const checkInFormatado = hotelDB.formatarDataCurta(reserva.checkIn);
        const checkOutFormatado = hotelDB.formatarDataCurta(reserva.checkOut);
        
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${reserva.quartoNome}</h6>
                    <small class="text-success">Confirmada</small>
                </div>
                <p class="mb-1">${checkInFormatado} → ${checkOutFormatado}</p>
                <small class="text-muted">
                    ${reserva.noites} noites • ${reserva.hospedes} hóspedes • €${reserva.total}
                </small>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-ouro" onclick="verDetalhesReserva(${reserva.id})">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" onclick="cancelarMinhaReserva(${reserva.id})">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// ========== MINHAS RESERVAS ==========

// Carrega todas as reservas do cliente
function carregarMinhasReservas() {
    const minhasReservas = hotelDB.buscarReservasCliente(usuarioLogado.email);
    
    // Ordena por data mais recente
    minhasReservas.sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
    
    const container = document.getElementById('lista-minhas-reservas');
    
    if (minhasReservas.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                Você ainda não fez nenhuma reserva. 
                <a href="#" onclick="mostrarSecao('nova-reserva')">Faça sua primeira reserva para 2026!</a>
            </div>
        `;
        return;
    }
    
    let html = '<table class="table table-hover">';
    html += '<thead><tr>';
    html += '<th>Quarto</th><th>Check-in</th><th>Check-out</th>';
    html += '<th>Noites</th><th>Hóspedes</th><th>Total</th>';
    html += '<th>Status</th><th>Ações</th>';
    html += '</tr></thead><tbody>';
    
    minhasReservas.forEach(reserva => {
        const statusClass = reserva.status === 'confirmada' ? 'badge bg-success' : 'badge bg-danger';
        const hoje = new Date().toISOString().split('T')[0];
        const podeCancelar = reserva.status === 'confirmada' && reserva.checkIn > hoje;
        
        html += `
            <tr>
                <td>${reserva.quartoNome}</td>
                <td>${hotelDB.formatarDataCurta(reserva.checkIn)}</td>
                <td>${hotelDB.formatarDataCurta(reserva.checkOut)}</td>
                <td>${reserva.noites}</td>
                <td>${reserva.hospedes}</td>
                <td>€${reserva.total}</td>
                <td><span class="${statusClass}">${reserva.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-ouro" onclick="verDetalhesReserva(${reserva.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${podeCancelar ? `
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="cancelarMinhaReserva(${reserva.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Ver detalhes de uma reserva
function verDetalhesReserva(reservaId) {
    const reserva = hotelDB.buscarReservaPorId(reservaId);
    
    if (!reserva || reserva.clienteEmail !== usuarioLogado.email) {
        alert('Reserva não encontrada!');
        return;
    }
    
    const modalContent = document.getElementById('modal-detalhes-conteudo');
    const checkInFormatado = hotelDB.formatarData(reserva.checkIn);
    const checkOutFormatado = hotelDB.formatarData(reserva.checkOut);
    
    let statusHtml = '';
    if (reserva.status === 'confirmada') {
        statusHtml = '<span class="badge bg-success">Confirmada</span>';
    } else if (reserva.status === 'cancelada') {
        statusHtml = '<span class="badge bg-danger">Cancelada</span>';
    }
    
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Detalhes da Reserva</h6>
                <p><strong>Quarto:</strong> ${reserva.quartoNome}</p>
                <p><strong>Check-in:</strong> ${checkInFormatado}</p>
                <p><strong>Check-out:</strong> ${checkOutFormatado}</p>
                <p><strong>Noites:</strong> ${reserva.noites}</p>
                <p><strong>Hóspedes:</strong> ${reserva.hospedes}</p>
                <p><strong>Status:</strong> ${statusHtml}</p>
            </div>
            <div class="col-md-6">
                <h6>Informações de Pagamento</h6>
                <p><strong>Preço por noite:</strong> €${Math.round(reserva.total / reserva.noites)}</p>
                <p><strong>Total:</strong> <span class="h5 text-ouro">€${reserva.total}</span></p>
                
                <h6 class="mt-4">Informações do Hóspede</h6>
                <p><strong>Nome:</strong> ${reserva.clienteNome}</p>
                <p><strong>Email:</strong> ${reserva.clienteEmail}</p>
            </div>
        </div>
        
        ${reserva.status === 'confirmada' ? `
            <div class="alert alert-warning mt-3">
                <i class="fas fa-info-circle"></i>
                <strong>Política de cancelamento:</strong> Cancelamento gratuito até 48h antes do check-in.
            </div>
        ` : ''}
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('modal-detalhes-reserva'));
    modal.show();
}

// Cancela uma reserva do cliente
function cancelarMinhaReserva(reservaId) {
    const reserva = hotelDB.buscarReservaPorId(reservaId);
    
    if (!reserva || reserva.clienteEmail !== usuarioLogado.email) {
        alert('Reserva não encontrada!');
        return;
    }
    
    if (reserva.status === 'cancelada') {
        alert('Esta reserva já está cancelada!');
        return;
    }
    
    // Calcula dias até o check-in
    const hoje = new Date();
    const checkInDate = new Date(reserva.checkIn);
    const diasAteCheckin = Math.ceil((checkInDate - hoje) / (1000 * 60 * 60 * 24));
    
    let mensagem = 'Tem certeza que deseja cancelar esta reserva?\n\n';
    
    if (diasAteCheckin > 2) {
        mensagem += 'Cancelamento gratuito (mais de 48h de antecedência).';
    } else if (diasAteCheckin > 0) {
        mensagem += 'Taxa de cancelamento de 50% (menos de 48h de antecedência).';
    } else {
        mensagem += 'Check-in já passou. Não é possível cancelar.';
        alert(mensagem);
        return;
    }
    
    if (confirm(mensagem)) {
        hotelDB.cancelarReserva(reservaId);
        
        // Atualiza todas as seções
        carregarDashboardCliente();
        carregarMinhasReservas();
        
        alert('Reserva cancelada com sucesso!');
    }
}

// ========== NOVA RESERVA ==========

// Inicializa formulário de nova reserva
function inicializarNovaReserva() {
    // Define datas padrão para 2026
    const hoje = new Date();
    const primeiroDia2026 = new Date('2026-01-01');
    
    let checkinPadrao = '2026-01-01';
    let checkoutPadrao = '2026-01-03';
    
    if (hoje < primeiroDia2026) {
        // Se ainda não chegou 2026
        checkinPadrao = '2026-01-01';
        checkoutPadrao = '2026-01-03';
    } else if (hoje.getFullYear() === 2026) {
        // Se já estamos em 2026
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        
        if (amanha <= new Date('2026-12-31')) {
            checkinPadrao = amanha.toISOString().split('T')[0];
            
            const depoisAmanha = new Date(amanha);
            depoisAmanha.setDate(depoisAmanha.getDate() + 2);
            checkoutPadrao = depoisAmanha.toISOString().split('T')[0];
        }
    }
    
    // Atualiza campos
    const checkinInput = document.getElementById('checkin-busca');
    const checkoutInput = document.getElementById('checkout-busca');
    
    checkinInput.value = checkinPadrao;
    checkoutInput.value = checkoutPadrao;
    
    // Configura validação de datas
    checkinInput.min = '2026-01-01';
    checkinInput.max = '2026-12-31';
    checkoutInput.min = '2026-01-02';
    checkoutInput.max = '2026-12-31';
    
    // Atualiza checkout quando checkin muda
    checkinInput.addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        const checkoutMin = new Date(checkinDate);
        checkoutMin.setDate(checkoutMin.getDate() + 1);
        
        checkoutInput.min = checkoutMin.toISOString().split('T')[0];
        
        // Se checkout atual for inválido, ajusta
        if (new Date(checkoutInput.value) < checkoutMin) {
            const checkoutPadrao = new Date(checkinDate);
            checkoutPadrao.setDate(checkoutPadrao.getDate() + 2);
            checkoutInput.value = checkoutPadrao.toISOString().split('T')[0];
        }
    });
    
    // Limpa resultados anteriores
    document.getElementById('resultados-busca').style.display = 'none';
    reservaTemporaria = null;
}

// Busca quartos disponíveis
function buscarQuartosDisponiveis() {
    const checkin = document.getElementById('checkin-busca').value;
    const checkout = document.getElementById('checkout-busca').value;
    const hospedes = parseInt(document.getElementById('hospedes-busca').value);
    
    // Validações
    if (!checkin || !checkout) {
        alert('Por favor, selecione as datas!');
        return;
    }
    
    if (!checkin.startsWith('2026') || !checkout.startsWith('2026')) {
        alert('Reservas apenas para o ano de 2026!');
        return;
    }
    
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    
    if (checkoutDate <= checkinDate) {
        alert('A data de check-out deve ser posterior à data de check-in!');
        return;
    }
    
    // Calcula número de noites
    const noites = hotelDB.calcularNoites(checkin, checkout);
    
    // Busca quartos disponíveis
    const quartosDisponiveis = hotelDB.quartos.filter(quarto => {
        // Verifica capacidade
        if (quarto.maxHospedes < hospedes) {
            return false;
        }
        
        // Verifica disponibilidade nas datas
        return hotelDB.verificarDisponibilidade(quarto.id, checkin, checkout);
    });
    
    // Exibe resultados
    exibirQuartosDisponiveis(quartosDisponiveis, checkin, checkout, noites, hospedes);
}

// Exibe quartos disponíveis
function exibirQuartosDisponiveis(quartos, checkin, checkout, noites, hospedes) {
    const container = document.getElementById('quartos-disponiveis-lista');
    const resultadosDiv = document.getElementById('resultados-busca');
    
    if (quartos.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Nenhum quarto disponível para as datas selecionadas.
                    Tente alterar as datas ou o número de hóspedes.
                </div>
            </div>
        `;
        resultadosDiv.style.display = 'block';
        return;
    }
    
    let html = '';
    
    quartos.forEach(quarto => {
        const total = quarto.preco * noites;
        
        html += `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${quarto.nome}</h5>
                        <p class="card-text">${quarto.descricao}</p>
                        <p class="text-muted">
                            <i class="fas fa-user-friends"></i> Até ${quarto.maxHospedes} hóspedes
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 class="text-ouro mb-0">€${quarto.preco}/noite</h4>
                                <small class="text-muted">Total: €${total} (${noites} noites)</small>
                            </div>
                            <button class="btn btn-ouro" 
                                    onclick="prepararReserva(${quarto.id}, '${quarto.nome}', ${quarto.preco}, ${noites}, '${checkin}', '${checkout}', ${hospedes})">
                                Selecionar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    resultadosDiv.style.display = 'block';
}

// Prepara dados para reserva
function prepararReserva(quartoId, quartoNome, precoNoite, noites, checkin, checkout, hospedes) {
    const total = precoNoite * noites;
    
    // Armazena dados temporários
    reservaTemporaria = {
        quartoId: quartoId,
        quartoNome: quartoNome,
        precoNoite: precoNoite,
        noites: noites,
        checkin: checkin,
        checkout: checkout,
        hospedes: hospedes,
        total: total
    };
    
    // Preenche modal de confirmação
    document.getElementById('modal-quarto-nome').textContent = quartoNome;
    document.getElementById('modal-periodo').textContent = 
        `${hotelDB.formatarDataCurta(checkin)} → ${hotelDB.formatarDataCurta(checkout)}`;
    document.getElementById('modal-hospedes').textContent = hospedes;
    document.getElementById('modal-total').textContent = `€${total}`;
    
    // Mostra modal
    const modal = new bootstrap.Modal(document.getElementById('modal-confirmar-reserva'));
    modal.show();
}

// Confirma a reserva
function confirmarReserva() {
    if (!reservaTemporaria) {
        alert('Erro: Dados da reserva não encontrados!');
        return;
    }
    
    // Cria objeto de reserva
    const novaReserva = {
        quartoId: reservaTemporaria.quartoId,
        quartoNome: reservaTemporaria.quartoNome,
        clienteNome: usuarioLogado.nome,
        clienteEmail: usuarioLogado.email,
        checkIn: reservaTemporaria.checkin,
        checkOut: reservaTemporaria.checkout,
        hospedes: reservaTemporaria.hospedes,
        noites: reservaTemporaria.noites,
        total: reservaTemporaria.total
    };
    
    // Adiciona reserva ao banco de dados
    const reservaCriada = hotelDB.fazerReserva(novaReserva);
    
    if (reservaCriada) {
        // Fecha modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modal-confirmar-reserva'));
        modal.hide();
        
        // Mostra mensagem de sucesso
        alert(`Reserva confirmada com sucesso!\n\nQuarto: ${reservaCriada.quartoNome}\nTotal: €${reservaCriada.total}`);
        
        // Limpa dados temporários
        reservaTemporaria = null;
        
        // Volta para minhas reservas
        mostrarSecao('minhas-reservas');
        
        // Atualiza dashboard
        carregarDashboardCliente();
    } else {
        alert('Erro ao criar reserva!');
    }
}

// ========== MEU PERFIL ==========

// Carrega dados do perfil
function carregarPerfil() {
    // Preenche formulário com dados do usuário
    document.getElementById('perfil-nome').value = usuarioLogado.nome;
    document.getElementById('perfil-email').value = usuarioLogado.email;
    
    // Configura envio do formulário
    document.getElementById('form-perfil').addEventListener('submit', function(e) {
        e.preventDefault();
        atualizarPerfil();
    });
    
    // Carrega histórico de estadias
    carregarHistoricoEstadias();
}

// Carrega histórico de estadias
function carregarHistoricoEstadias() {
    const minhasReservas = hotelDB.buscarReservasCliente(usuarioLogado.email);
    const estadiasConcluidas = minhasReservas.filter(r => r.status === 'confirmada');
    
    const container = document.getElementById('historico-estadias');
    
    if (estadiasConcluidas.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma estadia concluída ainda.</p>';
        return;
    }
    
    let html = '<div class="list-group">';
    
    estadiasConcluidas.forEach(reserva => {
        html += `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${reserva.quartoNome}</h6>
                    <small>${hotelDB.formatarDataCurta(reserva.checkIn)}</small>
                </div>
                <p class="mb-1">${reserva.noites} noites • ${reserva.hospedes} hóspedes</p>
                <small class="text-muted">Total: €${reserva.total}</small>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Atualiza perfil do usuário
function atualizarPerfil() {
    const nome = document.getElementById('perfil-nome').value;
    const email = document.getElementById('perfil-email').value;
    const telefone = document.getElementById('perfil-telefone').value;
    const senha = document.getElementById('perfil-senha').value;
    
    // Validações básicas
    if (!nome || !email) {
        alert('Nome e email são obrigatórios!');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Email inválido!');
        return;
    }
    
    // Atualiza dados do usuário no localStorage
    usuarioLogado.nome = nome;
    usuarioLogado.email = email;
    
    // Se senha foi fornecida, atualiza
    if (senha) {
        // Em um sistema real, isso seria encriptado
        usuarioLogado.senha = senha;
        
        // Atualiza também no banco de dados (simulação)
        const userIndex = hotelDB.usuarios.findIndex(u => u.id === usuarioLogado.id);
        if (userIndex !== -1) {
            hotelDB.usuarios[userIndex].nome = nome;
            hotelDB.usuarios[userIndex].email = email;
            hotelDB.usuarios[userIndex].senha = senha;
        }
    }
    
    // Salva no localStorage
    localStorage.setItem('usuario-logado', JSON.stringify(usuarioLogado));
    
    // Atualiza interface
    document.getElementById('nome-usuario').textContent = nome;
    document.getElementById('sidebar-nome').textContent = nome;
    
    alert('Perfil atualizado com sucesso!');
    
    // Limpa campo de senha
    document.getElementById('perfil-senha').value = '';
}

// ========== FUNÇÕES UTILITÁRIAS ==========

// Faz logout
function sair() {
    localStorage.removeItem('usuario-logado');
    window.location.href = 'login.html';
}

// ========== INICIALIZAÇÃO ==========

// Inicializa o painel do cliente
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está logado
    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }
    
    // Atualiza nome do usuário
    document.getElementById('nome-usuario').textContent = usuarioLogado.nome;
    document.getElementById('sidebar-nome').textContent = usuarioLogado.nome;
    
    // Mostra dashboard por padrão
    mostrarSecao('dashboard');
});