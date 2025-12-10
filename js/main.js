// js/main.js

document.addEventListener('DOMContentLoaded', function () {

    // Inicialização do AOS (Animate On Scroll)
    // Esta função fará suas seções aparecerem com animação ao rolar.
    try {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 700,
                once: true,
                offset: 80,
                easing: 'ease-out-quad',
            });
        } else {
            console.warn("Biblioteca AOS (Animate on Scroll) não foi encontrada.");
        }
    } catch(e) {
        console.error("Erro ao inicializar o AOS:", e);
    }

    // Inicialização do Swiper para Certificações
    // Esta função transformará sua lista de imagens em um carrossel funcional.
    try {
        const swiperCertContainer = document.querySelector(".certificacoes-swiper-container");
        if (typeof Swiper !== 'undefined' && swiperCertContainer) {
            new Swiper(".certificacoes-swiper-container", {
                slidesPerView: 1, // Padrão para telas pequenas
                spaceBetween: 20,
                loop: true,
                grabCursor: true,
                centeredSlides: true,
                autoplay: {
                    delay: 1200,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                breakpoints: {
                    768: { // Para tablets
                        slidesPerView: 2,
                        spaceBetween: 30
                    },
                    1024: { // Para desktops, mostrando 3 slides como você pediu
                        slidesPerView: 3,
                        spaceBetween: 30
                    }
                }
            });
        } else {
            if (!swiperCertContainer) console.warn("Container do Swiper (.certificacoes-swiper-container) não encontrado.");
            if (typeof Swiper === 'undefined') console.warn("Biblioteca Swiper não foi encontrada.");
        }
    } catch(e) {
        console.error("Erro ao inicializar o Swiper:", e);
    }
    
    // Lógica do Ano Atual no Rodapé e Navegação Ativa
    try {
        const currentYearElement = document.getElementById("currentYear");
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }

        const navLinks = document.querySelectorAll('header nav ul li a');
        const sections = document.querySelectorAll('main section, footer#contato-footer');
        const header = document.querySelector('header');

        if (navLinks.length > 0 && sections.length > 0 && header) {
            const headerHeight = header.offsetHeight;
            window.addEventListener('scroll', () => {
                let currentSectionId = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop - headerHeight - 100;
                    if (window.pageYOffset >= sectionTop) {
                        currentSectionId = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });
            });
        }
    } catch(e) {
        console.error("Erro ao configurar a navegação:", e);
    }
});


































































































































