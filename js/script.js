// --- Configurações Iniciais ---
const UNLOCK_PASSWORD = "LIBERARPELE"; // Senha para upsell

// --- Navegação entre Abas ---
function changeTab(tabId, element = null) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');

    if (element) {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        element.classList.add('active');
    } else {
        // Caso chamado num botão genérico sem passar o 'this', remover seleção de abas
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabId !== 'inicio') {
        const audioMain = document.getElementById('main-audio');
        if (audioMain && !audioMain.paused) toggleAudio();
    }
}

// --- Audio Player Customizado ---
const audio = document.getElementById('main-audio');
const playBtn = document.getElementById('play-btn');
const timeDisplay = document.getElementById('time-display');
const wavesContainer = document.getElementById('waves-container');
let waves = [];

// Gerar barras de onda
for (let i = 0; i < 15; i++) {
    let wave = document.createElement('div');
    wave.className = 'wave';
    wave.style.height = (Math.random() * 15 + 5) + 'px';
    wavesContainer.appendChild(wave);
    waves.push(wave);
}

function animateWaves() {
    if (!audio.paused) {
        waves.forEach(wave => {
            wave.style.height = (Math.random() * 15 + 5) + 'px';
            wave.classList.add('active');
        });
        requestAnimationFrame(() => setTimeout(animateWaves, 150));
    } else {
        waves.forEach(wave => {
            wave.style.height = '5px';
            wave.classList.remove('active');
        });
    }
}

function toggleAudio() {
    if (audio.paused) {
        audio.play().catch(e => console.log("Erro autoplay", e));
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        animateWaves();
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

playBtn.addEventListener('click', toggleAudio);

audio.addEventListener('timeupdate', () => {
    let current = audio.currentTime;
    let mins = Math.floor(current / 60);
    let secs = Math.floor(current % 60);
    if (secs < 10) secs = "0" + secs;
    timeDisplay.textContent = mins + ":" + secs;
});

audio.addEventListener('ended', () => {
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    waves.forEach(wave => { wave.style.height = '5px'; wave.classList.remove('active'); });
});

const audioObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && audio.currentTime === 0) {
            // Tenta autoplay silencioso ou normal
            let promise = audio.play();
            if (promise !== undefined) {
                promise.then(_ => {
                    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    animateWaves();
                }).catch(error => {
                    console.log("Autoplay bloqueado pelo browser. Interação necessária.");
                });
            }
            audioObserver.disconnect(); // Tenta apenas uma vez
        }
    });
}, { threshold: 0.5 });

audioObserver.observe(document.getElementById('audio-container'));


// --- Lógica Modal de Senha ---
function openUnlockModal() {
    document.getElementById('vip-modal').classList.add('active');
    document.getElementById('vip-password').value = '';
    document.getElementById('pwd-error').style.display = 'none';
}

function closeUnlockModal() {
    document.getElementById('vip-modal').classList.remove('active');
}

function checkPassword() {
    const pass = document.getElementById('vip-password').value;
    if (pass === UNLOCK_PASSWORD) {
        closeUnlockModal();
        // Desbloqueia vídeo
        const videoContainer = document.getElementById('upsell-content-video');
        videoContainer.style.display = 'block';
        videoContainer.style.animation = 'fadeInUp 0.8s forwards';
        
        const iframe = document.getElementById('iframe-upsell');
        iframe.src = "https://www.youtube.com/embed/b-V9IU0SBzs?rel=0&autoplay=1";
        iframe.style.filter = "none";
        document.getElementById('overlay-upsell').style.display = 'none';
    } else {
        document.getElementById('pwd-error').style.display = 'block';
    }
}

// Fechar modal ao clicar no overlay (fora do conteúdo)
document.getElementById('vip-modal').addEventListener('click', function(event) {
    // Se o clique foi no próprio overlay (id="vip-modal") e não em seus filhos (modal-content)
    if (event.target === this) {
        closeUnlockModal();
    }
});

// --- Notificações dinâmicas de Prova Social ---
const nomesFemininos = ["Marta", "Maria", "Ana", "Paula", "Juliana", "Vera", "Sônia", "Fátima", "Beatriz", "Carla", "Denise", "Helena", "Lúcia", "Rosa", "Silvana", "Neuza", "Tereza", "Neuza"];
const frasesSociais = [
    "{nome} entrou agora no grupo ✨",
    "{nome} acabou de entrar no grupo ✨",
    "+{num} mulheres acabaram de entrar no grupo 🔥",
    "{nome1} e {nome2} entraram agora ✨",
    "{nome} se juntou ao grupo 🌸",
    "Mais uma mulher conectada ao grupo 💚"
];

