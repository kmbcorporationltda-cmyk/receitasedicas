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

            // Pausar audios se sair da aba inicio
            if (tabId !== 'inicio') {
                const audioMain = document.getElementById('main-audio');
                const audioUpsell = document.getElementById('upsell-audio');
                if (audioMain && !audioMain.paused) toggleAudio();
                if (audioUpsell && !audioUpsell.paused) toggleUpsellAudio();
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

        // --- Audio Upsell Logic ---
        const upsellAudio = document.getElementById('upsell-audio');
        const playUpsellBtn = document.getElementById('play-upsell-btn');
        const timeUpsellDisplay = document.getElementById('time-upsell-display');
        const wavesUpsellContainer = document.getElementById('waves-upsell-container');
        let isUpsellPlaying = false;
        let upsellTimerInterval;
        let hasStartedPlaying = false; // Flag to track if playback has started
        let contentRevealed = false; // Flag to prevent triggering the reveal multiple times

        // Initialize Waves (Visual only)
        for (let i = 0; i < 30; i++) {
            const wave = document.createElement('div');
            wave.className = 'wave';
            wavesUpsellContainer.appendChild(wave);
        }

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        function animateUpsellWaves() {
            const waves = wavesUpsellContainer.querySelectorAll('.wave');
            waves.forEach(wave => {
                if (isUpsellPlaying) {
                    wave.style.height = `${Math.random() * 20 + 5}px`;
                    wave.classList.add('active');
                } else {
                    wave.style.height = '4px';
                    wave.classList.remove('active');
                }
            });
        }

        function toggleUpsellAudio() {
            if (!upsellAudio) return; // Ensure audio element exists
            if (isUpsellPlaying) {
                upsellAudio.pause();
                isUpsellPlaying = false;
                playUpsellBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                clearInterval(upsellTimerInterval);
                animateUpsellWaves();
            } else {
                upsellAudio.play().then(() => {
                    isUpsellPlaying = true;
                    playUpsellBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    
                    // Specific logic to reveal content after 15 seconds of playback START (not elapsed time)
                    if (!hasStartedPlaying && !contentRevealed) {
                        hasStartedPlaying = true;
                        
                        setTimeout(() => {
                            const delayContent = document.getElementById('delayed-upsell-content');
                            if (delayContent) {
                                delayContent.style.display = 'block';
                                delayContent.style.animation = 'fadeInUp 1s ease forwards';
                                contentRevealed = true;
                            }
                        }, 15000); // 15 seconds exact delay
                    }

                    upsellTimerInterval = setInterval(() => {
                        timeUpsellDisplay.textContent = formatTime(upsellAudio.currentTime);
                        animateUpsellWaves();
                    }, 200);
                }).catch(e => console.log("Audio autoplay prevented", e));
            }
        }

        if (playUpsellBtn) playUpsellBtn.addEventListener('click', toggleUpsellAudio);

            upsellAudio.addEventListener('timeupdate', () => {
                let current = upsellAudio.currentTime;
                let mins = Math.floor(current / 60);
                let secs = Math.floor(current % 60);
                if (secs < 10) secs = "0" + secs;
                timeUpsellDisplay.textContent = mins + ":" + secs + " / 3:04";
            });

            upsellAudio.addEventListener('ended', () => {
                isUpsellPlaying = false;
                playUpsellBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                clearInterval(upsellTimerInterval);
                animateUpsellWaves();
            });

            const upsellObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && upsellAudio.currentTime === 0) {
                        toggleUpsellAudio();
                        upsellObserver.disconnect();
                    }
                });
            }, { threshold: 0.5 });

            let upsellContainerDiv = document.getElementById('audio-upsell-container');
            if (upsellContainerDiv) upsellObserver.observe(upsellContainerDiv);

        // --- Lógica Modal de Senha ---
        function openUnlockModal() {
            document.getElementById('passwordModal').classList.add('active');
            document.getElementById('upsellPassword').value = '';
            document.getElementById('pwd-error').style.display = 'none';
        }

        function closeUnlockModal() {
            document.getElementById('passwordModal').classList.remove('active');
        }

        function checkPassword() {
            const pass = document.getElementById('upsellPassword').value;
            if (pass === UNLOCK_PASSWORD) {
                closeUnlockModal();
                // Desbloqueia vídeo
                const iframe = document.getElementById('iframe-upsell');
                iframe.src = "https://www.youtube.com/embed/b-V9IU0SBzs?rel=0&autoplay=1";
                iframe.style.filter = "none";
                document.getElementById('overlay-upsell').style.display = 'none';
            } else {
                document.getElementById('pwd-error').style.display = 'block';
            }
        }

        // --- Notificações simuladas WPP ---
        const nomes = ["Marta", "Elisa", "Ana Cláudia", "Juliana", "Vera", "Sônia", "Fátima"];
        const acoes = ["acabou de entrar no grupo 🎉", "se juntou às mulheres ativas ✨", "já está participando! 💚"];

        function showToast() {
            const toastText = document.getElementById('toast-text');
            const toastObj = document.getElementById('wpp-toast');

            let nomeRandom = nomes[Math.floor(Math.random() * nomes.length)];
            let acaoRandom = acoes[Math.floor(Math.random() * acoes.length)];

            // Reset animação
            toastObj.style.animation = 'none';
            toastObj.offsetHeight; /* trigger reflow */

            toastText.textContent = `${nomeRandom} ${acaoRandom}`;
            toastObj.style.animation = 'slideUpFade 0.5s ease';
        }

        setInterval(showToast, 5000);

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
        function copyPix() {
            const chave = "69 993755058"; // Remover espaços e parênteses da chave visível para garantir copia limpa se for número

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
            
            // Auto scroll logic
            function startAutoScroll() {
                autoScrollInterval = setInterval(() => {
                    carousel.scrollLeft += scrollStep;
                    // Reset to start if reached the end (approximate check)
                    if (carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 1)) {
                        // Small timeout to let user see the last item before snapping back
                        setTimeout(() => {
                            if (!isDown) carousel.scrollLeft = 0;
                        }, 1000);
                    }
                }, scrollSpeed);
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
            carousel.addEventListener('touchstart', stopAutoScroll, {passive: true});
            carousel.addEventListener('touchend', startAutoScroll, {passive: true});
            
            // Start the auto scroll initially
            startAutoScroll();
        }

        // Iniciar tudo ao carregar
        window.addEventListener('DOMContentLoaded', () => {
            initDaysGrid();
            initStars();
            initAutoCarousel();
        });