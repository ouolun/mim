/*V1.3.0 Beta F*/
const QUIZ_LIST = [
    { id: '202504', name: '2025上半年', file: '202504.json' },
    { id: '202411', name: '2024下半年', file: '202411.json' },
    { id: '202404', name: '2024上半年', file: '202404.json' },
    { id: '202311', name: '2023下半年', file: '202311.json' },
    { id: '202304', name: '2023上半年', file: '202304.json' },
    { id: '202211', name: '2022下半年', file: '202211.json' },
    { id: '202204', name: '2022上半年', file: '202204.json' },
    { id: '202111', name: '2021下半年', file: '202111.json' },
    { id: '202104', name: '2021上半年', file: '202104.json' },
    { id: '202011', name: '2020下半年', file: '202011.json' },
    { id: '202004', name: '2020上半年', file: '202004.json' },
    { id: '201911', name: '2019下半年測試', file: '201911.json' },
    { id: '201904', name: '2019上半年測試', file: '201904.json' },
    { id: '201811', name: '2018下半年測試', file: '201811.json' },
    { id: '201804', name: '2018上半年測試', file: '201804.json' },
    { id: '201711', name: '2017下半年測試', file: '201711.json' },
    { id: '201704', name: '2017上半年測試', file: '201704.json' },
    { id: '201611', name: '2016下半年測試', file: '201611.json' },
    { id: '201604', name: '2016上半年測試', file: '201604.json' },
    { id: '201511', name: '2015下半年測試', file: '201511.json' },
    { id: '201504', name: '2015上半年測試', file: '201504.json' }
];
let currentQuizFile = '';
let currentQuizName = '';
let question = [];
let currentQuestion = [];
let wrongAnswers = [];
let questionNumber = 1;
let score = 0;
let totalQuestions = 0;
let optionIndexs = ["A", "B", "C", "D"];
const shuffleToggle = document.getElementById('sfl_toggle');
const optionButtons = document.querySelectorAll('.option_btn');
const nextButton = document.getElementById('btn_next');
const backButton = document.getElementById('btn_back');
const showBtn = document.getElementById('guide_btn');
const closeBtn = document.getElementById('close-dialog-btn');
const dialog = document.getElementById('guide-dialog');
let isAnswered = false;
let selectedOptionId = null;
document.addEventListener('DOMContentLoaded', renderQuizSelection);
const { marked } = window.marked;

function shuffleOptions() {
    for (let i = optionIndexs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionIndexs[i], optionIndexs[j]] = [optionIndexs[j], optionIndexs[i]];
        [currentQuestion.options[i], currentQuestion.options[j]] = [currentQuestion.options[j], currentQuestion.options[i]];
    }
}

function renderQuizSelection() {
    const listContainer = document.getElementById('selection_list');
    QUIZ_LIST.forEach(quiz => {
        const button = document.createElement('button');
        button.textContent = quiz.name;
        button.className = 'quiz_select_btn';
        button.dataset.file = quiz.file;
        button.addEventListener('click', handleQuizSelection);
        listContainer.appendChild(button);
    });
    document.getElementById('quiz_selection_area').style.display = 'block';
    document.getElementById('question_area').style.display = 'none';
    document.querySelectorAll('.option_btn').forEach(btn => btn.style.display = 'block');
    document.getElementById('q_control').style.display = 'none';
    document.getElementById('btn_back').style.display = 'none';
    document.getElementById('analytics').style.display = 'none';
}

function handleQuizSelection(event) {
    const selectedFile = event.target.dataset.file;
    const selectedName = event.target.textContent;
    if (selectedFile) {
        currentQuizFile = selectedFile;
        currentQuizName = selectedName;
        document.getElementById('quiz_selection_area').style.display = 'none';
        document.getElementById('question_area').style.display = 'block';
        document.getElementById('q_control').style.display = 'flex';
        document.getElementById('btn_back').style.display = 'flex';
        document.getElementById('progress_container').style.display = 'block';
        document.getElementById('toolbar').style.display = 'flex';
        loadQuestions();
    }
}

