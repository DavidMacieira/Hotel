// base de dados simplificado do hotel
const hotelData = {
    rooms: [
        {id:1, name:"Quarto Deluxe", type:"Deluxe", price:250, maxGuests:2, status:"available"},
        {id:2, name:"Suíte Executive", type:"Suite", price:450, maxGuests:3, status:"available"},
        {id:3, name:"Suíte Presidential", type:"Presidential", price:800, maxGuests:4, status:"available"}
    ],
    
    bookings: [
        {id:1, roomId:1, roomName:"Quarto Deluxe", guestName:"João Silva", guestEmail:"cliente@exemplo.com", 
         checkIn:"2026-01-15", checkOut:"2026-01-20", guests:2, nights:5, totalPrice:1250, status:"confirmed"}
    ],
    
    // Verifica disponibilidade do quarto
    checkAvailability: function(roomId, checkin, checkout) {
        const checkInDate = new Date(checkin);
        const checkOutDate = new Date(checkout);
        
        // Verifica se há reservas conflitantes
        const hasConflict = this.bookings.some(booking => {
            if(booking.roomId !== roomId || booking.status === "cancelled") return false;
            
            const bookingCheckIn = new Date(booking.checkIn);
            const bookingCheckOut = new Date(booking.checkOut);
            
            return (checkInDate >= bookingCheckIn && checkInDate < bookingCheckOut) ||
                   (checkOutDate > bookingCheckIn && checkOutDate <= bookingCheckOut);
        });
        
        return !hasConflict;
    }
};

// Carrega dados do localStorage
if(localStorage.getItem('hotelRooms')) {
    hotelData.rooms = JSON.parse(localStorage.getItem('hotelRooms'));
}
if(localStorage.getItem('hotelBookings')) {
    hotelData.bookings = JSON.parse(localStorage.getItem('hotelBookings'));
}