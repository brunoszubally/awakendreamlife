document.addEventListener('DOMContentLoaded', function() {
    const dreamText = document.getElementById('dreamText');
    const submitBtn = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('resultContainer');
    const storyResult = document.getElementById('storyResult');
    const routineContainer = document.getElementById('routineContainer');
    const routineResult = document.getElementById('routineResult');
    const loading = document.getElementById('loading');
    const resultsNav = document.getElementById('resultsNav');
    const storyBtn = document.getElementById('storyBtn');
    const routineBtn = document.getElementById('routineBtn');
    const storyPromo = resultContainer.querySelector('.awaken-promo');
    const routinePromo = routineContainer.querySelector('.awaken-promo');
    const spinner = document.getElementById('spinner');

    // Kezdetben elrejtjük a navigációs gombokat
    resultsNav.classList.add('hidden');

    let currentPhase = 'dreams';
    let hasStory = false;
    let hasRoutine = false;

    function showStory() {
        if (hasStory) {
            resultContainer.classList.remove('hidden');
            routineContainer.classList.add('hidden');
            storyBtn.classList.add('active');
            routineBtn.classList.remove('active');
            storyPromo.classList.remove('hidden');
            routinePromo.classList.add('hidden');
        }
    }

    function showRoutine() {
        if (hasRoutine) {
            resultContainer.classList.add('hidden');
            routineContainer.classList.remove('hidden');
            storyBtn.classList.remove('active');
            routineBtn.classList.add('active');
            storyPromo.classList.add('hidden');
            routinePromo.classList.remove('hidden');
        }
    }

    storyBtn.addEventListener('click', showStory);
    routineBtn.addEventListener('click', showRoutine);

    submitBtn.addEventListener('click', async function() {
        const text = dreamText.value.trim();

        if (!text) {
            alert('Kérlek, írj be valamit az álmaidról!');
            dreamText.focus();
            return;
        }

        // Manifestációs üzenetek
        const messages = [
            '✨ Az univerzum hallgat rád...',
            '🌟 Álmaid formát öltenek...',
            '💫 A jövőd kristályosodik...',
            '🔮 Manifesztáljuk a vágyaid...',
            '⭐ Energiák összehangolása...',
            '🌙 Álmok valósággá válása...',
            '💎 Célok megjelenítése...'
        ];

        let messageIndex = 0;

        loading.classList.remove('hidden');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>${messages[0]}</span><div class="spinner"></div>`;
        resultContainer.classList.add('hidden');
        routineContainer.classList.add('hidden');
        dreamText.disabled = true;

        // Üzenetek váltogatása
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            submitBtn.querySelector('span').textContent = messages[messageIndex];
        }, 2000);

        try {
            // Generate both story and routine in parallel
            const [storyResponse, routineResponse] = await Promise.all([
                fetch('/api/process-dreams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                }),
                fetch('/api/generate-routine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                })
            ]);

            // Check if responses are ok before parsing
            if (!storyResponse.ok) {
                const errorText = await storyResponse.text();
                throw new Error(`Story API hiba: ${storyResponse.status} - ${errorText.substring(0, 100)}`);
            }
            if (!routineResponse.ok) {
                const errorText = await routineResponse.text();
                throw new Error(`Rutin API hiba: ${routineResponse.status} - ${errorText.substring(0, 100)}`);
            }

            const [storyData, routineData] = await Promise.all([
                storyResponse.json(),
                routineResponse.json()
            ]);

            // Üzenet animáció leállítása
            clearInterval(messageInterval);

            // Process story
            let cleanedStory = storyData.story
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/^#{1,6}\s+/gm, '');

            storyResult.innerHTML = cleanedStory
                .split('\n')
                .filter(p => p.trim())
                .map(paragraph => `<p>${paragraph.trim()}</p>`)
                .join('');

            // Process routine
            let cleanedRoutine = routineData.routine.map(item =>
                item.replace(/\*\*/g, '')
                    .replace(/\*/g, '')
                    .replace(/^#{1,6}\s+/gm, '')
                    .trim()
            );

            routineResult.innerHTML = cleanedRoutine
                .filter(item => item)
                .map(item => `<p>${item}</p>`)
                .join('');

            // Show results
            resultContainer.classList.remove('hidden');
            resultsNav.classList.remove('hidden');
            hasStory = true;
            hasRoutine = true;
            storyBtn.classList.add('active');
            storyPromo.classList.remove('hidden');
            routinePromo.classList.remove('hidden');

            // Show right column
            document.querySelector('.content-wrapper').classList.add('has-results');

            // Görgetés a jobb oldali oszlop tetejére
            setTimeout(() => {
                const rightColumn = document.querySelector('.right-column');
                if (rightColumn) {
                    rightColumn.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);

            // Update button
            submitBtn.innerHTML = '<span>Új álom</span>';
            submitBtn.onclick = () => location.reload();

        } catch (error) {
            clearInterval(messageInterval);
            console.error('Hiba történt:', error);
            alert('Hiba történt a generálás során. Kérlek, próbáld újra!');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Álmaid megírása</span><div class="spinner hidden"></div>';
            dreamText.disabled = false;
        } finally {
            loading.classList.add('hidden');
        }
    });

    // Kezdeti állapot beállítása
    storyBtn.classList.add('active');
}); 