/* ==========================================================================
   ARQUIVO: js/main.js
   DESCRIÇÃO: Lógica Visual (Matrix, Header Imersivo, Carrossel 3D)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
    console.log("Sistema Iniciado - Main JS carregado com sucesso.");

    /* --------------------------------------------------------------------------
       1. MATRIX RAIN (FUNDO)
       -------------------------------------------------------------------------- */
    const canvas = document.getElementById('matrixCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Ajuste dinâmico para tela cheia
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;
        
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        for (let x = 0; x < columns; x++) drops[x] = 1;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0'; // Cor Verde Hacker
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                
                // 2% de chance de brilho branco
                if (Math.random() > 0.98) ctx.fillStyle = '#FFF'; 
                else ctx.fillStyle = '#0F0';
                
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        setInterval(draw, 33);
    }

    /* --------------------------------------------------------------------------
       2. SMART HEADER (IMERSIVO + MENU ATIVO)
       -------------------------------------------------------------------------- */
    let lastScroll = 0;
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            // 1. Efeito de Vidro Escuro (Header Scrolled)
            if (currentScroll > 50) header.classList.add('header-scrolled');
            else header.classList.remove('header-scrolled');

            // 2. Esconde ao rolar para baixo, mostra ao subir (Opcional, mantido conforme pedido)
            if (currentScroll > lastScroll && currentScroll > 100) header.classList.add('hide-header');
            else header.classList.remove('hide-header');
            
            lastScroll = currentScroll <= 0 ? 0 : currentScroll;

            // 3. Link Ativo no Menu (Scroll Spy)
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-link'); // Certifique-se que seus links no HTML tem essa classe
            let currentId = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // Detecta qual seção está no meio da tela
                if (window.scrollY >= (sectionTop - 300)) currentId = section.getAttribute('id');
            });
            
            if (navLinks.length > 0) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) link.classList.add('active');
                });
            }
        });
    }

    /* --------------------------------------------------------------------------
       3. CARROSSELS (SWIPER COM RESPONSIVIDADE)
       -------------------------------------------------------------------------- */
    if(typeof Swiper !== 'undefined') {
        
        // Configuração Unificada (Funciona para Certificados e Galeria)
        const swiperOptions = {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto", // Importante: Respeita o CSS
            loop: true,
            coverflowEffect: {
                rotate: 40,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
            speed: 800,
            // Autoplay suave
            autoplay: { delay: 3000, disableOnInteraction: false },
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            
            // === ADIÇÃO CRÍTICA: RESPONSIVIDADE ===
            // Ajusta o comportamento dependendo do tamanho da tela
            breakpoints: {
                // Celular (Até 768px): Fica focado em 1 slide
                320: {
                    effect: "coverflow", // Mantém o efeito 3D mesmo no celular
                    slidesPerView: "auto",
                    spaceBetween: 20
                },
                // Desktop (Maior que 768px): Espalha mais os slides
                768: {
                    slidesPerView: "auto", 
                    coverflowEffect: {
                        rotate: 30, // Menos rotação no desktop para leitura fácil
                        stretch: 0,
                        depth: 150
                    }
                }
            }
        };

        // Inicia Certificados
        const swiperCert = new Swiper(".certificacoes-swiper-container", swiperOptions);

        // Inicia Galeria
        const swiperGal = new Swiper(".experiencia-gallery", swiperOptions);
    }
    
    /* --------------------------------------------------------------------------
       4. INICIALIZAÇÃO DE ANIMAÇÕES (AOS)
       -------------------------------------------------------------------------- */
    if(typeof AOS !== 'undefined') {
        AOS.init({ 
            duration: 800, 
            once: true,
            offset: 100
        });
    }
    
    // Atualiza Ano do Rodapé Automaticamente
    const yearSpan = document.getElementById("currentYear");
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();
});