function showToast() {
    const toastText = document.getElementById('toast-text');
    const toastObj = document.getElementById('wpp-toast');
    
    if(!toastObj || !toastText) return;

    // Gerar mensagem dinâmica
    let msgRandom = frasesSociais[Math.floor(Math.random() * frasesSociais.length)];
    let finalMsg = msgRandom;

    if (msgRandom.includes("{nome1}")) {
        const n1 = nomesFemininos[Math.floor(Math.random() * nomesFemininos.length)];
        let n2 = nomesFemininos[Math.floor(Math.random() * nomesFemininos.length)];
        while(n1 === n2) n2 = nomesFemininos[Math.floor(Math.random() * nomesFemininos.length)];
        finalMsg = msgRandom.replace("{nome1}", n1).replace("{nome2}", n2);
    } else if (msgRandom.includes("{nome}")) {
        const n = nomesFemininos[Math.floor(Math.random() * nomesFemininos.length)];
        finalMsg = msgRandom.replace("{nome}", n);
    } else if (msgRandom.includes("{num}")) {
        const num = Math.floor(Math.random() * 4) + 2; // +2 a +5 mulheres
        finalMsg = msgRandom.replace("{num}", num);
    }

    // Efeito de troca suave
    toastObj.style.opacity = '0';
    toastObj.style.transform = 'translateY(5px)';
    
    setTimeout(() => {
        toastText.textContent = finalMsg;
        toastObj.style.opacity = '1';
        toastObj.style.transform = 'translateY(0)';
        
        // Efeito de Glimmer (brilho rápido)
        toastObj.classList.add('glimmer');
        setTimeout(() => toastObj.classList.remove('glimmer'), 1000);
    }, 400);
}

// Iniciar rodízio a cada 3 segundos
setInterval(showToast, 3500); // 3.5s total entre trocas

// --- Progresso Dias (LocalStorage) ---
const totalDays = 15;

function initDaysGrid() {
    // Obter progresso salvo
    let savedProgress = JSON.parse(localStorage.getItem('chaVitalidadeProgress')) || [];

    const styleBtn = `
            width: 50px; height: 50px; border-radius: 12px; border: 2px solid #ddd; 
            background: white; display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 1.1rem; cursor: pointer; color: #888;
            transition: all 0.2s; -webkit-tap-highlight-color: transparent;
        `;

    function createButtons(startDay, endDay, containerId, color) {
        const container = document.getElementById(containerId);
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.justifyContent = 'space-between';

        for (let i = startDay; i <= endDay; i++) {
            let btn = document.createElement('button');
            btn.textContent = i;
            btn.style.cssText = styleBtn;

            // Se estiver concluído
            if (savedProgress.includes(i)) {
                btn.classList.add('done');
                btn.style.background = color;
                btn.style.borderColor = color;
                btn.style.color = 'white';
            }

            btn.onclick = function () {
                let progress = JSON.parse(localStorage.getItem('chaVitalidadeProgress')) || [];

                if (this.classList.contains('done')) {
                    // Desmarcar
                    this.classList.remove('done');
                    this.style.background = 'white';
                    this.style.borderColor = '#ddd';
                    this.style.color = '#888';
                    progress = progress.filter(item => item !== i);
                } else {
                    // Marcar
                    this.classList.add('done');
                    this.style.background = color;
                    this.style.borderColor = color;
                    this.style.color = 'white';
                    if (!progress.includes(i)) progress.push(i);

                    // Pequena anim/vibrate pra mobile
                    this.style.transform = 'scale(0.9)';
                    setTimeout(() => this.style.transform = 'scale(1)', 100);
                    if (navigator.vibrate) navigator.vibrate(50);
                }

                localStorage.setItem('chaVitalidadeProgress', JSON.stringify(progress));
                updateProgressBar();
            };

            container.appendChild(btn);
        }
    }

    createButtons(1, 5, 'grid-w1', '#ab47bc');
    createButtons(6, 10, 'grid-w2', '#ff9800');
    createButtons(11, 15, 'grid-w3', 'var(--green-success)');
    updateProgressBar();
}

