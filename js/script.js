// Função para abrir o modal e pré-selecionar o quarto clicado
function abrirReserva(nomeQuarto) {
    // Seleciona o elemento select do modal
    const select = document.getElementById('selectQuarto');
    
    // Define o valor do select para o quarto clicado
    select.value = nomeQuarto;
    
    // Abre o modal usando a API do Bootstrap
    const modalReserva = new bootstrap.Modal(document.getElementById('modalReserva'));
    modalReserva.show();
}

// Lidar com o envio do formulário
document.getElementById('formReserva').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento da página

    // Captura os dados (aqui você enviaria para um backend real)
    const quarto = document.getElementById('selectQuarto').value;
    const checkin = document.querySelector('input[type="date"]').value;

    // Simulação de sucesso
    alert(`Obrigado! Sua reserva para a ${quarto} foi solicitada com sucesso.\nEntraremos em contato em breve.`);

    // Fecha o modal
    const modalElement = document.getElementById('modalReserva');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
    
    // Limpa o formulário
    this.reset();
});