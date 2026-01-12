// Booking functionality
document.addEventListener('DOMContentLoaded', function() {
    initBookingForm();
});

function initBookingForm() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!checkinInput || !checkoutInput) return;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    checkinInput.min = today;
    
    // Set initial dates
    setInitialDates(checkinInput, checkoutInput);
    
    // Update checkout minimum date when checkin changes
    checkinInput.addEventListener('change', function() {
        updateCheckoutMinDate(this.value, checkoutInput);
    });
    
    // Handle search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleBookingSearch(checkinInput, checkoutInput);
        });
    }
}

function setInitialDates(checkin, checkout) {
    // Set checkin to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    checkin.value = tomorrow.toISOString().split('T')[0];
    
    // Set checkout to day after tomorrow
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    checkout.value = dayAfterTomorrow.toISOString().split('T')[0];
    checkout.min = dayAfterTomorrow.toISOString().split('T')[0];
}

function updateCheckoutMinDate(checkinValue, checkoutInput) {
    if (!checkinValue) return;
    
    const checkinDate = new Date(checkinValue);
    const nextDay = new Date(checkinDate);
    nextDay.setDate(nextDay.getDate() + 1);
    checkoutInput.min = nextDay.toISOString().split('T')[0];
    
    // Clear checkout if invalid
    if (checkoutInput.value && new Date(checkoutInput.value) < nextDay) {
        checkoutInput.value = '';
    }
}

function handleBookingSearch(checkin, checkout) {
    const guests = document.querySelector('.booking-form select:nth-of-type(1)')?.value || '1';
    const rooms = document.querySelector('.booking-form select:nth-of-type(2)')?.value || '1';
    
    // Validate dates
    if (!checkin.value || !checkout.value) {
        alert('Por favor, selecione as datas de check-in e check-out.');
        return;
    }
    
    const checkinDate = new Date(checkin.value);
    const checkoutDate = new Date(checkout.value);
    
    if (checkoutDate <= checkinDate) {
        alert('A data de check-out deve ser posterior à data de check-in.');
        return;
    }
    
    // Calculate nights
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    
    // Show loading state
    const searchBtn = document.getElementById('searchBtn');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
    searchBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
        
        // Show results modal
        showSearchResults({
            checkin: checkin.value,
            checkout: checkout.value,
            nights: nights,
            guests: guests,
            rooms: rooms
        });
    }, 1500);
}

function showSearchResults(searchParams) {
    const resultsHtml = `
        <div class="modal fade" id="searchResultsModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Quartos Disponíveis</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="search-summary mb-4 p-3 bg-light rounded">
                            <h6>Detalhes da Busca:</h6>
                            <p class="mb-1">Check-in: ${formatDate(searchParams.checkin)}</p>
                            <p class="mb-1">Check-out: ${formatDate(searchParams.checkout)}</p>
                            <p class="mb-1">${searchParams.nights} noite(s), ${searchParams.guests} hóspede(s), ${searchParams.rooms} quarto(s)</p>
                        </div>
                        
                        <div class="available-rooms">
                            <div class="room-option mb-3 p-3 border rounded">
                                <div class="row align-items-center">
                                    <div class="col-md-4">
                                        <div class="room-image-small" style="height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;"></div>
                                    </div>
                                    <div class="col-md-5">
                                        <h6>Quarto Deluxe</h6>
                                        <p class="small mb-2">Vista panorâmica da cidade, 35m²</p>
                                        <div class="amenities">
                                            <span class="badge bg-light text-dark me-1">Wi-Fi</span>
                                            <span class="badge bg-light text-dark me-1">Banheira</span>
                                            <span class="badge bg-light text-dark">Mini bar</span>
                                        </div>
                                    </div>
                                    <div class="col-md-3 text-end">
                                        <div class="h5 text-warning">€250/noite</div>
                                        <div class="text-muted small mb-2">Total: €${250 * searchParams.nights}</div>
                                        <button class="btn btn-sm btn-reserve" onclick="showBookingModal('Quarto Deluxe', '€250/noite')">Selecionar</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="room-option mb-3 p-3 border rounded">
                                <div class="row align-items-center">
                                    <div class="col-md-4">
                                        <div class="room-image-small" style="height: 150px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px;"></div>
                                    </div>
                                    <div class="col-md-5">
                                        <h6>Suíte Executive</h6>
                                        <p class="small mb-2">Sala de estar privativa, 60m²</p>
                                        <div class="amenities">
                                            <span class="badge bg-light text-dark me-1">Varanda</span>
                                            <span class="badge bg-light text-dark me-1">Mordomo</span>
                                            <span class="badge bg-light text-dark">Jacuzzi</span>
                                        </div>
                                    </div>
                                    <div class="col-md-3 text-end">
                                        <div class="h5 text-warning">€450/noite</div>
                                        <div class="text-muted small mb-2">Total: €${450 * searchParams.nights}</div>
                                        <button class="btn btn-sm btn-reserve" onclick="showBookingModal('Suíte Executive', '€450/noite')">Selecionar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', resultsHtml);
    
    const modalElement = document.getElementById('searchResultsModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}