function updateProgressBar() {
    let progress = JSON.parse(localStorage.getItem('chaVitalidadeProgress')) || [];
    let count = progress.length;
    document.getElementById('days-completed').textContent = count;
    document.getElementById('progress-bar-fill').style.width = (count / totalDays * 100) + '%';
}

// --- Avaliação de Sintomas (LocalStorage) ---
function initStars() {
    const sintomas = [
        { id: 'energia', label: 'Energia Vital' },
        { id: 'libido', label: 'Apetite Sexual' },
        { id: 'humor', label: 'Estabilidade de Humor' },
        { id: 'sono', label: 'Qualidade do Sono' },
        { id: 'caloroes', label: 'Alívio de Calorões' }
    ];

    let savedStars = JSON.parse(localStorage.getItem('chaVitalidadeStars')) || {};
    const container = document.getElementById('stars-container');

    sintomas.forEach(s => {
        let row = document.createElement('div');
        row.style.marginBottom = '15px';

        let label = document.createElement('div');
        label.textContent = s.label;
        label.style.fontWeight = 'bold';
        label.style.marginBottom = '5px';
        label.style.color = 'var(--text-dark)';

        let starsDiv = document.createElement('div');
        starsDiv.style.display = 'flex';
        starsDiv.style.gap = '10px';
        starsDiv.style.justifyContent = 'center';

        let currentRating = savedStars[s.id] || 0;

        for (let i = 1; i <= 5; i++) {
            let star = document.createElement('i');
            star.className = i <= currentRating ? 'fa-solid fa-star' : 'fa-regular fa-star';
            star.style.color = i <= currentRating ? 'var(--accent-gold)' : '#ccc';
            star.style.fontSize = '1.5rem';
            star.style.cursor = 'pointer';

            star.onclick = function () {
                // Update state
                savedStars[s.id] = i;
                localStorage.setItem('chaVitalidadeStars', JSON.stringify(savedStars));

                // Update UI
                Array.from(starsDiv.children).forEach((childStar, idx) => {
                    let val = idx + 1;
                    childStar.className = val <= i ? 'fa-solid fa-star' : 'fa-regular fa-star';
                    childStar.style.color = val <= i ? 'var(--accent-gold)' : '#ccc';

                    if (val <= i) {
                        childStar.style.transform = 'scale(1.2)';
                        setTimeout(() => childStar.style.transform = 'scale(1)', 200);
                    }
                });
            };

            starsDiv.appendChild(star);
        }

        row.appendChild(label);
        row.appendChild(starsDiv);
        container.appendChild(row);
    });
}

// --- Cópia da Chave PIX ---
function copyPix(elementId) {
    let chave = "69993755058"; 
    
    if (elementId) {
        const el = document.getElementById(elementId);
        if (el) chave = el.innerText.replace(/\s|[()]/g, '');
    }

    // Metodo moderno
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(chave).then(showCopyToast);
    } else {
        // Fallback mobile
        let tempInput = document.createElement("input");
        tempInput.value = chave;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        showCopyToast();
    }
}

function showCopyToast() {
    const toast = document.getElementById('copy-toast');
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 2500);
}

// --- Auto Carousel ---
function initAutoCarousel() {
    const carousel = document.getElementById('auto-carousel');
    if (!carousel) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let autoScrollInterval;
    const scrollStep = 0.5; // Changed from 1 to 0.5 to slow down speed
    const scrollSpeed = 20; // Ms between frames

    // Auto scroll logic with delay
    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            if (isDown) return;
            
            const cardWidth = carousel.querySelector('.product-card').offsetWidth + 15; // Width + gap
            carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
            
            // Reached end? Reset
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
                setTimeout(() => {
                    carousel.scrollTo({ left: 0, behavior: 'smooth' });
                }, 2000);
            }
        }, 3500); // 3.5 seconds delay between rotations
    }

    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }

    // Mouse events for manual drag
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        stopAutoScroll();
        carousel.classList.add('active');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('active');
        startAutoScroll();
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('active');
        startAutoScroll();
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    carousel.addEventListener('touchstart', stopAutoScroll, { passive: true });
    carousel.addEventListener('touchend', startAutoScroll, { passive: true });

    // Start the auto scroll initially
    startAutoScroll();
}

// Iniciar tudo ao carregar
window.addEventListener('DOMContentLoaded', () => {
    initDaysGrid();
    initStars();
    initAutoCarousel();
});