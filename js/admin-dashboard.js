// admin-dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está logado como admin
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(loggedInUser);
    if (user.type !== 'admin') {
        window.location.href = 'client-dashboard.html';
        return;
    }

    // Navegação do sidebar
    document.getElementById('dashboardLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('dashboardSection');
        setActiveLink(this);
        loadDashboardStats();
        loadRecentBookings();
        initRevenueChart();
    });

    document.getElementById('bookingsLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('bookingsSection');
        setActiveLink(this);
        loadAllBookings();
    });

    document.getElementById('roomsLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('roomsSection');
        setActiveLink(this);
        loadRoomsManagement();
    });

    document.getElementById('reportsLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('reportsSection');
        setActiveLink(this);
        loadReports();
    });

    document.getElementById('occupancyLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('occupancySection');
        setActiveLink(this);
        loadOccupancyChart();
    });

    // Botão de logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });

    // Filtros de reservas
    document.getElementById('filterStatus').addEventListener('change', loadAllBookings);
    document.getElementById('filterMonth').addEventListener('change', loadAllBookings);

    // Botão de exportar
    document.getElementById('exportBookingsBtn').addEventListener('click', exportBookingsData);

    // Botão de adicionar quarto
    document.getElementById('addRoomBtn').addEventListener('click', showAddRoomModal);

    // Botão de salvar quarto
    document.getElementById('saveRoomBtn').addEventListener('click', saveRoom);

    // Filtro de quarto no calendário de ocupação
    document.getElementById('roomSelect').addEventListener('change', loadOccupancyChart);

    // Inicializa a dashboard
    showSection('dashboardSection');
    setActiveLink(document.getElementById('dashboardLink'));
    loadDashboardStats();
    loadRecentBookings();
    initRevenueChart();
});

function showSection(sectionId) {
    // Esconde todas as seções
    const sections = ['dashboardSection', 'bookingsSection', 'roomsSection', 'reportsSection', 'occupancySection'];
    sections.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    
    // Mostra a seção selecionada
    document.getElementById(sectionId).style.display = 'block';
}

function setActiveLink(linkElement) {
    // Remove a classe active de todos os links
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Adiciona a classe active ao link clicado
    linkElement.classList.add('active');
}

function loadDashboardStats() {
    const currentMonth = new Date().getMonth() + 1;
    const monthKey = `2025-${currentMonth.toString().padStart(2, '0')}`;
    const stats = getMonthlyStats();
    const monthStats = stats[monthKey] || { totalRevenue: 0, totalBookings: 0 };

    // Reservas ativas (confirmadas para datas futuras)
    const today = new Date().toISOString().split('T')[0];
    const activeBookings = bookings.filter(booking => 
        booking.status === 'confirmed' && booking.checkIn >= today
    ).length;

    // Calcula taxa de ocupação para o mês atual
    const daysInMonth = new Date(2025, currentMonth, 0).getDate();
    const totalRoomNights = 6 * daysInMonth; // 6 quartos
    const occupiedNights = monthStats.totalNights || 0;
    const occupancyRate = totalRoomNights > 0 ? Math.round((occupiedNights / totalRoomNights) * 100) : 0;

    // Atualiza os cards de estatísticas
    document.getElementById('totalBookings').textContent = activeBookings;
    document.getElementById('monthRevenue').textContent = `€${monthStats.totalRevenue}`;
    document.getElementById('occupancyRate').textContent = `${occupancyRate}%`;
}