async function loadQuestions() {
    const response = await fetch(currentQuizFile);
    question = await response.json();
    questionNumber = 1;
    score = 0;
    wrongAnswers = [];
    totalQuestions = Object.keys(question).length;
    optionButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('selected', 'correct', 'incorrect');
        btn.style.display = 'block';
    });
    document.getElementById('hint').textContent = "本題尚未作答完畢";
    displayQuestion();
}

function displayQuestion() {
    if (questionNumber > 50) {
        showResults();
        return;
    }
    document.getElementById('analytics').style.display = 'none';
    isAnswered = false;
    selectedOptionId = null;
    currentQuestion = question[questionNumber.toString()];
    optionIndexs = ["A", "B", "C", "D"];
    if (shuffleToggle.checked) {
        shuffleOptions();
    }
    showStar();
    document.getElementById('q_text').textContent = currentQuestion.question;
    document.getElementById('0').textContent = "A." + currentQuestion.options[0];
    document.getElementById('1').textContent = "B." + currentQuestion.options[1];
    document.getElementById('2').textContent = "C." + currentQuestion.options[2];
    document.getElementById('3').textContent = "D." + currentQuestion.options[3];
    document.getElementById('hint').textContent = "本題尚未作答完畢";
    nextButton.disabled = true;
    nextButton.textContent = "確定";
    currentQuestion = question[questionNumber.toString()];
    const pTextElement = document.getElementById('p_text');
    pTextElement.textContent = `[${currentQuizName}] 第 ${questionNumber} / ${totalQuestions} 題`;
    const pBarElement = document.getElementById('p_bar');
    const percentage = (questionNumber / totalQuestions) * 100;
    pBarElement.style.width = `${percentage}%`;
}
/*
function checkAnswer(selectedButton) {
    const selectedAnswer = selectedButton.id;
    if (optionIndexs[selectedAnswer] === currentQuestion.answer) {
        //console.log("答對了!");
        increaseCorrectCount();
        document.getElementById('hint').textContent = "✅正確答案";
        selectedButton.classList.add('correct');
        score += 2;
    } else {
        //console.log("答錯了!");
        decreaseCorrectCount();
        document.getElementById('hint').textContent = "❌錯誤答案\n正確答案是 " + document.getElementById(optionIndexs.indexOf(currentQuestion.answer)).textContent;
        document.getElementById(optionIndexs.indexOf(currentQuestion.answer)).classList.add('correct');
        selectedButton.classList.add('incorrect');
        const wrongQ = {
            ...currentQuestion,
            userSelectedKey: selectedButton.id,
            correctKey: optionIndexs.indexOf(currentQuestion.answer)
        };
        wrongAnswers.push(wrongQ)
    }
    showStar();
    disableAllOptions();
    document.getElementById('btn_next').disabled = false;
}
*/
optionButtons.forEach(button => {
    button.addEventListener('click', function(event) {
        optionButtons.forEach(btn => btn.classList.remove('selected'));
        const clickedButton = event.target;
        clickedButton.classList.add('selected');
        selectedOptionId = clickedButton.id;
        nextButton.disabled = false;
    });
});
/*
function handleConfirmAnswer() {
    document.getElementById('analytics').style.display = 'flex';
    if (selectedOptionId === null) return;
    const selectedButton = document.getElementById(selectedOptionId);
    if (optionIndexs[selectedOptionId] === currentQuestion.answer) {
        increaseCorrectCount();
        document.getElementById('hint').textContent = "✅正確答案";
        selectedButton.classList.remove('selected');
        selectedButton.classList.add('correct');
        score += 2;
    } else {
        decreaseCorrectCount();
        const correctAnswerButton = document.getElementById(optionIndexs.indexOf(currentQuestion.answer));
        document.getElementById('hint').textContent = "❌錯誤答案\n正確答案是 " + correctAnswerButton.textContent;
        correctAnswerButton.classList.add('correct');
        selectedButton.classList.remove('selected');
        selectedButton.classList.add('incorrect');
        const wrongQ = {
            ...currentQuestion,
            userSelectedKey: selectedOptionId,
            correctKey: optionIndexs.indexOf(currentQuestion.answer)
        };
        wrongAnswers.push(wrongQ)
    }
    if (currentQuestion.analysis && typeof currentQuestion.analysis === 'string' && currentQuestion.analysis.trim().length > 0) {
        document.getElementById('analytics').innerHTML = DOMPurify.sanitize('<div id="color"><h4>✨ AI題目解析</h4></div>'+marked.parseInline(currentQuestion.analysis)+'<p>解析由Google Gemini預生成，非即時生成\n人工智慧可能出現重大錯誤，請查核重要資訊</p>');
    }
    showStar();
    disableAllOptions();
    isAnswered = true;
    if (questionNumber < totalQuestions) {
        nextButton.textContent = "下一題";
    } else {
        nextButton.textContent = "查看結果";
    }
    nextButton.disabled = false;
}
*/

