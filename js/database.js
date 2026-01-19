// database.js - Sistema de dados do Hotel DWM 2026

const hotelDB = {   //criei um objeto, é uma simulação de uma base de dados
    //tudo o que faz parte do sistema estará aqui dentro

    // Array de quartos do hotel
    quartos: [
        {
            id: 1,
            nome: "Quarto Standard",
            tipo: "Standard",
            preco: 150,
            descricao: "Conforto básico com todas as necessidades",
            maxHospedes: 2,
            imagem: "img/rooms/standard.jpg",
            status: "disponivel"
        },
        {
            id: 2,
            nome: "Quarto Deluxe",
            tipo: "Deluxe",
            preco: 250,
            descricao: "Espaçoso com vista privilegiada",
            maxHospedes: 3,
            imagem: "img/rooms/deluxe.jpg",
            status: "disponivel"
        },
        {
            id: 3,
            nome: "Suíte Executiva",
            tipo: "Suite",
            preco: 450,
            descricao: "Luxo e sofisticação para executivos",
            maxHospedes: 4,
            imagem: "img/rooms/suite.jpg",
            status: "disponivel"
        },
        {
            id: 4,
            nome: "Suíte Presidencial",
            tipo: "Presidencial",
            preco: 800,
            descricao: "O ápice do luxo e conforto",
            maxHospedes: 6,
            imagem: "img/rooms/presidencial.jpg",
            status: "disponivel"
        }
    ],
    
    // Array de reservas
    reservas: [
        {
            id: 1,
            quartoId: 1,
            quartoNome: "Quarto Standard",
            clienteNome: "João Silva",
            clienteEmail: "cliente@exemplo.com",
            checkIn: "2026-01-15",
            checkOut: "2026-01-20",
            hospedes: 2,
            noites: 5,
            total: 750,
            status: "confirmada",
            dataCriacao: "2025-12-10"
        },
        {
            id: 2,
            quartoId: 2,
            quartoNome: "Quarto Deluxe",
            clienteNome: "Maria Santos",
            clienteEmail: "maria@exemplo.com",
            checkIn: "2026-02-10",
            checkOut: "2026-02-15",
            hospedes: 3,
            noites: 5,
            total: 1250,
            status: "confirmada",
            dataCriacao: "2025-12-20"
        },
        {
            id: 3,
            quartoId: 3,
            quartoNome: "Suíte Executiva",
            clienteNome: "Carlos Oliveira",
            clienteEmail: "carlos@exemplo.com",
            checkIn: "2026-03-01",
            checkOut: "2026-03-05",
            hospedes: 4,
            noites: 4,
            total: 1800,
            status: "cancelada",
            dataCriacao: "2025-11-15"
        }
    ],
    
    // Array de usuários do sistema
    utilizadores: [
        {
            id: 1,
            nome: "David Macieira",
            email: "david@hotel.com",
            password: "123456",
            tipo: "cliente"
        },
        {
            id: 2,
            nome: "Administrador",
            email: "admin@hotel.com",
            password: "admin123",
            tipo: "admin"
        },
        {
            id: 3,
            nome: "Lucas Moura",
            email: "lucasmoura@gmail.com",
            password: "123456",
            tipo: "cliente"
        }
    ],
    
    // Sistema de tarifas para 2026
    //Aqui tambem fiz calculos automaticos por precos de diferentes epocas do ano
    tarifas: [
        { tipo: "Standard", precoBase: 150, altaTemporada: 180, baixaTemporada: 120 },
        { tipo: "Deluxe", precoBase: 250, altaTemporada: 300, baixaTemporada: 200 },
        { tipo: "Suite", precoBase: 450, altaTemporada: 540, baixaTemporada: 360 },
        { tipo: "Presidencial", precoBase: 800, altaTemporada: 960, baixaTemporada: 640 }
    ],
    
    // meses definidos por strings
    altaTemporada: ["06", "07", "08", "12"],
    baixaTemporada: ["01", "02", "03", "11"], 
    
    // ========== FUNÇÕES DO SISTEMA ==========
    
    // Busca um quarto pelo ID - procura um quarto especifico, retorna o quarto ou undefined
    buscarQuarto: function(id) {
        return this.quartos.find(quarto => quarto.id === id);
    },
    
    // Busca reservas por email do cliente- retorna todas as reservas de um cliente
    buscarReservasCliente: function(email) {
        return this.reservas.filter(reserva => reserva.clienteEmail === email);
    },
    
    // Verifica se um quarto está disponível em determinadas datas
    verificarDisponibilidade: function(quartoId, checkIn, checkOut, reservaIdExcluir = null) {
        const quarto = this.buscarQuarto(quartoId);
        if (!quarto || quarto.status !== "disponivel") {
            return false;
        }
        
        const dataInicio = new Date(checkIn);
        const dataFim = new Date(checkOut);
        
        // Verifica conflitos com outras reservas
        const conflito = this.reservas.find(reserva => {
            // Ignora reservas canceladas e reservas diferentes do quarto
            if (reserva.status === "cancelada" || reserva.quartoId !== quartoId) {
                return false;
            }
            
            // Ignora a própria reserva se estiver editando
            if (reservaIdExcluir && reserva.id === reservaIdExcluir) {
                return false;
            }
            
            const reservaInicio = new Date(reserva.checkIn);
            const reservaFim = new Date(reserva.checkOut);
            
            // Verifica se as datas se sobrepõem
            return (dataInicio >= reservaInicio && dataInicio < reservaFim) ||
                   (dataFim > reservaInicio && dataFim <= reservaFim) ||
                   (dataInicio <= reservaInicio && dataFim >= reservaFim);
        });
        
        return !conflito; // Disponível se não houver conflito
    },
    
    // Faz uma nova reserva
    fazerReserva: function(dados) {
        // Gera um novo ID
        const novoId = this.reservas.length > 0 
            ? Math.max(...this.reservas.map(r => r.id)) + 1   //gera o id automaticamente, pega o maior id e soma 1  
            : 1;
        
        const novaReserva = {
            id: novoId,
            quartoId: dados.quartoId,
            quartoNome: dados.quartoNome,
            clienteNome: dados.clienteNome,
            clienteEmail: dados.clienteEmail,
            checkIn: dados.checkIn,
            checkOut: dados.checkOut,
            hospedes: parseInt(dados.hospedes),
            noites: dados.noites,
            total: dados.total,
            status: "confirmada",
            dataCriacao: new Date().toISOString().split('T')[0]
        };
        
        this.reservas.push(novaReserva);
        this.salvarNoLocalStorage();
        return novaReserva;
    },
    
    // Cancela uma reserva - ele nao apaga so mostra como
    cancelarReserva: function(reservaId) {
        const reserva = this.reservas.find(r => r.id === reservaId);
        if (reserva) {
            reserva.status = "cancelada";
            this.salvarNoLocalStorage();
            return reserva;
        }
        return null;
    },
    
    // Calcula estatísticas mensais
    calcularEstatisticasMes: function(mes, ano = 2026) {
        const mesFormatado = mes.toString().padStart(2, '0');
        const prefixoData = `${ano}-${mesFormatado}`;
        
        // Filtra reservas do mês (não canceladas)
        const reservasMes = this.reservas.filter(r => 
            r.checkIn.startsWith(prefixoData) && 
            r.status !== "cancelada"
        );
        
        const receita = reservasMes.reduce((total, r) => total + r.total, 0);
        const noites = reservasMes.reduce((total, r) => total + r.noites, 0);
        const reservasCount = reservasMes.length;
        
        return {
            mes: mes,
            mesNome: this.getNomeMes(mes), //converte numero do mes para nome por exemplo 1 = janeiro
            receita: receita,
            noites: noites,
            reservas: reservasCount,
            mediaPorNoite: noites > 0 ? Math.round(receita / noites) : 0
        };
    },

    // Calcula estatísticas anuais
    calcularEstatisticasAno: function(ano = 2026) {
        let receitaTotal = 0;
        let noitesTotal = 0;
        let reservasTotal = 0;
        
        for (let mes = 1; mes <= 12; mes++) {
            const stats = this.calcularEstatisticasMes(mes, ano);
            receitaTotal += stats.receita;
            noitesTotal += stats.noites;
            reservasTotal += stats.reservas;
        }
        
        return {
            ano: ano,
            receita: receitaTotal,
            noites: noitesTotal,
            reservas: reservasTotal,
            mediaPorNoite: noitesTotal > 0 ? Math.round(receitaTotal / noitesTotal) : 0
        };
    },
    
    // Busca reserva por ID
    buscarReservaPorId: function(id) {
        return this.reservas.find(r => r.id === id);
    },
    
    // Atualiza uma reserva
    atualizarReserva: function(id, novosDados) {
        const index = this.reservas.findIndex(r => r.id === id);
        if (index !== -1) {
            this.reservas[index] = { ...this.reservas[index], ...novosDados };
            this.salvarNoLocalStorage();
            return this.reservas[index];
        }
        return null;
    },
    
    // ========== FUNÇÕES AUXILIARES ==========
    
    // Retorna nome do mês
    getNomeMes: function(numero) {
        const meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        return meses[numero - 1] || "";
    },
    
    // Formata data para exibição
    formatarData: function(dataString) {
        const data = new Date(dataString);
        const opcoes = { day: 'numeric', month: 'long', year: 'numeric' };
        return data.toLocaleDateString('pt', opcoes);
    },
    
    // Formata data curta
    formatarDataCurta: function(dataString) {
        const data = new Date(dataString);
        const opcoes = { day: 'numeric', month: 'short' };
        return data.toLocaleDateString('pt', opcoes);
    },
    
    // Calcula número de noites entre datas
    calcularNoites: function(checkIn, checkOut) {
        const inicio = new Date(checkIn);
        const fim = new Date(checkOut);
        const diferenca = fim - inicio;
        return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
    },
    
    // Calcula preço total
    calcularTotal: function(precoPorNoite, checkIn, checkOut) {
        const noites = this.calcularNoites(checkIn, checkOut);
        return precoPorNoite * noites;
    },
    
    // ========== PERSISTÊNCIA ==========
    
    // Salva dados no localStorage
    salvarNoLocalStorage: function() {
        try {
            localStorage.setItem('hotel-quartos', JSON.stringify(this.quartos));
            localStorage.setItem('hotel-reservas', JSON.stringify(this.reservas));
            return true;
        } catch (error) {
            console.error('Erro ao salvar:', error);
            return false;
        }
    },
    
    // Carrega dados do localStorage
    carregarDoLocalStorage: function() {
        try {
            const quartosSalvos = localStorage.getItem('hotel-quartos');
            const reservasSalvas = localStorage.getItem('hotel-reservas');
            
            if (quartosSalvos) {
                this.quartos = JSON.parse(quartosSalvos);
            }
            
            if (reservasSalvas) {
                this.reservas = JSON.parse(reservasSalvas);
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao carregar:', error);
            return false;
        }
    },
    
    // Restaura dados de demonstração
    restaurarDadosDemo: function() {
        localStorage.removeItem('hotel-quartos');
        localStorage.removeItem('hotel-reservas');
        location.reload();
    }
};

// Carrega dados salvos quando o script é executado
hotelDB.carregarDoLocalStorage();

// Torna o base de dados disponível globalmente
window.hotelDB = hotelDB;