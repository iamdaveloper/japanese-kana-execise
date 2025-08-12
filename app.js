document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const browseModeBtn = document.getElementById('browseMode');
    const practiceModeBtn = document.getElementById('practiceMode');
    const browseView = document.getElementById('browseView');
    const practiceView = document.getElementById('practiceView');
    const kanaGrid = document.getElementById('kanaGrid');
    const selectAllBtn = document.getElementById('selectAll');
    const resetSelectionBtn = document.getElementById('resetSelection');
    const startPracticeBtn = document.getElementById('startPractice');
    const questionDisplay = document.getElementById('questionDisplay');
    const answerInput = document.getElementById('answerInput');
    const submitAnswerBtn = document.getElementById('submitAnswer');
    const giveUpBtn = document.getElementById('giveUp');
    const exitPracticeBtn = document.getElementById('exitPractice');
    const feedbackDisplay = document.getElementById('feedback');

    // State variables
    let selectedKana = [];
    let currentQuestion = null;
    let currentMode = 'A'; // 'A' or 'B'
    let practiceSession = false;

    // Initialize the app
    function init() {
        renderKanaGrid();
        setupEventListeners();
        loadSelections();
    }

    // Render kana reference table
    function renderKanaReference() {
        const rows = document.querySelectorAll('.kana-row');
        rows.forEach(row => {
            const rowName = row.dataset.row;
            const kanas = kanaDB.filter(k => k.row === rowName);
            
            kanas.forEach(kana => {
                const span = document.createElement('span');
                span.className = 'kana-ref-item';
                span.textContent = `${kana.hiragana}/${kana.katakana}`;
                span.dataset.hiragana = kana.hiragana;
                span.dataset.katakana = kana.katakana;
                span.addEventListener('click', () => {
                    const input = document.querySelector('.kana-input');
                    input.value = kana.hiragana;
                    input.focus();
                });
                row.appendChild(span);
            });
        });
    }

    // Render all kana cards in browse view
    function renderKanaGrid() {
        kanaGrid.innerHTML = '';
        kanaDB.forEach(kana => {
            const card = document.createElement('div');
            card.className = 'kana-card';
            card.dataset.romaji = kana.romaji;
            card.dataset.hiragana = kana.hiragana;
            card.dataset.katakana = kana.katakana;
            card.innerHTML = `
                <div class="hiragana">${kana.hiragana}</div>
                <div class="katakana">${kana.katakana}</div>
                <div class="romaji">${kana.romaji}</div>
            `;
            kanaGrid.appendChild(card);
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        // Mode switching
        browseModeBtn.addEventListener('click', () => switchMode('browse'));
        practiceModeBtn.addEventListener('click', () => switchMode('practice'));

        // Kana selection
        kanaGrid.addEventListener('click', handleKanaSelection);
        selectAllBtn.addEventListener('click', selectAllKana);
        resetSelectionBtn.addEventListener('click', resetKanaSelection);
        startPracticeBtn.addEventListener('click', startPracticeSession);

        // Practice controls
        submitAnswerBtn.addEventListener('click', checkAnswer);
        giveUpBtn.addEventListener('click', giveUpQuestion);
        exitPracticeBtn.addEventListener('click', exitPracticeSession);
    }

    // Switch between browse and practice views
    function switchMode(mode) {
        if (mode === 'browse') {
            browseView.classList.add('active');
            practiceView.classList.remove('active');
            browseModeBtn.classList.add('active');
            practiceModeBtn.classList.remove('active');
        } else {
            browseView.classList.remove('active');
            practiceView.classList.add('active');
            browseModeBtn.classList.remove('active');
            practiceModeBtn.classList.add('active');
        }
    }

    // Handle kana card selection
    function handleKanaSelection(e) {
        const card = e.target.closest('.kana-card');
        if (!card) return;

        const romaji = card.dataset.romaji;
        if (selectedKana.includes(romaji)) {
            selectedKana = selectedKana.filter(item => item !== romaji);
            card.classList.remove('selected');
        } else {
            selectedKana.push(romaji);
            card.classList.add('selected');
        }

        updateStartButton();
        saveSelections();
    }

    // Select all kana
    function selectAllKana() {
        selectedKana = kanaDB.map(kana => kana.romaji);
        document.querySelectorAll('.kana-card').forEach(card => {
            card.classList.add('selected');
        });
        updateStartButton();
        saveSelections();
    }

    // Reset kana selection
    function resetKanaSelection() {
        selectedKana = [];
        document.querySelectorAll('.kana-card').forEach(card => {
            card.classList.remove('selected');
        });
        updateStartButton();
        saveSelections();
    }

    // Update start practice button state
    function updateStartButton() {
        startPracticeBtn.disabled = selectedKana.length === 0;
    }

    // Save selected kana to localStorage
    function saveSelections() {
        localStorage.setItem('selectedKana', JSON.stringify(selectedKana));
    }

    // Load selected kana from localStorage
    function loadSelections() {
        const saved = localStorage.getItem('selectedKana');
        if (saved) {
            selectedKana = JSON.parse(saved);
            document.querySelectorAll('.kana-card').forEach(card => {
                if (selectedKana.includes(card.dataset.romaji)) {
                    card.classList.add('selected');
                }
            });
            updateStartButton();
        }
    }

    // Start practice session
    function startPracticeSession() {
        practiceSession = true;
        switchMode('practice');
        generateQuestion();
    }

    // Generate a new question
    function generateQuestion() {
        if (selectedKana.length === 0) return;

        // Randomly select mode A or B
        currentMode = Math.random() < 0.5 ? 'A' : 'B';

        // Get random kana from selected
        const randomRomaji = selectedKana[Math.floor(Math.random() * selectedKana.length)];
        const kana = kanaDB.find(item => item.romaji === randomRomaji);

        currentQuestion = kana;

        // Clear previous feedback
        feedbackDisplay.textContent = '';
        feedbackDisplay.className = 'feedback';

        // Set up question based on mode
        if (currentMode === 'A') {
            // Mode A: Show kana, ask for romaji
            const showHiragana = Math.random() < 0.5;
            questionDisplay.textContent = showHiragana ? kana.hiragana : kana.katakana;
            answerInput.innerHTML = '<input type="text" placeholder="輸入羅馬拼音" autofocus>';
        } else {
            // Mode B: Show romaji, ask for kana
            questionDisplay.textContent = kana.romaji;
            
            // Create shuffled copy of kanaDB
            const shuffledKana = [...kanaDB].sort(() => Math.random() - 0.5);
            
            answerInput.innerHTML = `
                <div class="kana-buttons">
                    ${shuffledKana.map(k => `
                        <button class="kana-btn" 
                                data-hiragana="${k.hiragana}" 
                                data-katakana="${k.katakana}">
                            ${k.hiragana}/${k.katakana}
                        </button>
                    `).join('')}
                </div>
            `;
            // Add click handlers
            document.querySelectorAll('.kana-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const hiragana = btn.dataset.hiragana;
                    const katakana = btn.dataset.katakana;
                    checkKanaAnswer(hiragana, katakana);
                });
            });
        }
    }

    // Check kana answer (for mode B)
    function checkKanaAnswer(hiragana, katakana) {
        if (!currentQuestion || !practiceSession) return;

        const isCorrect = hiragana === currentQuestion.hiragana || 
                         katakana === currentQuestion.katakana;

        // Display feedback
        if (isCorrect) {
            feedbackDisplay.innerHTML = '✅ 正確！';
            feedbackDisplay.className = 'feedback correct';
        } else {
            feedbackDisplay.innerHTML = `❌ 錯誤 <small>(正確: ${currentQuestion.hiragana}/${currentQuestion.katakana} ${currentQuestion.romaji})</small>`;
            feedbackDisplay.className = 'feedback incorrect';
        }

        // Move to next question after delay
        setTimeout(generateQuestion, 1500);
    }

    // Check user's answer (for mode A)
    function checkAnswer() {
        if (!currentQuestion || !practiceSession || currentMode !== 'A') return;

        const userAnswer = answerInput.querySelector('input').value.trim().toLowerCase();
        const isCorrect = userAnswer === currentQuestion.romaji;

        // Display feedback
        if (isCorrect) {
            feedbackDisplay.innerHTML = '✅ 正確！';
            feedbackDisplay.className = 'feedback correct';
        } else {
            feedbackDisplay.innerHTML = `❌ 錯誤 <small>(正確: ${currentQuestion.hiragana}/${currentQuestion.katakana} ${currentQuestion.romaji})</small>`;
            feedbackDisplay.className = 'feedback incorrect';
        }

        // Move to next question after delay
        setTimeout(generateQuestion, 1500);
    }

    // Handle give up on current question
    function giveUpQuestion() {
        if (!currentQuestion || !practiceSession) return;

        feedbackDisplay.textContent = `正確答案: ${currentQuestion.romaji}`;
        feedbackDisplay.className = 'feedback correct';

        if (currentMode === 'A') {
            answerInput.querySelector('input').disabled = true;
        } else {
            answerInput.querySelectorAll('.kana-option').forEach(btn => {
                btn.disabled = true;
            });
        }

        setTimeout(generateQuestion, 2000);
    }

    // Exit practice session
    function exitPracticeSession() {
        practiceSession = false;
        switchMode('browse');
    }

    // Initialize the app
    init();
});
