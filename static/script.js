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
        const text = dreamText.value;
        loading.classList.remove('hidden');
        submitBtn.querySelector('.spinner').classList.remove('hidden');
        submitBtn.disabled = true;
        resultContainer.classList.add('hidden');
        routineContainer.classList.add('hidden');
        
        try {
            if (currentPhase === 'dreams') {
                const response = await fetch('/api/process-dreams', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text })
                });
                
                const data = await response.json();
                storyResult.innerHTML = `<p>${data.story}</p>`;
                resultContainer.classList.remove('hidden');
                resultsNav.classList.remove('hidden');
                hasStory = true;
                storyBtn.classList.add('active');
                storyPromo.classList.remove('hidden');
                
                submitBtn.innerHTML = '<span>Napi rutin generálása</span><div class="spinner hidden"></div>';
                currentPhase = 'routine';
            } else {
                const response = await fetch('/api/generate-routine', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text })
                });
                
                const data = await response.json();
                routineResult.innerHTML = data.routine.map(item => `<p>${item}</p>`).join('');
                routineContainer.classList.remove('hidden');
                resultContainer.classList.add('hidden');
                hasRoutine = true;
                routineBtn.classList.add('active');
                storyBtn.classList.remove('active');
                routinePromo.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Hiba történt:', error);
        } finally {
            loading.classList.add('hidden');
            submitBtn.querySelector('.spinner').classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    // Kezdeti állapot beállítása
    storyBtn.classList.add('active');
}); 