function loadRecentBookings() {
    // Pega as 10 reservas mais recentes
    const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn))
        .slice(0, 10);

    const tableBody = document.getElementById('recentBookingsTable');
    
    if (recentBookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Nenhuma reserva encontrada.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    recentBookings.forEach(booking => {
        const checkInDate = formatDate(booking.checkIn);
        const checkOutDate = formatDate(booking.checkOut);
        
        let statusClass = '';
        let statusText = '';
        switch(booking.status) {
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = 'Confirmada';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelada';
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Concluída';
                break;
        }

        html += `
            <tr>
                <td>${booking.roomName}</td>
                <td>${booking.guestName}</td>
                <td>${checkInDate}</td>
                <td>${checkOutDate}</td>
                <td>€${booking.totalPrice}</td>
                <td><span class="booking-status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewAdminBookingDetails(${booking.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${booking.status === 'confirmed' ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="cancelAdminBooking(${booking.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function initRevenueChart() {
    const stats = getMonthlyStats();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const revenueData = [];
    for (let i = 1; i <= 12; i++) {
        const monthKey = `2025-${i.toString().padStart(2, '0')}`;
        revenueData.push(stats[monthKey]?.totalRevenue || 0);
    }

    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Destrói o gráfico anterior se existir
    if (window.revenueChartInstance) {
        window.revenueChartInstance.destroy();
    }

    window.revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Receita Mensal (€)',
                data: revenueData,
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                borderColor: 'rgba(212, 175, 55, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '€' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function loadAllBookings() {
    const statusFilter = document.getElementById('filterStatus').value;
    const monthFilter = document.getElementById('filterMonth').value;
    
    let filteredBookings = [...bookings];
    
    // Aplica filtro de status
    if (statusFilter) {
        filteredBookings = filteredBookings.filter(booking => booking.status === statusFilter);
    }
    
    // Aplica filtro de mês
    if (monthFilter) {
        filteredBookings = filteredBookings.filter(booking => 
            booking.checkIn.startsWith(monthFilter)
        );
    }
    
    const tableBody = document.getElementById('allBookingsTable');
    
    if (filteredBookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted">
                    Nenhuma reserva encontrada com os filtros aplicados.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    filteredBookings.sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn)).forEach(booking => {
        const checkInDate = formatDate(booking.checkIn);
        const checkOutDate = formatDate(booking.checkOut);
        
        let statusClass = '';
        let statusText = '';
        switch(booking.status) {
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = 'Confirmada';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelada';
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Concluída';
                break;
        }

        html += `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.roomName}</td>
                <td>${booking.guestName}</td>
                <td>${checkInDate}</td>
                <td>${checkOutDate}</td>
                <td>${booking.nights}</td>
                <td>€${booking.totalPrice}</td>
                <td><span class="booking-status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewAdminBookingDetails(${booking.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${booking.status === 'confirmed' ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="cancelAdminBooking(${booking.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function exportBookingsData() {
    // Cria um CSV com os dados das reservas
    let csv = 'ID,Quarto,Hóspede,Email,Check-in,Check-out,Noites,Hóspedes,Total,Status\n';
    
    bookings.forEach(booking => {
        csv += `${booking.id},${booking.roomName},${booking.guestName},${booking.guestEmail},${booking.checkIn},${booking.checkOut},${booking.nights},${booking.guests},${booking.totalPrice},${booking.status}\n`;
    });
    
    // Cria um blob e faz download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservas_hotel_2025.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Dados exportados com sucesso!');
}

function loadRoomsManagement() {
    const container = document.getElementById('roomsGrid');
    
    let html = '';
    rooms.forEach(room => {
        // Conta reservas ativas para este quarto
        const activeBookings = bookings.filter(b => 
            b.roomId === room.id && b.status === 'confirmed' && b.checkIn >= new Date().toISOString().split('T')[0]
        ).length;
        
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title mb-0">${room.name}</h5>
                            <span class="badge bg-dark-blue">${room.type}</span>
                        </div>
                        
                        <p class="card-text">
                            <i class="fas fa-ruler-combined text-muted me-2"></i>${room.size}
                            <br>
                            <i class="fas fa-user-friends text-muted me-2"></i>Até ${room.maxGuests} hóspedes
                        </p>
                        
                        <ul class="small text-muted mb-3">
                            ${room.amenities.slice(0, 3).map(amenity => `<li>${amenity}</li>`).join('')}
                            ${room.amenities.length > 3 ? '<li>...</li>' : ''}
                        </ul>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 class="text-warning mb-0">€${room.price}/noite</h4>
                                <small class="text-muted">Reservas ativas: ${activeBookings}</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline-primary" onclick="editRoom(${room.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteRoom(${room.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function showAddRoomModal() {
    document.getElementById('roomModalTitle').textContent = 'Adicionar Novo Quarto';
    document.getElementById('roomForm').reset();
    document.getElementById('roomId').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('roomModal'));
    modal.show();
}

function editRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    document.getElementById('roomModalTitle').textContent = 'Editar Quarto';
    document.getElementById('roomId').value = room.id;
    document.getElementById('roomName').value = room.name;
    document.getElementById('roomType').value = room.type;
    document.getElementById('roomPrice').value = room.price;
    document.getElementById('roomMaxGuests').value = room.maxGuests;
    document.getElementById('roomSize').value = room.size;
    document.getElementById('roomImage').value = room.image || '';
    document.getElementById('roomAmenities').value = room.amenities.join('\n');
    
    const modal = new bootstrap.Modal(document.getElementById('roomModal'));
    modal.show();
}

function saveRoom() {
    const roomId = document.getElementById('roomId').value;
    const roomData = {
        name: document.getElementById('roomName').value,
        type: document.getElementById('roomType').value,
        price: parseInt(document.getElementById('roomPrice').value),
        maxGuests: parseInt(document.getElementById('roomMaxGuests').value),
        size: document.getElementById('roomSize').value,
        image: document.getElementById('roomImage').value,
        amenities: document.getElementById('roomAmenities').value.split('\n').filter(a => a.trim() !== '')
    };

    if (roomId) {
        // Editar quarto existente
        const index = rooms.findIndex(r => r.id === parseInt(roomId));
        if (index !== -1) {
            rooms[index] = { ...rooms[index], ...roomData };
        }
    } else {
        // Adicionar novo quarto
        const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
        rooms.push({
            id: newId,
            ...roomData
        });
    }

    // Fecha o modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('roomModal'));
    modal.hide();
    
    // Recarrega a gestão de quartos
    loadRoomsManagement();
    
    alert(roomId ? 'Quarto atualizado com sucesso!' : 'Quarto adicionado com sucesso!');
}

function deleteRoom(roomId) {
    if (!confirm('Tem certeza que deseja excluir este quarto? Esta ação não pode ser desfeita.')) {
        return;
    }

    // Verifica se há reservas para este quarto
    const roomBookings = bookings.filter(b => b.roomId === roomId && b.status !== 'cancelled');
    if (roomBookings.length > 0) {
        alert('Não é possível excluir este quarto pois existem reservas ativas para ele.');
        return;
    }

    // Remove o quarto
    const index = rooms.findIndex(r => r.id === roomId);
    if (index !== -1) {
        rooms.splice(index, 1);
        loadRoomsManagement();
        alert('Quarto excluído com sucesso!');
    }
}

function loadReports() {
    const yearlyStats = getYearlyStats();
    const monthlyStats = getMonthlyStats();
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    // Atualiza estatísticas anuais
    document.getElementById('yearRevenue').textContent = `€${yearlyStats.totalRevenue}`;
    document.getElementById('yearBookings').textContent = yearlyStats.totalBookings;
    document.getElementById('yearNights').textContent = yearlyStats.totalNights;
    document.getElementById('yearAvgRate').textContent = `€${Math.round(yearlyStats.avgRevenuePerNight)}`;

    // Cria tabela de estatísticas mensais
    const tableBody = document.getElementById('monthlyStatsTable');
    let html = '';
    
    for (let i = 1; i <= 12; i++) {
        const monthKey = `2025-${i.toString().padStart(2, '0')}`;
        const stats = monthlyStats[monthKey] || {
            totalRevenue: 0,
            totalBookings: 0,
            totalNights: 0,
            avgRevenuePerNight: 0
        };
        
        // Calcula taxa de ocupação
        const daysInMonth = new Date(2025, i, 0).getDate();
        const totalRoomNights = 6 * daysInMonth; // 6 quartos
        const occupancyRate = totalRoomNights > 0 ? Math.round((stats.totalNights / totalRoomNights) * 100) : 0;
        
        html += `
            <tr>
                <td>${months[i-1]}</td>
                <td>€${stats.totalRevenue}</td>
                <td>${stats.totalBookings}</td>
                <td>${stats.totalNights}</td>
                <td>€${Math.round(stats.avgRevenuePerNight)}</td>
                <td>${occupancyRate}%</td>
            </tr>
        `;
    }
    
    tableBody.innerHTML = html;

    // Cria gráfico de receita por tipo de quarto
    initRevenueByRoomChart();
}

function initRevenueByRoomChart() {
    // Calcula receita por tipo de quarto
    const revenueByType = {};
    
    bookings.forEach(booking => {
        if (booking.status !== 'cancelled') {
            const room = rooms.find(r => r.id === booking.roomId);
            if (room) {
                revenueByType[room.type] = (revenueByType[room.type] || 0) + booking.totalPrice;
            }
        }
    });

    const ctx = document.getElementById('revenueByRoomChart').getContext('2d');
    
    // Destrói o gráfico anterior se existir
    if (window.revenueByRoomChartInstance) {
        window.revenueByRoomChartInstance.destroy();
    }

    const labels = Object.keys(revenueByType);
    const data = Object.values(revenueByType);
    
    // Cores para os tipos de quarto
    const backgroundColors = [
        'rgba(212, 175, 55, 0.6)',
        'rgba(26, 35, 50, 0.6)',
        'rgba(244, 228, 193, 0.6)',
        'rgba(44, 62, 80, 0.6)',
        'rgba(108, 117, 125, 0.6)'
    ];

    window.revenueByRoomChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: €${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function loadOccupancyChart() {
    const selectedRoom = document.getElementById('roomSelect').value;
    
    // Popula o dropdown de quartos
    const roomSelect = document.getElementById('roomSelect');
    if (roomSelect.options.length <= 1) {
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            roomSelect.appendChild(option);
        });
    }

    const container = document.getElementById('occupancyChart');
    let html = '';
    
    // Cria o cabeçalho com os meses
    const monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    
    html += '<div class="month-column">';
    html += '<div class="month-name"></div>';
    html += '<div class="day-dots" style="grid-template-columns: repeat(31, 1fr);">';
    for (let day = 1; day <= 31; day++) {
        html += `<div class="day-dot"></div>`;
    }
    html += '</div></div>';
    
    for (let month = 1; month <= 12; month++) {
        html += '<div class="month-column">';
        html += `<div class="month-name">${monthNames[month-1]}</div>`;
        html += '<div class="day-dots">';
        
        const daysInMonth = new Date(2025, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `2025-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const date = new Date(dateStr);
            
            // Verifica se há reservas para esta data
            let hasBooking = false;
            let isBooked = false;
            let isCancelled = false;
            
            bookings.forEach(booking => {
                if (selectedRoom !== 'all' && booking.roomId !== parseInt(selectedRoom)) {
                    return;
                }
                
                const checkIn = new Date(booking.checkIn);
                const checkOut = new Date(booking.checkOut);
                
                if (date >= checkIn && date < checkOut) {
                    hasBooking = true;
                    if (booking.status === 'confirmed') {
                        isBooked = true;
                    } else if (booking.status === 'cancelled') {
                        isCancelled = true;
                    }
                }
            });
            
            let className = 'day-dot';
            if (isCancelled) {
                className += ' cancelled';
            } else if (isBooked) {
                className += ' booked';
            } else if (hasBooking) {
                className += ' reserved';
            }
            
            html += `<div class="${className}" title="${dateStr}"></div>`;
        }
        
        // Preenche com pontos vazios se o mês tiver menos de 31 dias
        for (let day = daysInMonth + 1; day <= 31; day++) {
            html += '<div class="day-dot" style="visibility: hidden;"></div>';
        }
        
        html += '</div></div>';
    }
    
    container.innerHTML = html;
}

// Funções auxiliares
function viewAdminBookingDetails(bookingId) {
    const booking = getBookingById(bookingId);
    if (!booking) return;

    alert(`Detalhes da Reserva #${booking.id}\n\n` +
          `Quarto: ${booking.roomName}\n` +
          `Hóspede: ${booking.guestName}\n` +
          `Email: ${booking.guestEmail}\n` +
          `Check-in: ${formatDate(booking.checkIn)}\n` +
          `Check-out: ${formatDate(booking.checkOut)}\n` +
          `Noites: ${booking.nights}\n` +
          `Hóspedes: ${booking.guests}\n` +
          `Total: €${booking.totalPrice}\n` +
          `Status: ${booking.status}`);
}

function cancelAdminBooking(bookingId) {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
        cancelBooking(bookingId);
        alert('Reserva cancelada com sucesso!');
        
        // Recarrega as listas
        loadDashboardStats();
        loadRecentBookings();
        loadAllBookings();
    }
}

// Função auxiliar para formatar datas
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Funções globais para uso nos botões
window.viewAdminBookingDetails = viewAdminBookingDetails;
window.cancelAdminBooking = cancelAdminBooking;
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;