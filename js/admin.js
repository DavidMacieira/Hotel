// admin.js - Lógica do Painel Administrativo

// Verifica se o usuário é admin
const utilizador = JSON.parse(localStorage.getItem('utilizador-logado'));
if (!utilizador || utilizador.tipo !== 'admin') {
    window.location.href = 'login.html';
}

// Variáveis globais
let graficoReceita = null;

// ========== FUNÇÕES PRINCIPAIS ==========

// Mostra uma seção específica
function mostrarSecao(idSecao) {
    // Esconde todas as seções
    const secoes = ['dashboard', 'reservas', 'quartos', 'relatorios', 'ocupacao'];
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
            carregarDashboard();
            break;
        case 'reservas':
            carregarReservas();
            break;
        case 'quartos':
            carregarQuartosAdmin();
            break;
        case 'relatorios':
            carregarRelatorios();
            break;
        case 'ocupacao':
            carregarCalendario();
            break;
    }
}

// ========== DASHBOARD ==========

// Carrega o dashboard
function carregarDashboard() {
    // 1. Estatísticas principais
    const reservasAtivas = hotelDB.reservas.filter(r => r.status === 'confirmada').length;
    const quartosDisponiveis = hotelDB.quartos.filter(q => q.status === 'disponivel').length;
    
    // Receita do mês atual
    const mesAtual = new Date().getMonth() + 1;
    const statsMes = hotelDB.calcularEstatisticasMes(mesAtual);
    
    // Taxa de ocupação (simplificada)
    const totalQuartos = hotelDB.quartos.length;
    const diasNoMes = new Date(2026, mesAtual, 0).getDate();
    const totalDiasPossiveis = totalQuartos * diasNoMes;
    const taxaOcupacao = totalDiasPossiveis > 0 
        ? Math.round((statsMes.noites / totalDiasPossiveis) * 100)
        : 0;
    
    // Atualiza valores na tela
    document.getElementById('reservas-ativas').textContent = reservasAtivas;
    document.getElementById('quartos-disponiveis').textContent = quartosDisponiveis;
    document.getElementById('receita-mes').textContent = '€' + statsMes.receita;
    document.getElementById('taxa-ocupacao').textContent = taxaOcupacao + '%';
    
    // 2. Carrega gráfico de receita
    carregarGraficoReceita();
    
    // 3. Carrega últimas reservas
    carregarUltimasReservas();
}

// Cria gráfico de receita mensal
function carregarGraficoReceita() {
    const ctx = document.getElementById('grafico-receita').getContext('2d');
    
    // Dados dos meses
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const receitas = [];
    
    for (let mes = 1; mes <= 12; mes++) {
        const stats = hotelDB.calcularEstatisticasMes(mes);
        receitas.push(stats.receita);
    }
    
    // Destrói gráfico anterior se existir
    if (graficoReceita) {
        graficoReceita.destroy();
    }
    
    // Cria novo gráfico
    graficoReceita = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Receita (€)',
                data: receitas,
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                borderColor: 'rgba(212, 175, 55, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '€' + value;
                        }
                    }
                }
            }
        }
    });
}

