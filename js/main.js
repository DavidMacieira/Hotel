// Main JavaScript File
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavbar();
    initSmoothScroll();
    initBooking();
    initRoomBooking();
    initGallery();
    initContactForm();
    initNewsletter();
    initDiscoverButton();
    initAnimations();
});

// Navbar scroll effect
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Reserve button in navbar
    const reserveBtn = document.getElementById('reserveBtn');
    if (reserveBtn) {
        reserveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showBookingModal();
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's an external link or just #
            if (href === '#' || href.startsWith('http') || href.includes('login')) {
                return;
            }
            
            e.preventDefault();
            const targetId = href;
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize booking functionality
function initBooking() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!checkinInput || !checkoutInput || !searchBtn) return;
    
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
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleBookingSearch(checkinInput, checkoutInput);
    });
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
    const guests = document.getElementById('guests')?.value || '1';
    const rooms = document.getElementById('roomsCount')?.value || '1';
    
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
    
    // Show loading state
    const searchBtn = document.getElementById('searchBtn');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
    searchBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
        
        // Show success message
        alert('Busca realizada com sucesso! Em breve você será redirecionado para os resultados disponíveis.');
    }, 1500);
}

// Initialize room booking buttons
function initRoomBooking() {
    document.querySelectorAll('.book-room').forEach(button => {
        button.addEventListener('click', function() {
            const roomName = this.getAttribute('data-room');
            const roomPrice = this.getAttribute('data-price');
            showBookingModal(roomName, roomPrice);
        });
    });
}

// Show booking modal
function showBookingModal(roomName = '', roomPrice = '') {
    const modalHtml = `
        <div class="modal fade" id="bookingModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Reserva ${roomName ? ' - ' + roomName : ''}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${roomPrice ? `<p class="text-center h4 text-warning">${roomPrice}</p>` : ''}
                        <p class="text-center">Redirecionando para nosso sistema de reservas...</p>
                        <div class="text-center">
                            <div class="spinner-border text-warning" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modalElement = document.getElementById('bookingModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Remove modal on close
    modalElement.addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
    
    // Simulate booking process
    setTimeout(() => {
        modal.hide();
        modalElement.remove();
        alert('Sistema de reservas em manutenção. Por favor, entre em contato pelo telefone: +351 21 123 4567');
    }, 2000);
}

// Initialize gallery
function initGallery() {
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', function() {
            const background = this.getAttribute('data-bg');
            showGalleryLightbox(background);
        });
    });
}

function showGalleryLightbox(background) {
    const lightboxHtml = `
        <div class="modal fade" id="galleryModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Galeria do Hotel</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="gallery-modal-image" style="
                            height: 400px;
                            background: ${background};
                            border-radius: 10px;
                            margin-bottom: 20px;
                        "></div>
                        <p class="text-muted">Instalações do DWM Hotel Hotel</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', lightboxHtml);
    
    const modalElement = document.getElementById('galleryModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Initialize contact form
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('contactSubmit');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
            submitBtn.classList.add('bg-success');
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.classList.remove('bg-success');
                submitBtn.disabled = false;
                contactForm.reset();
                alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            }, 2000);
        }, 1500);
    });
}

// Initialize newsletter
function initNewsletter() {
    const newsletterBtn = document.getElementById('newsletterBtn');
    const newsletterEmail = document.getElementById('newsletterEmail');
    
    if (!newsletterBtn || !newsletterEmail) return;
    
    newsletterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!newsletterEmail.value || !newsletterEmail.value.includes('@')) {
            alert('Por favor, insira um email válido.');
            return;
        }
        
        newsletterEmail.value = '';
        this.innerHTML = '<i class="fas fa-check"></i> Inscrito!';
        this.classList.add('bg-success');
        
        setTimeout(() => {
            this.innerHTML = 'Enviar';
            this.classList.remove('bg-success');
            alert('Obrigado por se inscrever em nossa newsletter!');
        }, 3000);
    });
}

// Initialize discover button
function initDiscoverButton() {
    const discoverBtn = document.getElementById('discoverBtn');
    if (discoverBtn) {
        discoverBtn.addEventListener('click', function() {
            const servicesSection = document.getElementById('services');
            if (servicesSection) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = servicesSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Initialize animations on scroll
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}