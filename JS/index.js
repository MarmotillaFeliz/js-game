let quizQuestions;

const fetchData = (amount, category, difficulty) => {
  const baseURL = "https://opentdb.com/api.php";
  let URL;
  if (category === "any" && difficulty === "any") {
    URL = `${baseURL}?amount=${amount}&type=multiple`;
  } else if (difficulty === "any") {
    URL = `${baseURL}?amount=${amount}&category=${category}&type=multiple`;
  } else if (category === "any") {
    URL = `${baseURL}?amount=${amount}&difficulty=${difficulty}&type=multiple`;
  } else {
    URL = `${baseURL}?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
  }

  fetch(URL)
    .then(response => {
      return response.json();
    })
    .then(payload => {
      quizQuestions = JSON.parse(JSON.stringify(payload));
      document.getElementById("url-generator").classList.toggle("d-none");
      document.getElementById("start").classList.toggle("d-none");
    })
    .catch(error => console.log(error));
};

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("url-generator").addEventListener("click", event => {
    let difficulty = document.getElementById("difficulty").value;
    let amount = document.getElementById("amount").value;
    let category = document.getElementById("category").value;
    console.log(category, amount, difficulty);
    fetchData(amount, category, difficulty);
  });
});

// Initial values
let counter = 30;
let currentQuestion = 0;
let score = 0;
let lost = 0;
let timer;

// If the timer is over, then go to the next question
function nextQuestion() {
  const isQuestionOver = quizQuestions.results.length - 1 === currentQuestion;
  if (isQuestionOver) {
    displayResult();
  } else {
    currentQuestion++;
    loadQuestion();
  }
}

// Start a 30 seconds timer for user to respond or choose an answer to each question
function timeUp() {
  clearInterval(timer);

  lost++;

  displayAnswer("lost");
  setTimeout(nextQuestion, 3 * 1000);
}

function countDown() {
  counter--;

  $("#time").html("Timer: " + counter);

  if (counter === 0) {
    timeUp();
  }
}

// Display the question and the choices to the browser
function loadQuestion() {
  counter = 30;
  timer = setInterval(countDown, 1000);

  const question = quizQuestions.results[currentQuestion].question;
  const choices = [
    ...quizQuestions.results[currentQuestion].incorrect_answers,
    quizQuestions.results[currentQuestion].correct_answer
  ];

  shuffle(choices);

  $("#time").html("Timer: " + counter);
  $("#game").html(`
        <h4>${question}</h4>
        ${loadChoices(choices)}
        ${loadQuestionCount()}
    `);
}

function loadChoices(choices) {
  let result = "";

  for (let i = 0; i < choices.length; i++) {
    result += `<p class="choice" data-answer="${choices[i]}">${choices[i]}</p>`;
  }

  return result;
}

// Either correct/wrong choice selected, go to the next question
// Event Delegation
$(document).on("click", ".choice", function() {
  clearInterval(timer);
  const selectedAnswer = $(this).attr("data-answer");
  const correctAnswer = quizQuestions.results[currentQuestion].correct_answer;

  if (correctAnswer === selectedAnswer) {
    score++;
    displayAnswer("win");
    setTimeout(nextQuestion, 3 * 1000);
  } else {
    lost++;
    displayAnswer("lost");
    setTimeout(nextQuestion, 3 * 1000);
  }
});

function displayResult() {
  const result = `
        <p>You've got ${score} question(s) right on ${quizQuestions.results.length} questions</p>
    `;
  $("#game").html("");
  $("#time").html("");
  document.getElementById("reset").classList.toggle("d-none");
  document.getElementById("displayGameOver").classList.toggle("d-none");
  document.getElementById("newGame").classList.toggle("d-none");
  $("#displayGameOver").html(result);
}

document.getElementById("newGame").addEventListener("click", event => {
  counter = 30;
  currentQuestion = 0;
  score = 0;
  lost = 0;
  timer = null;

  document.getElementById("reset").classList.toggle("d-none");
  document.getElementById("newGame").classList.toggle("d-none");
  document.getElementById("url-generator").classList.toggle("d-none");
  document.getElementById("form").classList.toggle("d-none");
  document.getElementById("displayGameOver").classList.toggle("d-none");
  $("#displayGameOver").html("");
});

document.getElementById("reset").addEventListener("click", event => {
  counter = 30;
  currentQuestion = 0;
  score = 0;
  lost = 0;
  timer = null;

  document.getElementById("reset").classList.toggle("d-none");
  document.getElementById("newGame").classList.toggle("d-none");
  document.getElementById("displayGameOver").classList.toggle("d-none");
  $("#displayGameOver").html("");

  loadQuestion();
});

// Display question counter

function loadQuestionCount() {
  const totalQuestion = quizQuestions.results.length;

  return `Question ${currentQuestion + 1} of ${totalQuestion}`;
}

// Display correct and wrong answers

function displayAnswer(status) {
  const correctAnswer = quizQuestions.results[currentQuestion].correct_answer;

  if (status === "win") {
    $("#game").html(`
            <p>Congratulations, you pick the corrrect answer</p>
            <p>The correct answer is <span class="correct-answer">${correctAnswer}</span></p>
        `);
  } else {
    $("#game").html(`
            <p>The correct answer was <span class="correct-answer">${correctAnswer}</span></p>
            <p>You lost pretty bad</p>
        `);
  }
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

document.getElementById("start").addEventListener("click", event => {
  document.getElementById("start").classList.toggle("d-none");
  document.getElementById("form").classList.toggle("d-none");
  $("#time").html(counter);
  loadQuestion();
});
