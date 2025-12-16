/* ==========================================================================
   ARQUIVO: js/main.js
   DESCRIÇÃO: Efeitos Visuais (Matrix, Header, Slides) - SEM LÓGICA DE CHAT
   ATUALIZADO: Limpeza de conflitos com o assistente.js
   ==========================================================================
*/

document.addEventListener('DOMContentLoaded', function () {

    /* 1. MATRIX RAIN (FUNDO VERDE) */
    const canvas = document.getElementById('matrixCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Ajuste para tela cheia e redimensionamento
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
            ctx.fillStyle = '#0F0'; // Cor Verde Matrix
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                
                // Aleatoriedade para brilho branco
                if (Math.random() > 0.98) ctx.fillStyle = '#FFF'; 
                else ctx.fillStyle = '#0F0';
                
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        setInterval(draw, 33);
    }

    /* 2. SMART HEADER (CABEÇALHO QUE SOME/APARECE) */
    let lastScroll = 0;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        // Adiciona fundo escuro ao rolar
        if (currentScroll > 50) header.classList.add('header-scrolled');
        else header.classList.remove('header-scrolled');

        // Esconde header ao rolar para baixo, mostra ao subir
        if (currentScroll > lastScroll && currentScroll > 100) header.classList.add('hide-header');
        else header.classList.remove('hide-header');
        
        lastScroll = currentScroll <= 0 ? 0 : currentScroll;

        // Ativa link do menu conforme a seção visível
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        let currentId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 250)) currentId = section.getAttribute('id');
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) link.classList.add('active');
        });
    });

    /* 3. CARROSSELS (CONFIGURAÇÃO VISUAL 3D) */
    if(typeof Swiper !== 'undefined') {
        
        // Configuração Padrão 3D Coverflow
        const swiperOptions = {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            loop: true,
            coverflowEffect: {
                rotate: 40,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
            speed: 800,
            autoplay: { delay: 2500, disableOnInteraction: false },
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        };

        // Inicia Certificados
        new Swiper(".certificacoes-swiper-container", swiperOptions);

        // Inicia Galeria de Atuação
        new Swiper(".experiencia-gallery", swiperOptions);
    }
    
    /* 4. INICIALIZAÇÃO DE ANIMAÇÕES (AOS) */
    if(typeof AOS !== 'undefined') {
        AOS.init({ 
            duration: 800, 
            once: true,
            offset: 100
        });
    }
    
    // Atualiza Ano do Rodapé
    const yearSpan = document.getElementById("currentYear");
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();
});
















