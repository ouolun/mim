const QUIZ_LIST = [
    { id: '202501', name: '2025上半年', file: '202504.json' },
    { id: '202411', name: '2024下半年', file: '202411.json' },
    { id: '202404', name: '2024上半年', file: '202404.json' },
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

document.addEventListener('DOMContentLoaded', renderQuizSelection);

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
        btn.classList.remove('correct', 'incorrect');
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
    if (!question[(questionNumber + 1).toString()]) {
        nextButton.textContent = "查看結果";
    } else {
        nextButton.textContent = "下一題";
    }
    currentQuestion = question[questionNumber.toString()];
    const pTextElement = document.getElementById('p_text');
    pTextElement.textContent = `[${currentQuizName}] 第 ${questionNumber} / ${totalQuestions} 題`;
    const pBarElement = document.getElementById('p_bar');
    const percentage = (questionNumber / totalQuestions) * 100;
    pBarElement.style.width = `${percentage}%`;
}

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
        document.getElementById('hint').innerHTML = "❌錯誤答案<br>正確答案是 " + document.getElementById(optionIndexs.indexOf(currentQuestion.answer)).textContent;
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

optionButtons.forEach(button => {
    button.addEventListener('click', function(event) {
        const clickedButton = event.target;
        //console.log(`${clickedButton.textContent}`);
        checkAnswer(clickedButton);
    });
});

function disableAllOptions() {
    const allButtons = document.querySelectorAll('.option_btn');
    allButtons.forEach(button => {
        button.disabled = true;
    });
}

function handleNextQuestion() {
    questionNumber++;
    optionButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect');
    });
    displayQuestion();
}

function showResults() {
    document.getElementById('wa_area').style.display = 'block';
    document.getElementById('q_text').textContent = `測驗結束！您的總分是 ${score} 分。`;
    document.querySelectorAll('.option_btn').forEach(btn => btn.style.display = 'none');
    document.getElementById('q_control').style.display = 'none';
    if (wrongAnswers.length > 0) {
        let htmlContent = '<h2 class="wa_hint">以下是您答錯的題目：</h2>';
        let optionNums = 0;
        wrongAnswers.forEach((q, index) => {
            const correctKey = q.correctKey;
            const userKey = parseInt(q.userSelectedKey);
            //console.log(correctKey);
            //console.log(userKey);
            const optionsHtml = q.options.map((option, optIndex) => {
                const optionKey = String.fromCharCode('A'.charCodeAt(0) + optIndex);
                //console.log(optionNums);
                let mark = '';
                if (optionNums % 4 === correctKey) {
                    mark = '<div class="wa_option_c"><span class="wa_correct">【正確答案】</span><br>';
                } else if (optionNums % 4 === userKey) {
                    mark = '<div class="wa_option_u"><span class="wa_wrong">【您的答案】</span><br>';
                } else {
                    mark = '<div class="wa_option">';
                }
                optionNums++;
                return `${mark}${optionKey}. ${option} </div>`;
            }).join('');
            htmlContent += `
            <div class="wa_item">
                <h4>${q.question}</h4>
                ${optionsHtml}
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

