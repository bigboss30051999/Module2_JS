class Question {
    constructor(text, answers, correctIndex, level) {
        this.text = text;
        this.answers = answers;
        this.correctIndex = correctIndex;
        this.level = level; // easy, medium, hard, extreme
    }

    isCorrect(index) {
        return index === this.correctIndex;
    }
}

const soundCorrect = document.getElementById("sound-correct");
const soundWrong = document.getElementById("sound-wrong");
const soundHelp = document.getElementById("sound-help");

const questionBank = [
    // Easy
    new Question("1 + 1 bằng mấy?", ["1", "2", "3", "4"], 1, "easy"),
    new Question("Thủ đô của Việt Nam là?", ["TP.HCM", "Hà Nội", "Huế", "Đà Nẵng"], 1, "easy"),
    new Question("Màu lá cây là?", ["Đỏ", "Xanh", "Vàng", "Tím"], 1, "easy"),

    // Medium
    new Question("HTML là viết tắt của?", ["HyperText", "Hi-Tech", "Hiper Tool", "HyperLink"], 0, "medium"),
    new Question("Ngôn ngữ tạo style là gì?", ["JS", "Python", "CSS", "C++"], 2, "medium"),
    new Question("Tổng thống đầu tiên của Mỹ?", ["Obama", "Lincoln", "Washington", "Trump"], 2, "medium"),

    // Hard
    new Question("Số nguyên tố lớn nhất dưới 100?", ["89", "97", "93", "99"], 1, "hard"),
    new Question("Tế bào mang oxy là?", ["Hồng cầu", "Bạch cầu", "Tiểu cầu", "Plasma"], 0, "hard"),
    new Question("Tốc độ ánh sáng là?", ["300.000 km/s", "150.000 km/s", "1.000 km/h", "1.080 km/h"], 0, "hard"),

    // Extreme
    new Question("Người đầu tiên lên Mặt Trăng?", ["Buzz", "Gagarin", "Armstrong", "Shepard"], 2, "extreme"),
];

function getRandomQuestions(level, count) {
    return questionBank
        .filter(q => q.level === level)
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
}

class Game {
    constructor() {
        this.questions = [
            ...getRandomQuestions("easy", 3),
            ...getRandomQuestions("medium", 3),
            ...getRandomQuestions("hard", 3),
            ...getRandomQuestions("extreme", 1),
        ];
        this.score = 0;
        this.current = 0;
        this.highScore = parseInt(localStorage.getItem("highScore")) || 0;
        this.used5050 = false;
        this.usedCall = false;
        this.usedAudience = false;
    }

    getCurrentQuestion() {
        return this.questions[this.current];
    }

    displayQuestion() {
        const q = this.getCurrentQuestion();
        document.getElementById("question").textContent = q.text;
        const answersDiv = document.getElementById("answers");
        answersDiv.innerHTML = "";
        q.answers.forEach((ans, i) => {
            const btn = document.createElement("button");
            btn.textContent = ans;
            btn.dataset.index = i;
            btn.onclick = () => this.checkAnswer(i);
            answersDiv.appendChild(btn);
        });

        document.getElementById("score").textContent = this.score;
        document.getElementById("highScore").textContent = this.highScore;
    }

    checkAnswer(index) {
        const q = this.getCurrentQuestion();
        if (q.isCorrect(index)) {
            soundCorrect.play();
            this.score++;
        } else {
            soundWrong.play();
        }
        this.current++;
        if (this.current < this.questions.length) {
            this.displayQuestion();
        } else {
            this.endGame();
        }
    }

    endGame() {
        if (this.score > this.highScore) {
            localStorage.setItem("highScore", this.score);
        }
        alert("Trò chơi kết thúc! Điểm của bạn: " + this.score);
        this.reset();
    }

    reset() {
        const newGame = new Game();
        Object.assign(this, newGame);
        this.displayQuestion();
    }

    use5050() {
        if (this.used5050) return;
        soundHelp.play();
        this.used5050 = true;
        const q = this.getCurrentQuestion();
        const wrongs = q.answers.map((_, i) => i).filter(i => i !== q.correctIndex);
        const hideTwo = wrongs.sort(() => 0.5 - Math.random()).slice(0, 2);
        hideTwo.forEach(i => {
            document.querySelector(`[data-index="${i}"]`).style.display = "none";
        });
        document.getElementById("btn5050").classList.add("used");
    }

    useCall() {
        if (this.usedCall) return;
        soundHelp.play();
        this.usedCall = true;
        const q = this.getCurrentQuestion();
        const guess = Math.random() < 0.7 ? q.correctIndex : (q.answers.findIndex((_, i) => i !== q.correctIndex));
        alert("Người thân nghĩ là: " + q.answers[guess]);
        document.getElementById("btnCall").classList.add("used");
    }

    useAudience() {
        if (this.usedAudience) return;
        soundHelp.play();
        this.usedAudience = true;
        const q = this.getCurrentQuestion();
        let percents = [0, 0, 0, 0];
        let correctP = Math.floor(Math.random() * 30) + 50;
        percents[q.correctIndex] = correctP;
        let remain = 100 - correctP;
        q.answers.forEach((_, i) => {
            if (i !== q.correctIndex) {
                const val = i === q.answers.length - 1 ? remain : Math.floor(Math.random() * remain);
                percents[i] = val;
                remain -= val;
            }
        });
        let msg = "Ý kiến khán giả:\n";
        q.answers.forEach((ans, i) => {
            msg += `${ans}: ${percents[i]}%\n`;
        });
        alert(msg);
        document.getElementById("btnAudience").classList.add("used");
    }
}

const game = new Game();
game.displayQuestion();

document.getElementById("btn5050").onclick = () => game.use5050();
document.getElementById("btnCall").onclick = () => game.useCall();
document.getElementById("btnAudience").onclick = () => game.useAudience();
document.getElementById("nextBtn").onclick = () => game.displayQuestion();