// Carrega últimas reservas no dashboard
function carregarUltimasReservas() {
    const reservasRecentes = [...hotelDB.reservas]
        .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
        .slice(0, 5);
    
    let html = '<table class="table table-hover">';
    html += '<thead><tr><th>Quarto</th><th>Cliente</th><th>Check-in</th><th>Total</th><th>Status</th></tr></thead>';
    html += '<tbody>';
    
    reservasRecentes.forEach(reserva => {
        const statusClass = reserva.status === 'confirmada' ? 'badge bg-success' : 'badge bg-danger';
        
        html += `
            <tr>
                <td>${reserva.quartoNome}</td>
                <td>${reserva.clienteNome}</td>
                <td>${hotelDB.formatarDataCurta(reserva.checkIn)}</td>
                <td>€${reserva.total}</td>
                <td><span class="${statusClass}">${reserva.status}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    document.getElementById('ultimas-reservas').innerHTML = html;
}

// ========== GESTÃO DE RESERVAS ==========

// Carrega todas as reservas
function carregarReservas() {
    const statusFiltro = document.getElementById('filtro-status').value;
    const mesFiltro = document.getElementById('filtro-mes').value;
    
    // Filtra reservas
    let reservasFiltradas = [...hotelDB.reservas];
    
    if (statusFiltro) {
        reservasFiltradas = reservasFiltradas.filter(r => r.status === statusFiltro);
    }
    
    if (mesFiltro) {
        reservasFiltradas = reservasFiltradas.filter(r => r.checkIn.startsWith(mesFiltro));
    }
    
    // Ordena por data mais recente
    reservasFiltradas.sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
    
    // Cria tabela
    let html = '<table class="table table-hover">';
    html += '<thead><tr>';
    html += '<th>ID</th><th>Quarto</th><th>Cliente</th><th>Check-in</th>';
    html += '<th>Check-out</th><th>Noites</th><th>Total</th><th>Status</th><th>Ações</th>';
    html += '</tr></thead><tbody>';
    
    if (reservasFiltradas.length === 0) {
        html += '<tr><td colspan="9" class="text-center">Nenhuma reserva encontrada</td></tr>';
    } else {
        reservasFiltradas.forEach(reserva => {
            const statusClass = reserva.status === 'confirmada' ? 'badge bg-success' : 'badge bg-danger';
            
            html += `
                <tr>
                    <td>${reserva.id}</td>
                    <td>${reserva.quartoNome}</td>
                    <td>${reserva.clienteNome}</td>
                    <td>${reserva.checkIn}</td>
                    <td>${reserva.checkOut}</td>
                    <td>${reserva.noites}</td>
                    <td>€${reserva.total}</td>
                    <td><span class="${statusClass}">${reserva.status}</span></td>
                    <td>
                        ${reserva.status === 'confirmada' ? 
                            `<button class="btn btn-sm btn-outline-danger" onclick="cancelarReservaAdmin(${reserva.id})">
                                Cancelar
                            </button>` 
                            : ''
                        }
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="excluirReserva(${reserva.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    html += '</tbody></table>';
    document.getElementById('lista-reservas').innerHTML = html;
}

// Cancela uma reserva (admin)
function cancelarReservaAdmin(id) {
    if (confirm('Cancelar esta reserva?')) {
        hotelDB.cancelarReserva(id);
        carregarReservas();
        carregarDashboard(); // Atualiza dashboard
        alert('Reserva cancelada!');
    }
}

// Exclui uma reserva permanentemente
function excluirReserva(id) {
    if (confirm('Excluir permanentemente esta reserva?')) {
        hotelDB.reservas = hotelDB.reservas.filter(r => r.id !== id);
        hotelDB.salvarNoLocalStorage();
        carregarReservas();
        alert('Reserva excluída!');
    }
}

// Exporta dados para CSV
function exportarDados() {
    let csv = 'ID,Quarto,Cliente,Email,Check-in,Check-out,Noites,Total,Status\n';
    
    hotelDB.reservas.forEach(reserva => {
        csv += `${reserva.id},${reserva.quartoNome},${reserva.clienteNome},`;
        csv += `${reserva.clienteEmail},${reserva.checkIn},${reserva.checkOut},`;
        csv += `${reserva.noites},${reserva.total},${reserva.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservas-dwm-2026.csv';
    a.click();
    
    alert('Dados exportados com sucesso!');
}

// ========== GESTÃO DE QUARTOS ==========

// Carrega quartos no painel admin
function carregarQuartosAdmin() {
    let html = '';
    
    hotelDB.quartos.forEach(quarto => {
        // Conta reservas ativas para este quarto
        const reservasAtivas = hotelDB.reservas.filter(r => 
            r.quartoId === quarto.id && 
            r.status === 'confirmada' && 
            r.checkIn >= new Date().toISOString().split('T')[0]
        ).length;
        
        html += `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5>${quarto.nome}</h5>
                        <p class="text-muted">${quarto.tipo}</p>
                        <p><strong>€${quarto.preco}/noite</strong></p>
                        <p>Máx: ${quarto.maxHospedes} hóspedes</p>
                        <p>Reservas ativas: ${reservasAtivas}</p>
                        <button class="btn btn-sm btn-outline-ouro me-1" onclick="editarQuarto(${quarto.id})">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="excluirQuarto(${quarto.id})">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('lista-quartos-admin').innerHTML = html;
}

// Abre modal para adicionar quarto
function abrirModalQuarto(quartoId = null) {
    const modal = new bootstrap.Modal(document.getElementById('modal-quarto'));
    const form = document.getElementById('form-quarto');
    
    // Limpa formulário
    form.reset();
    document.getElementById('quarto-id').value = '';
    
    // Se for edição, preenche dados
    if (quartoId) {
        const quarto = hotelDB.buscarQuarto(quartoId);
        if (quarto) {
            document.getElementById('quarto-id').value = quarto.id;
            document.getElementById('quarto-nome').value = quarto.nome;
            document.getElementById('quarto-tipo').value = quarto.tipo;
            document.getElementById('quarto-preco').value = quarto.preco;
            document.getElementById('quarto-hospedes').value = quarto.maxHospedes;
        }
    }
    
    modal.show();
}

// Salva quarto (novo ou edição)
function salvarQuarto() {
    const id = document.getElementById('quarto-id').value;
    const nome = document.getElementById('quarto-nome').value;
    const tipo = document.getElementById('quarto-tipo').value;
    const preco = parseInt(document.getElementById('quarto-preco').value);
    const maxHospedes = parseInt(document.getElementById('quarto-hospedes').value);
    
    if (!nome || !preco || !maxHospedes) {
        alert('Preencha todos os campos!');
        return;
    }
    
    if (id) {
        // Edita quarto existente
        const quarto = hotelDB.buscarQuarto(parseInt(id));
        if (quarto) {
            quarto.nome = nome;
            quarto.tipo = tipo;
            quarto.preco = preco;
            quarto.maxHospedes = maxHospedes;
        }
    } else {
        // Adiciona novo quarto
        const novoId = hotelDB.quartos.length > 0 
            ? Math.max(...hotelDB.quartos.map(q => q.id)) + 1 
            : 1;
        
        hotelDB.quartos.push({
            id: novoId,
            nome: nome,
            tipo: tipo,
            preco: preco,
            descricao: `${tipo} com todas as comodidades`,
            maxHospedes: maxHospedes,
            imagem: `img/rooms/${tipo.toLowerCase()}.jpg`,
            status: "disponivel"
        });
    }
    
    hotelDB.salvarNoLocalStorage();
    
    // Fecha modal e atualiza lista
    const modal = bootstrap.Modal.getInstance(document.getElementById('modal-quarto'));
    modal.hide();
    
    carregarQuartosAdmin();
    alert('Quarto salvo com sucesso!');
}

// Edita um quarto
function editarQuarto(id) {
    abrirModalQuarto(id);
}

// Exclui um quarto
function excluirQuarto(id) {
    if (confirm('Excluir este quarto permanentemente?')) {
        // Verifica se há reservas futuras
        const reservasFuturas = hotelDB.reservas.filter(r => 
            r.quartoId === id && 
            r.status === 'confirmada' &&
            r.checkIn >= new Date().toISOString().split('T')[0]
        );
        
        if (reservasFuturas.length > 0) {
            alert('Não é possível excluir quarto com reservas futuras!');
            return;
        }
        
        hotelDB.quartos = hotelDB.quartos.filter(q => q.id !== id);
        hotelDB.salvarNoLocalStorage();
        carregarQuartosAdmin();
        alert('Quarto excluído!');
    }
}

// ========== RELATÓRIOS ==========

// Carrega relatórios
function carregarRelatorios() {
    // Estatísticas anuais
    const statsAno = hotelDB.calcularEstatisticasAno();
    
    document.getElementById('receita-anual').textContent = '€' + statsAno.receita;
    document.getElementById('total-reservas').textContent = statsAno.reservas;
    document.getElementById('total-noites').textContent = statsAno.noites;
    document.getElementById('media-noite').textContent = '€' + statsAno.mediaPorNoite;
    
    // Tabela mensal
    let html = '<table class="table table-hover">';
    html += '<thead><tr>';
    html += '<th>Mês</th><th>Receita</th><th>Reservas</th>';
    html += '<th>Noites</th><th>Média/Noite</th><th>Ocupação</th>';
    html += '</tr></thead><tbody>';
    
    for (let mes = 1; mes <= 12; mes++) {
        const stats = hotelDB.calcularEstatisticasMes(mes);
        const diasNoMes = new Date(2026, mes, 0).getDate();
        const totalDiasPossiveis = hotelDB.quartos.length * diasNoMes;
        const ocupacao = totalDiasPossiveis > 0 
            ? Math.round((stats.noites / totalDiasPossiveis) * 100) 
            : 0;
        
        html += `
            <tr>
                <td>${stats.mesNome}</td>
                <td>€${stats.receita}</td>
                <td>${stats.reservas}</td>
                <td>${stats.noites}</td>
                <td>€${stats.mediaPorNoite}</td>
                <td>${ocupacao}%</td>
            </tr>
        `;
    }
    
    html += '</tbody></table>';
    document.getElementById('tabela-mensal').innerHTML = html;
}

// ========== CALENDÁRIO DE OCUPAÇÃO ==========

// Carrega calendário de ocupação
function carregarCalendario() {
    // Preenche dropdown de quartos
    const select = document.getElementById('filtro-quarto');
    if (select.options.length <= 1) {
        hotelDB.quartos.forEach(quarto => {
            const option = document.createElement('option');
            option.value = quarto.id;
            option.textContent = quarto.nome;
            select.appendChild(option);
        });
    }
    
    const quartoSelecionado = document.getElementById('filtro-quarto').value;
    
    // Cria calendário visual
    let html = '<div class="d-flex flex-wrap gap-2">';
    
    // Cores para estados
    const cores = {
        disponivel: '#e0e0e0',
        reservado: '#ffd700',
        ocupado: '#28a745',
        cancelado: '#dc3545'
    };
    
    // Cria um quadrado para cada mês
    for (let mes = 1; mes <= 12; mes++) {
        const diasNoMes = new Date(2026, mes, 0).getDate();
        
        html += `<div class="border rounded p-2" style="width: 200px;">`;
        html += `<strong>${hotelDB.getNomeMes(mes)}</strong><br>`;
        
        // Cria mini-calendário com quadradinhos
        html += '<div class="d-flex flex-wrap mt-1">';
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const dataStr = `2026-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
            const data = new Date(dataStr);
            
            // Verifica estado deste dia
            let estado = 'disponivel';
            let cor = cores.disponivel;
            
            hotelDB.reservas.forEach(reserva => {
                // Se filtro por quarto, verifica apenas aquele quarto
                if (quartoSelecionado !== 'todos' && reserva.quartoId !== parseInt(quartoSelecionado)) {
                    return;
                }
                
                const inicio = new Date(reserva.checkIn);
                const fim = new Date(reserva.checkOut);
                
                if (data >= inicio && data < fim) {
                    estado = reserva.status === 'confirmada' ? 'ocupado' : 'cancelado';
                    cor = cores[estado];
                }
            });
            
            html += `<div class="day-dot m-1" style="width: 8px; height: 8px; background-color: ${cor};" 
                     title="${dataStr} - ${estado}"></div>`;
        }
        
        html += '</div></div>';
    }
    
    html += '</div>';
    document.getElementById('calendario-ocupacao').innerHTML = html;
}

// ========== FUNÇÕES UTILITÁRIAS ==========

// Restaura dados de demonstração
function restaurarDemo() {
    if (confirm('Restaurar dados de demonstração? Seus dados atuais serão perdidos.')) {
        hotelDB.restaurarDadosDemo();
    }
}

// Faz logout
function sair() {
    localStorage.removeItem('utilizador-logado');
    window.location.href = 'login.html';
}

// Inicializa o painel admin
document.addEventListener('DOMContentLoaded', function() {
    mostrarSecao('dashboard');
});