function handleConfirmAnswer() {
    document.getElementById('analytics').style.display = 'flex';
    if (selectedOptionId === null) return;
    const selectedButton = document.getElementById(selectedOptionId);
    const userSelectedLetter = optionIndexs[selectedOptionId];
    const isCorrect = currentQuestion.answer.includes(userSelectedLetter);
    const allCorrectButtons = [];
    let correctAnswerText = '';
    for (let i = 0; i < optionIndexs.length; i++) {
        const optionLetter = optionIndexs[i];
        if (currentQuestion.answer.includes(optionLetter)) {
            const correctBtn = document.getElementById(i.toString());
            allCorrectButtons.push(correctBtn);
            if (correctAnswerText.length > 0) {
                correctAnswerText += '\n和 ';
            }
            correctAnswerText += correctBtn.textContent;
        }
    }
    if (isCorrect) {
        increaseCorrectCount();
        document.getElementById('hint').textContent = "✅正確答案";
        score += 2;
    } else {
        decreaseCorrectCount();
        document.getElementById('hint').textContent = `❌錯誤答案\n正確答案是 ${correctAnswerText}`;
        const wrongQ = {
            ...currentQuestion,
            userSelectedKey: selectedOptionId,
            correctKeys: currentQuestion.answer.split('').map(letter => optionIndexs.indexOf(letter))
        };
        wrongAnswers.push(wrongQ);
    }
    selectedButton.classList.remove('selected');
    if (isCorrect) {
        selectedButton.classList.add('correct');
    } else {
        selectedButton.classList.add('incorrect');
    }
    allCorrectButtons.forEach(btn => {
        btn.classList.add('correct');
    });
    if (currentQuestion.analysis && typeof currentQuestion.analysis === 'string' && currentQuestion.analysis.trim().length > 0) {
        document.getElementById('analytics').innerHTML = DOMPurify.sanitize('<div id="color"><h4>✨ AI題目解析</h4></div>' + marked.parseInline(currentQuestion.analysis) + '<p>解析由Google Gemini預生成，非即時生成\n人工智慧可能出現重大錯誤，請查核重要資訊</p>');
    }
    showStar();
    disableAllOptions();
    isAnswered = true;
    if (questionNumber < totalQuestions) {
        nextButton.textContent = "下一題";
    } else {
        nextButton.textContent = "查看結果";
    }
    nextButton.disabled = false;
}

function disableAllOptions() {
    const allButtons = document.querySelectorAll('.option_btn');
    allButtons.forEach(button => {
        button.disabled = true;
    });
}
/*
function handleNextQuestion() {
    questionNumber++;
    optionButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect');
    });
    displayQuestion();
}
*/
function handleNextQuestion() {
    if (!isAnswered) {
        handleConfirmAnswer();
    } else {
        questionNumber++;
        optionButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect', 'selected');
        });
        displayQuestion();
    }
}

