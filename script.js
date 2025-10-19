const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const database = firebase.database();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userPhoto = document.getElementById("user-photo");

const notLoggedIn = document.getElementById("not-loggedin");
const quizArea = document.getElementById("quiz-area");
const yearButtonsDiv = document.getElementById("year-buttons");
const quizContent = document.getElementById("quiz-content");

let quizData = [];
let currentIndex = 0;
let correctCount = 0;
let totalCount = 0;

// 登入/登出
loginBtn.addEventListener("click", () => {
  auth.signInWithPopup(provider).catch(err => alert("登入失敗：" + err.message));
});

logoutBtn.addEventListener("click", () => auth.signOut());

auth.onAuthStateChanged(user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    userInfo.textContent = `👋 ${user.displayName}`;
    if (user.photoURL) {
      userPhoto.src = user.photoURL;
      userPhoto.style.display = "inline-block";
    }
    notLoggedIn.style.display = "none";
    quizArea.style.display = "block";
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    userInfo.textContent = "";
    userPhoto.style.display = "none";
    notLoggedIn.style.display = "block";
    quizArea.style.display = "none";
  }
});

// 動態產生年份按鈕（目前只有 202504）
const years = ["202504"];
yearButtonsDiv.innerHTML = "";
years.forEach(y => {
  const btn = document.createElement("button");
  btn.textContent = y + " 年";
  btn.className = "year-btn";
  btn.dataset.year = y;
  btn.addEventListener("click", () => startQuiz(y));
  yearButtonsDiv.appendChild(btn);
});

// 更新進度條
function updateProgress(currentIndex, total) {
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  if (!progressBar || !progressText) return;

  const percent = ((currentIndex + 1) / total) * 100;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${currentIndex + 1}/${total}`;
}

// 開始題庫
async function startQuiz(year) {
  try {
    const snapshot = await database.ref(`/${year}`).once("value");
    const data = snapshot.val();
    if (!data) {
      quizContent.innerHTML = "題庫空白！";
      return;
    }
    quizData = Object.values(data);
    currentIndex = 0;
    correctCount = 0;
    totalCount = 0;

    // 初始化進度條
    if (!document.getElementById("progress-container")) {
      quizContent.innerHTML = `
        <div id="progress-container" style="margin-bottom:10px; background:#eee; border-radius:5px; position:relative; height:25px;">
          <div id="progress-bar" style="background:#4CAF50; height:100%; width:0%; border-radius:5px;"></div>
          <div id="progress-text" style="position:absolute; width:100%; text-align:center; top:0; left:0; line-height:25px; font-weight:bold;"></div>
        </div>
        <div id="question-area"></div>
      `;
    }

    showQuestion();
  } catch (err) {
    quizContent.innerHTML = "讀取題庫失敗：" + err.message;
  }
}

// 顯示單題
async function showQuestion() {
  const totalQuestions = quizData.length;
  if (currentIndex >= totalQuestions) {
    // 題庫結束
    quizContent.innerHTML = `<h3>題庫完成！</h3>
      <p>總分：${correctCount} / ${totalCount}</p>`;
    return;
  }

  const q = quizData[currentIndex];
  const user = auth.currentUser;
  let recordText = "";

  // 讀取單題答題紀錄
  try {
    const recordSnapshot = await database.ref(`/records/${user.uid}/${currentIndex}`).once("value");
    const record = recordSnapshot.val() || { correct: 0, total: 0 };
    recordText = `單題正確率：${record.correct}/${record.total}`;
  } catch (err) {
    console.log("讀取紀錄失敗", err);
  }

  const questionArea = document.getElementById("question-area");
  questionArea.innerHTML = `
    <h3>${q.question}</h3>
    <p style="font-size:14px;color:#555" id="record-text">${recordText}</p>
    <div id="options">
      ${q.options.map((o, i) => `<button class="option-btn" data-index="${i}">${o}</button>`).join("")}
    </div>
    <div id="feedback" style="margin-top:10px;"></div>
    <button id="next-btn" style="display:none;margin-top:10px;">下一題</button>
  `;

  updateProgress(currentIndex, totalQuestions);

  const optionButtons = document.querySelectorAll(".option-btn");
  const feedback = document.getElementById("feedback");
  const nextBtn = document.getElementById("next-btn");

  optionButtons.forEach(btn => btn.addEventListener("click", async e => {
    const selectedIndex = parseInt(e.target.dataset.index);
    const selectedLetter = String.fromCharCode(65 + selectedIndex);
    const correctLetter = q.answer;
    const correctIndex = q.answer.charCodeAt(0) - 65;

    optionButtons.forEach(b => b.disabled = true);

    const isCorrect = selectedLetter === correctLetter;
    feedback.textContent = isCorrect
      ? `答對了 👍`
      : `答錯了 😢 正確答案是 ${correctLetter}. ${q.options[correctIndex]}`;

    // 標示顏色
    optionButtons[correctIndex].style.backgroundColor = "#4CAF50";
    if (!isCorrect) btn.style.backgroundColor = "#f44336";

    // 更新 Firebase 單題紀錄
    const recordRef = database.ref(`/records/${user.uid}/${currentIndex}`);
    try {
      const snap = await recordRef.once("value");
      const r = snap.val() || { correct:0, total:0 };
      const updated = {
        correct: r.correct + (isCorrect ? 1 : 0),
        total: r.total + 1
      };
      await recordRef.set(updated);
      document.getElementById("record-text").textContent = `單題正確率：${updated.correct}/${updated.total}`;
    } catch(err) {
      console.log("更新紀錄失敗", err);
    }

    // 更新總答題數與正確數
    totalCount++;
    if (isCorrect) correctCount++;

    nextBtn.style.display = "inline-block";
  }));

  nextBtn.addEventListener("click", () => {
    currentIndex++;
    showQuestion();
  });
}
