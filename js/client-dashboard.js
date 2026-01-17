// client-dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está logado
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(loggedInUser);
    document.getElementById('userName').textContent = user.name;

    // Carrega os dados do cliente
    loadClientDashboard(user.email);

    // Navegação do sidebar
    document.getElementById('dashboardLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('dashboardSection');
        setActiveLink(this);
    });

    document.getElementById('myBookingsLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('myBookingsSection');
        setActiveLink(this);
        loadClientBookings(user.email);
    });

    document.getElementById('newBookingLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('newBookingSection');
        setActiveLink(this);
        initializeNewBookingForm();
    });

    document.getElementById('profileLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('profileSection');
        setActiveLink(this);
        loadProfile(user.email);
    });

    // Botão de logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });

    // Buscar quartos disponíveis
    document.getElementById('searchRoomsBtn').addEventListener('click', searchAvailableRooms);

    // Inicializa a dashboard
    showSection('dashboardSection');
    setActiveLink(document.getElementById('dashboardLink'));
});

function showSection(sectionId) {
    // Esconde todas as seções
    const sections = ['dashboardSection', 'myBookingsSection', 'newBookingSection', 'profileSection'];
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

function loadClientDashboard(userEmail) {
    // Filtra as reservas do cliente
    const clientBookings = bookings.filter(booking => 
        booking.guestEmail === userEmail && booking.status !== 'cancelled'
    );

    // Atualiza estatísticas
    const totalBookings = clientBookings.length;
    const totalNights = clientBookings.reduce((sum, booking) => sum + booking.nights, 0);
    const totalSpent = clientBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('totalNights').textContent = totalNights;
    document.getElementById('totalSpent').textContent = `€${totalSpent}`;
    document.getElementById('memberSince').textContent = new Date().getFullYear();

    // Carrega próximas reservas
    loadUpcomingBookings(clientBookings);
}

function loadUpcomingBookings(clientBookings) {
    const today = new Date().toISOString().split('T')[0];
    const upcomingBookings = clientBookings
        .filter(booking => booking.checkIn >= today && booking.status === 'confirmed')
        .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
        .slice(0, 5);

    const container = document.getElementById('upcomingBookings');
    
    if (upcomingBookings.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma reserva futura.</p>';
        return;
    }

    let html = '<div class="list-group">';
    upcomingBookings.forEach(booking => {
        const checkInDate = formatDate(booking.checkIn);
        const checkOutDate = formatDate(booking.checkOut);
        
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${booking.roomName}</h6>
                    <span class="booking-status status-confirmed">Confirmada</span>
                </div>
                <p class="mb-1">${checkInDate} → ${checkOutDate}</p>
                <small class="text-muted">${booking.nights} noites • ${booking.guests} hóspedes • €${booking.totalPrice}</small>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function loadClientBookings(userEmail) {
    const clientBookings = bookings.filter(booking => booking.guestEmail === userEmail);
    const tableBody = document.getElementById('bookingsTable');
    
    if (clientBookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    Nenhuma reserva encontrada.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    clientBookings.sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn)).forEach(booking => {
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
                <td>${checkInDate}</td>
                <td>${checkOutDate}</td>
                <td>${booking.nights}</td>
                <td>${booking.guests}</td>
                <td>€${booking.totalPrice}</td>
                <td><span class="booking-status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails(${booking.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${booking.status === 'confirmed' && new Date(booking.checkIn) > new Date() ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="cancelClientBooking(${booking.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function initializeNewBookingForm() {
    // Define as datas mínimas e máximas para 2025
    const today = new Date();
    let minDate = '2025-01-01';
    let maxDate = '2025-12-31';
    
    // Se hoje for antes de 2025, usa 2025-01-01 como mínimo
    if (today.getFullYear() < 2025) {
        minDate = '2025-01-01';
    } 
    // Se estiver em 2025, usa hoje como mínimo
    else if (today.getFullYear() === 2025) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        minDate = tomorrow.toISOString().split('T')[0];
    }
    // Se estiver depois de 2025, não permite reservas
    else {
        minDate = '2025-12-31';
        alert('O sistema de reservas é válido apenas para o ano de 2025.');
    }

    document.getElementById('newCheckin').min = minDate;
    document.getElementById('newCheckin').max = maxDate;
    document.getElementById('newCheckout').min = minDate;
    document.getElementById('newCheckout').max = maxDate;

    // Define a data de check-in para amanhã (ou primeira data disponível)
    const checkinInput = document.getElementById('newCheckin');
    checkinInput.value = minDate;

    // Atualiza a data de check-out quando check-in muda
    checkinInput.addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        const checkoutDate = new Date(checkinDate);
        checkoutDate.setDate(checkoutDate.getDate() + 1);
        
        const checkoutInput = document.getElementById('newCheckout');
        checkoutInput.min = checkoutDate.toISOString().split('T')[0];
        
        // Se a data atual de check-out for inválida, ajusta
        if (new Date(checkoutInput.value) < checkoutDate) {
            checkoutInput.value = checkoutDate.toISOString().split('T')[0];
        }
    });

    // Inicializa a data de check-out
    const initialCheckin = new Date(checkinInput.value);
    const initialCheckout = new Date(initialCheckin);
    initialCheckout.setDate(initialCheckout.getDate() + 2);
    document.getElementById('newCheckout').value = initialCheckout.toISOString().split('T')[0];
}

function searchAvailableRooms() {
    const checkin = document.getElementById('newCheckin').value;
    const checkout = document.getElementById('newCheckout').value;
    const guests = parseInt(document.getElementById('newGuests').value);
    const roomType = document.getElementById('roomType').value;

    // Validação das datas
    if (!checkin || !checkout) {
        alert('Por favor, selecione as datas de check-in e check-out.');
        return;
    }

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    if (checkoutDate <= checkinDate) {
        alert('A data de check-out deve ser posterior à data de check-in.');
        return;
    }

    // Calcula o número de noites
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

    // Busca quartos disponíveis
    const availableRooms = rooms.filter(room => {
        // Filtra por capacidade
        if (room.maxGuests < guests) return false;
        
        // Filtra por tipo (se especificado)
        if (roomType && room.type !== roomType) return false;
        
        // Verifica se o quarto está disponível nessas datas
        const isAvailable = !bookings.some(booking => {
            if (booking.roomId === room.id && booking.status !== 'cancelled') {
                const bookingCheckin = new Date(booking.checkIn);
                const bookingCheckout = new Date(booking.checkOut);
                return (
                    (checkinDate >= bookingCheckin && checkinDate < bookingCheckout) ||
                    (checkoutDate > bookingCheckin && checkoutDate <= bookingCheckout) ||
                    (checkinDate <= bookingCheckin && checkoutDate >= bookingCheckout)
                );
            }
            return false;
        });
        
        return isAvailable;
    });

    displayAvailableRooms(availableRooms, checkin, checkout, nights, guests);
}

function displayAvailableRooms(roomsList, checkin, checkout, nights, guests) {
    const container = document.getElementById('availableRooms');
    const section = document.getElementById('availableRoomsSection');
    
    if (roomsList.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                Nenhum quarto disponível para as datas selecionadas.
                Tente alterar as datas ou o número de hóspedes.
            </div>
        `;
        section.style.display = 'block';
        return;
    }

    let html = '<div class="row">';
    roomsList.forEach(room => {
        const totalPrice = room.price * nights;
        
        html += `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${room.name}</h5>
                        <p class="card-text">${room.size} • Até ${room.maxGuests} hóspedes</p>
                        <ul class="small text-muted mb-3">
                            ${room.amenities.map(amenity => `<li>${amenity}</li>`).join('')}
                        </ul>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 class="text-warning mb-0">€${room.price}/noite</h4>
                                <small class="text-muted">Total: €${totalPrice} (${nights} noites)</small>
                            </div>
                            <button class="btn btn-reserve" 
                                onclick="selectRoomForBooking(${room.id}, '${room.name}', ${room.price}, ${nights}, '${checkin}', '${checkout}', ${guests})">
                                Selecionar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
    section.style.display = 'block';
}

function selectRoomForBooking(roomId, roomName, pricePerNight, nights, checkin, checkout, guests) {
    const totalPrice = pricePerNight * nights;
    
    document.getElementById('confirmRoomName').textContent = roomName;
    document.getElementById('confirmDates').textContent = `${formatDate(checkin)} → ${formatDate(checkout)}`;
    document.getElementById('confirmTotal').textContent = `€${totalPrice}`;
    
    // Armazena os dados da reserva no botão de confirmação
    const confirmBtn = document.getElementById('confirmBookingBtn');
    confirmBtn.dataset.roomId = roomId;
    confirmBtn.dataset.roomName = roomName;
    confirmBtn.dataset.pricePerNight = pricePerNight;
    confirmBtn.dataset.nights = nights;
    confirmBtn.dataset.checkin = checkin;
    confirmBtn.dataset.checkout = checkout;
    confirmBtn.dataset.guests = guests;
    confirmBtn.dataset.totalPrice = totalPrice;
    
    // Mostra o modal de confirmação
    const modal = new bootstrap.Modal(document.getElementById('bookingConfirmModal'));
    modal.show();
}

// Configura o botão de confirmação de reserva
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('confirmBookingBtn').addEventListener('click', function() {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        
        const newBooking = {
            roomId: parseInt(this.dataset.roomId),
            roomName: this.dataset.roomName,
            guestName: loggedInUser.name,
            guestEmail: loggedInUser.email,
            checkIn: this.dataset.checkin,
            checkOut: this.dataset.checkout,
            guests: parseInt(this.dataset.guests),
            nights: parseInt(this.dataset.nights),
            totalPrice: parseInt(this.dataset.totalPrice),
            status: "confirmed"
        };
        
        addBooking(newBooking);
        
        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('bookingConfirmModal'));
        modal.hide();
        
        // Mostra mensagem de sucesso
        alert('Reserva confirmada com sucesso!');
        
        // Atualiza a lista de reservas
        loadClientBookings(loggedInUser.email);
        showSection('myBookingsSection');
        setActiveLink(document.getElementById('myBookingsLink'));
    });
});

function viewBookingDetails(bookingId) {
    const booking = getBookingById(bookingId);
    if (!booking) return;

    const modalContent = document.getElementById('bookingDetailsContent');
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

    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Detalhes da Reserva</h6>
                <p><strong>Quarto:</strong> ${booking.roomName}</p>
                <p><strong>Check-in:</strong> ${checkInDate}</p>
                <p><strong>Check-out:</strong> ${checkOutDate}</p>
                <p><strong>Noites:</strong> ${booking.nights}</p>
                <p><strong>Hóspedes:</strong> ${booking.guests}</p>
                <p><strong>Status:</strong> <span class="booking-status ${statusClass}">${statusText}</span></p>
            </div>
            <div class="col-md-6">
                <h6>Informações de Pagamento</h6>
                <p><strong>Preço por noite:</strong> €${booking.totalPrice / booking.nights}</p>
                <p><strong>Total:</strong> €${booking.totalPrice}</p>
                
                <h6 class="mt-4">Informações do Hóspede</h6>
                <p><strong>Nome:</strong> ${booking.guestName}</p>
                <p><strong>Email:</strong> ${booking.guestEmail}</p>
            </div>
        </div>
        
        ${booking.status === 'confirmed' ? `
            <div class="alert alert-warning mt-3">
                <i class="fas fa-info-circle"></i>
                <strong>Política de cancelamento:</strong> Cancelamento gratuito até 48h antes do check-in.
            </div>
        ` : ''}
    `;

    const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
    modal.show();
}

function cancelClientBooking(bookingId) {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
        cancelBooking(bookingId);
        alert('Reserva cancelada com sucesso!');
        
        // Recarrega as reservas do cliente
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        loadClientBookings(loggedInUser.email);
        loadClientDashboard(loggedInUser.email);
    }
}

function loadProfile(userEmail) {
    const user = getUserByEmail(userEmail);
    if (user) {
        document.getElementById('profileName').value = user.name;
        document.getElementById('profileEmail').value = user.email;
    }

    // Configura o formulário de perfil
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const password = document.getElementById('profilePassword').value;
        
        // Atualiza os dados do usuário (simulação)
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        loggedInUser.name = name;
        loggedInUser.email = email;
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        
        alert('Perfil atualizado com sucesso!');
        document.getElementById('userName').textContent = name;
    });

    // Carrega o histórico de estadias
    loadStayHistory(userEmail);
}

function loadStayHistory(userEmail) {
    const completedBookings = bookings.filter(booking => 
        booking.guestEmail === userEmail && booking.status === 'completed'
    );
    
    const container = document.getElementById('stayHistory');
    
    if (completedBookings.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma estadia concluída ainda.</p>';
        return;
    }
    
    let html = '<div class="list-group">';
    completedBookings.forEach(booking => {
        const checkInDate = formatDate(booking.checkIn);
        
        html += `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${booking.roomName}</h6>
                    <small>${checkInDate}</small>
                </div>
                <p class="mb-1">${booking.nights} noites • ${booking.guests} hóspedes</p>
                <small class="text-muted">Total: €${booking.totalPrice}</small>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Função auxiliar para formatar datas
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Funções globais para uso nos botões
window.viewBookingDetails = viewBookingDetails;
window.cancelClientBooking = cancelClientBooking;
window.selectRoomForBooking = selectRoomForBooking;