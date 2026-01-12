// Gallery functionality
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const background = this.style.background;
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