const QUIZ_LIST = [
    { id: '202501', name: '2025上半年', file: '202504.json' },
];
let currentQuizFile = '';
let question = [];
let currentQuestion = [];
let wrongAnswers = [];
let questionNumber = 1;
let score = 0;
let totalQuestions = 0;
const optionButtons = document.querySelectorAll('.option_btn');
const nextButton = document.getElementById('btn_next');

document.addEventListener('DOMContentLoaded', renderQuizSelection); 

function renderQuizSelection() {
    const listContainer = document.getElementById('selection_list');
    
    QUIZ_LIST.forEach(quiz => {
        const button = document.createElement('button');
        button.textContent = quiz.name;
        button.className = 'quiz_select_btn';
        
        // 將檔案名作為 data 屬性儲存
        button.dataset.file = quiz.file; 
        
        button.addEventListener('click', handleQuizSelection);
        listContainer.appendChild(button);
    });
    
    // 確保只顯示選擇區域
    document.getElementById('quiz_selection_area').style.display = 'block';
    document.getElementById('question_area').style.display = 'none';
    document.getElementById('q_control').style.display = 'none';
}

function handleQuizSelection(event) {
    const selectedFile = event.target.dataset.file;
    if (selectedFile) {
        // 1. 儲存檔案名稱
        currentQuizFile = selectedFile; 
        
        // 2. 隱藏選擇區域，顯示測驗區域
        document.getElementById('quiz_selection_area').style.display = 'none';
        document.getElementById('question_area').style.display = 'block';
        document.getElementById('q_control').style.display = 'flex';
        
        // 3. 載入選定的題庫
        loadQuestions(); 
    }
}

// 修正 loadQuestions 函式，使其使用 currentQuizFile
async function loadQuestions() {
    // 🚀 關鍵修正：使用 currentQuizFile 載入 JSON
    const response = await fetch(currentQuizFile); 
    question = await response.json();
    
    // 重設狀態（如果需要）
    questionNumber = 1; 
    score = 0;
    wrongAnswers = [];
    
    totalQuestions = Object.keys(question).length;
    displayQuestion();
}

function displayQuestion() {
    if (questionNumber>50) {
        showResults();
        return;
    }
    currentQuestion = question[questionNumber.toString()];
    document.getElementById('q_text').textContent = currentQuestion.question;
    document.getElementById('A').textContent = "A."+currentQuestion.options[0];
    document.getElementById('B').textContent = "B."+currentQuestion.options[1];
    document.getElementById('C').textContent = "C."+currentQuestion.options[2];
    document.getElementById('D').textContent = "D."+currentQuestion.options[3];
    document.getElementById('hint').textContent = "本題尚未作答完畢";
    nextButton.disabled = true;
    if (!question[(questionNumber + 1).toString()]) {
        nextButton.textContent = "查看結果";
    } else {
        nextButton.textContent = "下一題";
    }
    currentQuestion = question[questionNumber.toString()];
    const pTextElement = document.getElementById('p_text');
    pTextElement.textContent = `第 ${questionNumber} / ${totalQuestions} 題`;
    const pBarElement = document.getElementById('p_bar');
    const percentage = (questionNumber / totalQuestions) * 100; 
    pBarElement.style.width = `${percentage}%`;
}

function checkAnswer(selectedButton) {
    const selectedAnswer = selectedButton.id; 
    if (selectedAnswer === currentQuestion.answer) {
         console.log("答對了!");
         document.getElementById('hint').textContent = "✅正確答案";
         selectedButton.classList.add('correct');
         score+=2;
    } 
    else {
        console.log("答錯了!");
        document.getElementById('hint').innerHTML = "❌錯誤答案<br>正確答案是 "+document.getElementById(currentQuestion.answer).textContent;
        document.getElementById(currentQuestion.answer).classList.add('correct'); // 正確答案顯示綠色
        selectedButton.classList.add('incorrect');
        const wrongQ = {
            ...currentQuestion,
            userSelectedKey: selectedButton.id
        };
        wrongAnswers.push(wrongQ)
    }
    disableAllOptions(); 
    document.getElementById('btn_next').disabled = false;
}

optionButtons.forEach(button => { 
    button.addEventListener('click', function(event) {
        const clickedButton = event.target; 
        console.log(`您按下了選項: ${clickedButton.textContent}`);
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
    document.getElementById('q_text').textContent = `測驗結束！您的總分是 ${score} 分。`;
    document.querySelectorAll('.option_btn').forEach(btn => btn.style.display = 'none');
    document.getElementById('hint').style.display = 'none';
    document.getElementById('btn_next').style.display = 'none';
    if (wrongAnswers.length > 0) {
        let htmlContent = '<h2 class="wa_hint">以下是您答錯的題目：</h2>';
        
        wrongAnswers.forEach((q, index) => {
            // 找到正確答案的文字內容
            const correctKey = q.answer;
        // 找到使用者選擇的鍵 (我們假設您在 checkAnswer 中儲存了 userSelectedKey)
            const userKey = q.userSelectedKey;
            const optionsHtml = q.options.map((option, optIndex) => {
            const optionKey = String.fromCharCode('A'.charCodeAt(0) + optIndex);
            let mark = '';
            if (optionKey === correctKey) {
                mark = '<div class="wa_option_c"><span class="wa_correct">【正確答案】</span><br>';
            }
            else if (optionKey === userKey) {
                mark = '<div class="wa_option_u"><span class="wa_wrong">【您的答案】</span><br>';
            }
            else{
                mark = '<div class="wa_option">';
            }
            return `${mark}${optionKey}. ${option} </div>`; 
        }).join(''); 
        htmlContent += `
            <div class="wa_item">
                <h4>${q.question}</h4>
                ${optionsHtml}
            </div>
        `;
    });
    
    // 總共只用了一行 innerHTML 賦值 (因為我們使用模板字串和 map)
    document.getElementById('wa_area').innerHTML = htmlContent;

    } 
    else {
        document.getElementById('wa_area').innerHTML = `
                <div class="wa_item">
                    <h4>恭喜！您全部答對了！🎉</h4>
                </div>
            `;
    }
}

//下題按鈕
nextButton.addEventListener('click', handleNextQuestion);
loadQuestions();