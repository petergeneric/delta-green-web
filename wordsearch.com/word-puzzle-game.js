class WordPuzzleGame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Game state
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.gameMode = 'wordle';
        this.wrongGuesses = 0;
        this.guessedLetters = [];
        this.targetWord = '';
        this.hint = '';
        this.maxAttempts = 6;
        this.wordLength = 0;
        this.keyboardLayout = [];
        this.localization = {};
    }

    static get observedAttributes() {
        return ['locale'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'locale' && oldValue !== newValue) {
            this.initializeGame();
        }
    }

    connectedCallback() {
        this.initializeGame();
    }

    initializeGame() {
        this.setupLocalization();
        this.render();
        this.setupEventListeners();
        this.resetGame();
    }

    setupLocalization() {
        const localisations = {
            de: {
                options: {
                    'Vokabelwortfindungsherausforderung':'Es ist lang',
                    'Donaudampfschifffahrtsgesellschaftskapitän':'Es ist lang',
                    'Rechtsschutzversicherungsgesellschaften':'Es ist lang',
                    'Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz':'Es ist lang',
                    'Betäubungsmittelverschreibungsverordnung':'Es ist lang',
                    'Grundstücksverkehrsgenehmigungszuständigkeitsübertragunsverordnung':'Es ist lang',
                    'Sozialversicherungsfachangestelltenauszubildender':'Es ist lang',
                    'Straßenverkehrszulassungsordnung':'Es ist lang',
                    'Vierhundertvierundvierzigtausendvierhundertvierundvierzig':'Es ist lang',
                    'Arbeitsunfähigkeitsbescheinigung':'Es ist lang',
                    'Nahrungsmittelunverträglichkeitstest':'Es ist lang',
                    'Wiederbelebungsmaßnahmenleitfaden':'Es ist lang',
                    'Selbstmitgefühlskultivierungstechniken':'Es ist lang'
                },
                hint: 'Hinweis',
                brand: 'Vokabelwortfindungsherausforderung',
                flag: '🇩🇪',
                strapline: 'Der Ultimate Deutsche Wortspiel!',
                keyboard: [
                    ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü', 'Ä', 'Ö'],
                    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ß', '⌫', '⏎'],
                    ['Y', 'X', 'C', 'V', 'B', 'N', 'M', '', '', '', '', '', '']
                ]
            },
            dev: {
                options: {
                    'boop':'it\'s boop',
                },
                hint: 'Hint',
                brand: 'Word Search - Debug Mode',
                flag: '[-]',
                strapline: 'Everybody\'s favourite debug mode!',
                keyboard: [
                    ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü', 'Ä', 'Ö'],
                    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ß', '⌫', '⏎'],
                    ['Y', 'X', 'C', 'V', 'B', 'N', 'M', '-', '', '', '', '', '']
                ]
            },
            pl: {
                options: {
                    'Dziewięćsetdziewięćdziesięciodziewięcionarodowościowego': 'To prawdopodobnie prawdziwe słowo',
                    'KONSTANTYNOPOLITAŃCZYKOWIANECZKA': 'To prawdopodobnie prawdziwe słowo',
                    'Pierogi': 'To prawdopodobnie prawdziwe słowo',
                },
                hint: 'Wskazówka',
                brand: 'Polskie Słówko',
                flag: '🇵🇱',
                strapline: 'Najlepsza wyszukiwarka słów po polsku niezwiązana z Wordle',
                keyboard: [
                    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ą', 'Ę'],
                    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ł', '⌫'],
                    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ć', 'Ń', 'Ó', 'Ś', '⏎'],
                    ['', '', '', '', '', '', '', 'Ź', 'Ż', '', '', '']
                ]
            },
            za: {
                options: {
                    'Elektrisiteitvoorsieningsonderbreking': 'Baie Suid-Afrikaners het hierdie probleem as gevolg van onderbefondsing van infrastruktuur.',
                    'Tweedehandsemotorverkoopsmannevakbondstakingsvergaderingsameroeperstoespraakskrywerspersverklaringuitreikingsmediakonferensie-aankondiginkie': '141 letters en nie een van julle sal dit raai nie',
                    'Waatlemoensaaiseisoen': 'Tyd om sappige vrugte te plant',
                    'Vietsrykompetisiebeplanner': '!'
                },
                hint: 'Wenk',
                brand: 'Afrikaanse Woordspel',
                flag: '🇿🇦',
                strapline: 'Raai die Afrikaanse woord! Herlaai die bladsy vir nog \'n ewekansige woord',
                keyboard: [
                    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ê'],
                    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '⌫'],
                    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ë', 'Î', 'Ô', '⏎'],
                    ['-', '', '', '', '', '', '', 'Û', '', '', '']
                ]
            }
        };

        const locale = this.getAttribute('locale') || 'de';
        this.localization = localisations[locale] || localisations.de;
        
        const entries = Object.entries(this.localization.options);
        const randomEntry = entries[Math.floor(Math.random() * entries.length)];
        this.targetWord = randomEntry[0].toUpperCase();
        this.hint = randomEntry[1];
        this.keyboardLayout = this.localization.keyboard;
        this.wordLength = this.targetWord.length;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Arial', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .mode-selector {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                    background: rgba(255,255,255,0.9);
                    padding: 10px;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .mode-button {
                    padding: 8px 16px;
                    margin: 0 10px;
                    border: none;
                    border-radius: 5px;
                    background: #d3d6da;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .mode-button.active {
                    background: #6aaa64;
                    color: white;
                }

                .header {
                    text-align: center;
                    color: white;
                    margin-bottom: 20px;
                }

                .header h1 {
                    font-size: 2.5em;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }

                .subtitle {
                    font-size: 1.2em;
                    margin: 10px 0;
                    opacity: 0.9;
                }

                .word-hint {
                    background: rgba(255,255,255,0.9);
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .game-container {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    max-width: 100%;
                    width: 90vw;
                    max-width: 1200px;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(var(--wordlen, 43), 1fr);
                    gap: 2px;
                    margin-bottom: 20px;
                    justify-content: center;
                }

                .cell {
                    width: 25px;
                    height: 25px;
                    border: 2px solid #d3d6da;
                    border-radius: 3px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-weight: bold;
                    font-size: 12px;
                    background: white;
                    transition: all 0.3s ease;
                }

                .cell.filled {
                    border-color: #878a8c;
                    background: #f8f9fa;
                }

                .cell.correct {
                    background: #6aaa64;
                    color: white;
                    border-color: #6aaa64;
                    animation: flip 0.6s ease-in-out;
                }

                .cell.present {
                    background: #c9b458;
                    color: white;
                    border-color: #c9b458;
                    animation: flip 0.6s ease-in-out;
                }

                .cell.absent {
                    background: #787c7e;
                    color: white;
                    border-color: #787c7e;
                    animation: flip 0.6s ease-in-out;
                }

                @keyframes flip {
                    0% { transform: rotateX(0); }
                    50% { transform: rotateX(90deg); }
                    100% { transform: rotateX(0); }
                }

                .keyboard {
                    display: grid;
                    grid-template-columns: repeat(13, 1fr);
                    gap: 3px;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .key {
                    padding: 10px 8px;
                    border: none;
                    border-radius: 4px;
                    background: #d3d6da;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 12px;
                    min-height: 40px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .key:hover {
                    background: #bbb;
                }

                .key.correct {
                    background: #6aaa64;
                    color: white;
                }

                .key.present {
                    background: #c9b458;
                    color: white;
                }

                .key.absent {
                    background: #787c7e;
                    color: white;
                }

                .key.wide {
                    grid-column: span 2;
                }

                .message {
                    text-align: center;
                    margin: 10px 0;
                    font-weight: bold;
                    min-height: 20px;
                }

                .win {
                    color: #6aaa64;
                    font-size: 1.2em;
                }

                .lose {
                    color: #e74c3c;
                    font-size: 1.2em;
                }

                .hangman-container {
                    display: none;
                    margin: 20px auto;
                    text-align: center;
                }

                .hangman-drawing {
                    width: 200px;
                    height: 250px;
                    margin: 0 auto;
                    position: relative;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background: white;
                }

                .hangman-word {
                    margin: 20px 0;
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                }

                .hangman-letter {
                    width: 30px;
                    height: 40px;
                    border-bottom: 2px solid #333;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 24px;
                    font-weight: bold;
                }

                @media (max-width: 768px) {
                    .cell {
                        width: 20px;
                        height: 20px;
                        font-size: 10px;
                    }
                    .key {
                        padding: 8px 4px;
                        font-size: 10px;
                        min-height: 35px;
                    }
                    .header h1 {
                        font-size: 2em;
                    }
                }
            </style>
            
            <div class="header">
                <h1>${this.localization.flag} ${this.localization.brand} ${this.localization.flag}</h1>
                <div class="subtitle">${this.localization.strapline}</div>
            </div>

            <div class="mode-selector">
                <button id="wordle-mode" class="mode-button active">WordyGuess(tm) Mode</button>
                <button id="hangman-mode" class="mode-button">Hangman Mode</button>
            </div>

            <div class="word-hint">
                <strong>${this.localization.hint}:</strong> ${this.hint}
            </div>

            <div class="game-container">
                <div id="wordle-container">
                    <div class="grid" id="grid"></div>
                </div>
                <div id="hangman-container" class="hangman-container">
                    <div class="hangman-drawing" id="hangman-drawing"></div>
                    <div class="hangman-word" id="hangman-word"></div>
                </div>
                <div class="message" id="message"></div>
                <div class="keyboard" id="keyboard"></div>
            </div>
        `;

        this.shadowRoot.host.style.setProperty('--wordlen', this.wordLength);
    }

    setupEventListeners() {
        // Mode buttons
        this.shadowRoot.getElementById('wordle-mode').addEventListener('click', () => this.switchToWordleMode());
        this.shadowRoot.getElementById('hangman-mode').addEventListener('click', () => this.switchToHangmanMode());

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleDocumentKeyPress(e));
    }

    handleDocumentKeyPress(e) {
        const key = e.key.toUpperCase();

        if (key === 'BACKSPACE') {
            this.handleKeyPress('⌫');
        } else if (key === 'ENTER') {
            this.handleKeyPress('⏎');
        } else if (/^\p{L}$/u.test(key) || key === '-') {
            this.handleKeyPress(key);
        }
    }

    initializeGrid() {
        const grid = this.shadowRoot.getElementById('grid');
        grid.innerHTML = '';
        for (let i = 0; i < this.maxAttempts * this.wordLength; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${i}`;
            grid.appendChild(cell);
        }
    }

    initializeKeyboard() {
        const keyboard = this.shadowRoot.getElementById('keyboard');
        keyboard.innerHTML = '';

        this.keyboardLayout.forEach(row => {
            row.forEach(key => {
                if (key === '') return;

                const button = document.createElement('button');
                button.className = 'key';
                button.textContent = key;

                if (key === '⌫' || key === '⏎') {
                    button.className += ' wide';
                }

                button.addEventListener('click', () => this.handleKeyPress(key));
                keyboard.appendChild(button);
            });
        });
    }

    handleKeyPress(key) {
        if (this.gameOver) return;

        if (this.gameMode === 'wordle') {
            if (key === '⌫') {
                this.deleteLetter();
            } else if (key === '⏎') {
                this.submitGuess();
            } else {
                this.addLetter(key);
            }
        } else {
            if (key === '⌫' || key === '⏎') {
                return;
            } else {
                if (this.guessedLetters.includes(key)) {
                    this.showMessage(`You already guessed ${key}!`);
                    return;
                }

                this.guessedLetters.push(key);
                this.checkHangmanGuess(key);
            }
        }
    }

    addLetter(letter) {
        if (this.currentCol < this.wordLength) {
            const cellIndex = this.currentRow * this.wordLength + this.currentCol;
            const cell = this.shadowRoot.getElementById(`cell-${cellIndex}`);
            cell.textContent = letter;
            cell.classList.add('filled');
            this.currentCol++;
        }
    }

    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            const cellIndex = this.currentRow * this.wordLength + this.currentCol;
            const cell = this.shadowRoot.getElementById(`cell-${cellIndex}`);
            cell.textContent = '';
            cell.classList.remove('filled');
        }
    }

    submitGuess() {
        if (this.currentCol !== this.wordLength) {
            this.showMessage(`Please enter all ${this.wordLength} letters!`);
            return;
        }

        const guess = this.getCurrentGuess();
        this.evaluateGuess(guess);

        if (guess === this.targetWord) {
            this.showMessage('Congratulations!', 'win');
            this.gameOver = true;
        } else if (this.currentRow === this.maxAttempts - 1) {
            this.showMessage(`Sorry! The word was: ${this.targetWord}`, 'lose');
            this.gameOver = true;
        } else {
            this.currentRow++;
            this.currentCol = 0;
            this.showMessage(`Versuch ${this.currentRow + 1} von ${this.maxAttempts}`);
        }
    }

    getCurrentGuess() {
        let guess = '';
        for (let i = 0; i < this.wordLength; i++) {
            const cellIndex = this.currentRow * this.wordLength + i;
            const cell = this.shadowRoot.getElementById(`cell-${cellIndex}`);
            guess += cell.textContent;
        }
        return guess;
    }

    evaluateGuess(guess) {
        const targetArray = this.targetWord.split('');
        const guessArray = guess.split('');
        const letterCount = {};

        targetArray.forEach(letter => {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        });

        for (let i = 0; i < this.wordLength; i++) {
            const cellIndex = this.currentRow * this.wordLength + i;
            const cell = this.shadowRoot.getElementById(`cell-${cellIndex}`);

            if (guessArray[i] === targetArray[i]) {
                cell.classList.add('correct');
                this.updateKeyboard(guessArray[i], 'correct');
                letterCount[guessArray[i]]--;
            }
        }

        for (let i = 0; i < this.wordLength; i++) {
            const cellIndex = this.currentRow * this.wordLength + i;
            const cell = this.shadowRoot.getElementById(`cell-${cellIndex}`);

            if (guessArray[i] !== targetArray[i]) {
                if (letterCount[guessArray[i]] > 0) {
                    cell.classList.add('present');
                    this.updateKeyboard(guessArray[i], 'present');
                    letterCount[guessArray[i]]--;
                } else {
                    cell.classList.add('absent');
                    this.updateKeyboard(guessArray[i], 'absent');
                }
            }
        }
    }

    updateKeyboard(letter, status) {
        const keys = this.shadowRoot.querySelectorAll('.key');
        keys.forEach(key => {
            if (key.textContent === letter) {
                if (!key.classList.contains('correct')) {
                    key.classList.remove('present', 'absent', 'correct');
                    key.classList.add(status);
                }
            }
        });
    }

    showMessage(text, className = '') {
        const messageEl = this.shadowRoot.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${className}`;
    }

    switchToWordleMode() {
        this.gameMode = 'wordle';
        this.shadowRoot.getElementById('wordle-mode').classList.add('active');
        this.shadowRoot.getElementById('hangman-mode').classList.remove('active');
        this.shadowRoot.getElementById('wordle-container').style.display = 'block';
        this.shadowRoot.getElementById('hangman-container').style.display = 'none';
        this.resetGame();
    }

    switchToHangmanMode() {
        this.gameMode = 'hangman';
        this.shadowRoot.getElementById('hangman-mode').classList.add('active');
        this.shadowRoot.getElementById('wordle-mode').classList.remove('active');
        this.shadowRoot.getElementById('wordle-container').style.display = 'none';
        this.shadowRoot.getElementById('hangman-container').style.display = 'block';
        this.resetGame();
    }

    resetGame() {
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.wrongGuesses = 0;
        this.guessedLetters = [];

        const grid = this.shadowRoot.getElementById('grid');
        grid.innerHTML = '';
        const keyboard = this.shadowRoot.getElementById('keyboard');
        keyboard.innerHTML = '';
        const hangmanWord = this.shadowRoot.getElementById('hangman-word');
        hangmanWord.innerHTML = '';
        const hangmanDrawing = this.shadowRoot.getElementById('hangman-drawing');
        hangmanDrawing.innerHTML = '';

        if (this.gameMode === 'wordle') {
            this.initializeGrid();
            this.initializeKeyboard();
            this.showMessage(`Guess the word! Attempt 1 of ${this.maxAttempts}`);
        } else {
            this.initializeHangman();
            this.initializeKeyboard();
            this.showMessage(`Guess the word! You have 6 wrong guesses.`);
        }
    }

    initializeHangman() {
        const hangmanDrawing = this.shadowRoot.getElementById('hangman-drawing');
        hangmanDrawing.innerHTML = `
            <svg width="200" height="250" viewBox="0 0 200 250">
                <line x1="20" y1="230" x2="180" y2="230" stroke="#333" stroke-width="3"/>
                <line x1="40" y1="230" x2="40" y2="30" stroke="#333" stroke-width="3"/>
                <line x1="40" y1="30" x2="120" y2="30" stroke="#333" stroke-width="3"/>
                <line x1="120" y1="30" x2="120" y2="50" stroke="#333" stroke-width="3"/>
                <circle id="head" cx="120" cy="70" r="20" stroke="#333" stroke-width="3" fill="transparent" style="display:none"/>
                <line id="body" x1="120" y1="90" x2="120" y2="150" stroke="#333" stroke-width="3" style="display:none"/>
                <line id="left-arm" x1="120" y1="110" x2="90" y2="100" stroke="#333" stroke-width="3" style="display:none"/>
                <line id="right-arm" x1="120" y1="110" x2="150" y2="100" stroke="#333" stroke-width="3" style="display:none"/>
                <line id="left-leg" x1="120" y1="150" x2="90" y2="180" stroke="#333" stroke-width="3" style="display:none"/>
                <line id="right-leg" x1="120" y1="150" x2="150" y2="180" stroke="#333" stroke-width="3" style="display:none"/>
            </svg>
        `;

        const hangmanWord = this.shadowRoot.getElementById('hangman-word');
        hangmanWord.innerHTML = '';

        for (let i = 0; i < this.targetWord.length; i++) {
            const letterBox = document.createElement('div');
            letterBox.className = 'hangman-letter';
            letterBox.id = `hangman-letter-${i}`;

            if (this.targetWord[i] === ' ' || this.targetWord[i] === '-') {
                letterBox.textContent = this.targetWord[i];
            }

            hangmanWord.appendChild(letterBox);
        }
    }

    updateHangmanDrawing() {
        const parts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
        if (this.wrongGuesses > 0 && this.wrongGuesses <= parts.length) {
            this.shadowRoot.getElementById(parts[this.wrongGuesses - 1]).style.display = 'block';
        }
    }

    checkHangmanGuess(letter) {
        let letterFound = false;

        for (let i = 0; i < this.targetWord.length; i++) {
            if (this.targetWord[i] === letter) {
                this.shadowRoot.getElementById(`hangman-letter-${i}`).textContent = letter;
                letterFound = true;
            }
        }

        if (!letterFound) {
            this.wrongGuesses++;
            this.updateHangmanDrawing();
            this.updateKeyboard(letter, 'absent');

            if (this.wrongGuesses >= 6) {
                this.showMessage(`Sorry! The word was: ${this.targetWord}`, 'lose');
                this.gameOver = true;
            }
        } else {
            this.updateKeyboard(letter, 'correct');

            let allLettersGuessed = true;
            for (let i = 0; i < this.targetWord.length; i++) {
                const letterElement = this.shadowRoot.getElementById(`hangman-letter-${i}`);
                if (this.targetWord[i] !== ' ' && this.targetWord[i] !== '-' && letterElement.textContent === '') {
                    allLettersGuessed = false;
                    break;
                }
            }

            if (allLettersGuessed) {
                this.showMessage('Congratulations!', 'win');
                this.gameOver = true;
            }
        }
    }
}

customElements.define('word-puzzle-game', WordPuzzleGame);