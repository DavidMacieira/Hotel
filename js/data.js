// data.js - Armazenamento de dados em arrays

// Quartos disponíveis no hotel
const rooms = [
    {
        id: 1,
        name: "Quarto Deluxe",
        type: "Deluxe",
        price: 250,
        size: "35m²",
        amenities: ["Wi-Fi alta velocidade", "Banheira hidromassagem", "Mini bar premium"],
        maxGuests: 2,
        image: "img/rooms/quarto1.jpg"
    },
    {
        id: 2,
        name: "Suíte Executive",
        type: "Suite",
        price: 450,
        size: "60m²",
        amenities: ["Sala de estar privativa", "Varanda exclusiva", "Serviço de mordomo"],
        maxGuests: 3,
        image: "img/rooms/quarto2.jpg"
    },
    {
        id: 3,
        name: "Suíte Presidential",
        type: "Presidential",
        price: 800,
        size: "120m²",
        amenities: ["Piano de cauda", "Jacuzzi privativa", "Chef pessoal"],
        maxGuests: 4,
        image: "img/rooms/quarto3.jpg"
    },
    {
        id: 4,
        name: "Quarto Standard",
        type: "Standard",
        price: 150,
        size: "25m²",
        amenities: ["Wi-Fi", "TV LCD", "Ar condicionado"],
        maxGuests: 2,
        image: "img/rooms/quarto4.jpg"
    },
    {
        id: 5,
        name: "Suíte Familiar",
        type: "Suite",
        price: 350,
        size: "45m²",
        amenities: ["2 Quartos", "Cozinha pequena", "Área infantil"],
        maxGuests: 5,
        image: "img/rooms/quarto5.jpg"
    },
    {
        id: 6,
        name: "Quarto Vista Mar",
        type: "Vista Mar",
        price: 300,
        size: "30m²",
        amenities: ["Vista mar", "Varanda", "Cafeteira"],
        maxGuests: 2,
        image: "img/rooms/quarto6.jpg"
    }
];

// Reservas - apenas para 2025
let bookings = [
    {
        id: 1,
        roomId: 1,
        roomName: "Quarto Deluxe",
        guestName: "João Silva",
        guestEmail: "joao@email.com",
        checkIn: "2025-01-15",
        checkOut: "2025-01-20",
        guests: 2,
        nights: 5,
        totalPrice: 1250,
        status: "confirmed" // confirmed, cancelled, completed
    },
    {
        id: 2,
        roomId: 2,
        roomName: "Suíte Executive",
        guestName: "Maria Santos",
        guestEmail: "maria@email.com",
        checkIn: "2025-02-10",
        checkOut: "2025-02-15",
        guests: 3,
        nights: 5,
        totalPrice: 2250,
        status: "confirmed"
    },
    {
        id: 3,
        roomId: 3,
        roomName: "Suíte Presidential",
        guestName: "Carlos Oliveira",
        guestEmail: "carlos@email.com",
        checkIn: "2025-03-01",
        checkOut: "2025-03-05",
        guests: 4,
        nights: 4,
        totalPrice: 3200,
        status: "cancelled"
    },
    {
        id: 4,
        roomId: 4,
        roomName: "Quarto Standard",
        guestName: "Ana Costa",
        guestEmail: "ana@email.com",
        checkIn: "2025-04-20",
        checkOut: "2025-04-25",
        guests: 2,
        nights: 5,
        totalPrice: 750,
        status: "completed"
    }
];

// Utilizadores do sistema de Login (Contas para puder entrar na pagina de login e admin)
const users = [
    {
        id: 1,
        email: "cliente@exemplo.com",
        password: "123456",
        name: "João Silva",
        type: "client"
    },
    {
        id: 2,
        email: "lucasmoura@gmail.com",
        password: "123456",
        name: "Lucas Moura",
        type: "client"
    },
    {
        id: 3,
        email: "admin@grandelysee.com",
        password: "admin123",
        name: "Administrador",
        type: "admin"
    }
];

// Tarifas por tipo de quarto
const tariffs = [
    { type: "Standard", basePrice: 150, highSeason: 180, lowSeason: 120 },
    { type: "Deluxe", basePrice: 250, highSeason: 300, lowSeason: 200 },
    { type: "Suite", basePrice: 350, highSeason: 420, lowSeason: 280 },
    { type: "Vista Mar", basePrice: 300, highSeason: 360, lowSeason: 240 },
    { type: "Presidential", basePrice: 800, highSeason: 960, lowSeason: 640 }
];

// Mês de alta/baixa temporada (2025)
const highSeason2025 = ["06", "07", "08", "12"]; // Jun, Jul, Ago, Dez
const lowSeason2025 = ["01", "02", "03", "11"]; // Jan, Fev, Mar, Nov

// Funções para manipulação de dados
function getRoomById(id) {
    return rooms.find(room => room.id === id);
}

function getBookingById(id) {
    return bookings.find(booking => booking.id === id);
}

function getUserByEmail(email) {
    return users.find(user => user.email === email);
}

function addBooking(newBooking) {
    newBooking.id = bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
    bookings.push(newBooking);
    saveToLocalStorage();
    return newBooking;
}

function cancelBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = "cancelled";
        saveToLocalStorage();
    }
}

function calculateTotalPrice(roomPrice, checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return roomPrice * nights;
}

function getMonthlyStats(year = 2025) {
    const monthlyStats = {};
    
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const monthKey = `${year}-${monthStr}`;
        
        // Filtra reservas para este mês
        const monthBookings = bookings.filter(booking => {
            const bookingMonth = booking.checkIn.substring(0, 7);
            return bookingMonth === monthKey && booking.status !== "cancelled";
        });
        
        // Calcula estatísticas
        const totalRevenue = monthBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
        const totalNights = monthBookings.reduce((sum, booking) => sum + booking.nights, 0);
        const totalBookings = monthBookings.length;
        
        monthlyStats[monthKey] = {
            month: month,
            year: year,
            totalRevenue: totalRevenue,
            totalNights: totalNights,
            totalBookings: totalBookings,
            avgRevenuePerNight: totalNights > 0 ? totalRevenue / totalNights : 0
        };
    }
    
    return monthlyStats;
}

function getYearlyStats(year = 2025) {
    const stats = getMonthlyStats(year);
    const yearlyStats = {
        totalRevenue: 0,
        totalNights: 0,
        totalBookings: 0,
        months: stats
    };
    
    Object.values(stats).forEach(month => {
        yearlyStats.totalRevenue += month.totalRevenue;
        yearlyStats.totalNights += month.totalNights;
        yearlyStats.totalBookings += month.totalBookings;
    });
    
    yearlyStats.avgRevenuePerNight = yearlyStats.totalNights > 0 ? yearlyStats.totalRevenue / yearlyStats.totalNights : 0;
    
    return yearlyStats;
}

function saveToLocalStorage() {
    localStorage.setItem('hotelBookings', JSON.stringify(bookings));
}

function loadFromLocalStorage() {
    const savedBookings = localStorage.getItem('hotelBookings');
    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    }
}

// Carrega dados do localStorage ao iniciar
loadFromLocalStorage();

// Exporta as variáveis e funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        rooms,
        bookings,
        users,
        tariffs,
        getRoomById,
        getBookingById,
        getUserByEmail,
        addBooking,
        cancelBooking,
        calculateTotalPrice,
        getMonthlyStats,
        getYearlyStats,
        saveToLocalStorage,
        loadFromLocalStorage
    };
}