function showResults() {
    document.getElementById('analytics').style.display = 'none';
    document.getElementById('wa_area').style.display = 'block';
    document.getElementById('q_text').textContent = `測驗結束！您的總分是 ${score} 分。`;
    document.querySelectorAll('.option_btn').forEach(btn => btn.style.display = 'none');
    document.getElementById('q_control').style.display = 'none';
    document.getElementById('progress_container').style.display = 'none';
    document.getElementById('toolbar').style.display = 'none';
    if (wrongAnswers.length > 0) {
        let htmlContent = '<h2 class="wa_hint">以下是您答錯的題目：</h2>';
        let optionNums = 0;
        wrongAnswers.forEach((q, index) => {
            const correctKeys = q.correctKeys || [];
            const userKey = parseInt(q.userSelectedKey);

            const optionsHtml = q.options.map((option, optIndex) => {
                const optionKey = String.fromCharCode('A'.charCodeAt(0) + optIndex);
                let mark = '';
                if (correctKeys.includes(optIndex)) {
                    mark = '<div class="wa_option_c"><span class="wa_correct">【正確答案】</span><br>';
                } else if (optIndex === userKey) {
                    mark = '<div class="wa_option_u"><span class="wa_wrong">【您的答案】</span><br>';
                } else {
                    mark = '<div class="wa_option">';
                }
                optionNums++;
                return `${mark}${optionKey}. ${option} </div>`;
            }).join('');
            htmlContent += `
            <div class="wa_item">
                <h3>${q.question}</h3>
                ${optionsHtml}
                <div id="wa_analytics">
                <div id="color"><h4>✨ AI題目解析</h4></div>
                ${marked.parseInline(q.analysis)}
                <p>解析由Google Gemini預生成，非即時生成\n人工智慧可能出現重大錯誤，請查核重要資訊</p>
                </div>
            </div>
        `;
        });
        document.getElementById('wa_area').innerHTML = htmlContent;

    } else {
        document.getElementById('wa_area').innerHTML = `
                <div class="wa_item">
                    <h4>恭喜！您全部答對了！🎉</h4>
                </div>
            `;
    }
}

function returnToSelection() {
    document.getElementById('question_area').style.display = 'none';
    document.getElementById('q_control').style.display = 'none';
    document.getElementById('btn_back').style.display = 'none';
    document.getElementById('wa_area').style.display = 'none';
    document.getElementById('quiz_selection_area').style.display = 'block';
    currentQuizFile = '';
    currentQuizName = '';
    question = [];
    currentQuestion = [];
    wrongAnswers = [];
    questionNumber = 1;
    score = 0;
    totalQuestions = 0;
    document.getElementById('selection_list').innerHTML = '';
    renderQuizSelection();
}

function getCorrectCount() {
    const id = currentQuizName + questionNumber;
    if (localStorage.getItem(id) === null) {
        localStorage.setItem(id, '0');
        return 0;
    } else {
        const count = parseInt(localStorage.getItem(id), 10);
        return count;
    }
}

function increaseCorrectCount() {
    const id = currentQuizName + questionNumber;
    let count = getCorrectCount(id);
    if (count < 3) {
        count += 1;
    }
    localStorage.setItem(id, count.toString());
}

function decreaseCorrectCount() {
    const id = currentQuizName + questionNumber;
    let count = getCorrectCount(id);
    if (count > 0) {
        count -= 1;
    }
    localStorage.setItem(id, count.toString());
}

function showStar() {
    const count = getCorrectCount();
    if (count === 0) {
        document.getElementById('star').innerHTML = `熟練度 <span class="empty-star">★</span> <span class="empty-star">★</span> <span class="empty-star">★</span>`;
    } else if (count === 1) {
        document.getElementById('star').innerHTML = `熟練度 <span class="full-star">★</span> <span class="empty-star">★</span> <span class="empty-star">★</span>`;
    } else if (count === 2) {
        document.getElementById('star').innerHTML = `熟練度 <span class="full-star">★</span> <span class="full-star">★</span> <span class="empty-star">★</span>`;
    } else if (count === 3) {
        document.getElementById('star').innerHTML = `熟練度 <span class="full-star">★</span> <span class="full-star">★</span> <span class="full-star">★</span>`;
    }
}

showBtn.addEventListener('click', () => {
    dialog.showModal();
    dialog.scrollTop = 0;
});

closeBtn.addEventListener('click', () => {
    dialog.close();
});

dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientY < rect.top || event.clientY > rect.bottom ||
        event.clientX < rect.left || event.clientX > rect.right) {
        dialog.close();
    }
});

backButton.addEventListener('click', returnToSelection);
nextButton.addEventListener('click', handleNextQuestion);



