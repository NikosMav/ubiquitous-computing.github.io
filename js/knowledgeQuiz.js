const optionsContainer = document.querySelector('.options');
const feedback = document.querySelector('.feedback');
const nextButton = document.querySelector('.next-button');
const questionText = document.querySelector('.question-text');
const progressBar = document.querySelector('.progress');
let currentQuestionIndex = 0;
let score = 0;
let questions = []; // Initialize an empty array to store questions


// Initialize Email.js with your credentials
emailjs.init('V0fvNx4SKEDTgou45');

// Function to validate an email address
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to send the souvenir email
function sendSouvenirEmail(userEmail) {
  // Customize the email content with a personalized thank-you message, souvenir value, and quiz score
  const souvenirValue = "Your souvenir value"; // Replace with your desired souvenir value
  const quizScore = score; // Get the user's quiz score

  // Construct the email content
  const emailContent = `
      Αγαπητέ χρήστη,

      Σας ευχαριστούμε που πήρατε το κουίζ μας! Εκτιμούμε τη συμμετοχή σας.

      Souvenir Value: ${souvenirValue}
      Βαθμολογία Κουίζ: ${quizScore}/${questions.length}

      Ελπίζουμε να σας άρεσε το κουίζ και ανυπομονούμε να σας έχουμε ξανά.

      Τις καλύτερες ευχές,
      Η ομάδα μας
  `;


  emailjs.send('service_bsdrcvc', 'template_xr1ap1i', {
      to_email: userEmail,
      subject: 'Σας ευχαριστούμε που ολοκληρώσατε το κουίζ μας',
      message: emailContent, // Use 'message' or the appropriate variable name for the email body
      // Include any additional data you want in the email template
  }).then(
      function (response) {
          console.log('Το email στάλθηκε με επιτυχία:', response);
          alert('Το αναμνηστικό email στάλθηκε με επιτυχία! Ελέγξτε τα εισερχόμενά σας.');
      },
      function (error) {
          console.error('Δεν ήταν δυνατή η αποστολή του email:', error);
          alert('Λυπούμαστε, παρουσιάστηκε σφάλμα κατά την αποστολή του email. Παρακαλώ δοκιμάστε ξανά αργότερα.');
      }
  );
}

// Fetch questions from JSON file
async function fetchQuestions() {
  try {
    const response = await fetch('questions.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

function displayQuestion(index) {
  const currentQuestion = questions[index];
  questionText.textContent = currentQuestion.question;

  optionsContainer.innerHTML = '';

  currentQuestion.options.forEach((optionText, optionIndex) => {
      const optionButton = document.createElement('button');
      optionButton.classList.add('option');
      optionButton.textContent = optionText;
      optionsContainer.appendChild(optionButton);

      optionButton.addEventListener('click', () => {
      selectOption(optionButton);
      updateProgressBar();
      });
  });

  feedback.textContent = '';
}

function selectOption(optionButton) {
  optionsContainer.querySelectorAll('.option').forEach(o => {
    o.classList.remove('selected');
  });
  optionButton.classList.add('selected');
}

function disableOptions() {
  optionsContainer.querySelectorAll('.option').forEach(option => {
    option.disabled = true;
  });
}

function enableOptions() {
  optionsContainer.querySelectorAll('.option').forEach(option => {
    option.disabled = false;
  });
}

function displayFeedback(isCorrect) {
  feedback.textContent = isCorrect ? 'Σωστό!' : 'Λάθος!';
  feedback.style.color = isCorrect ? 'green' : 'red';
}

function updateProgressBar() {
  const progress = (currentQuestionIndex) / questions.length * 100;
  console.log(progress);
  progressBar.style.width = `${progress}%`;
}

// Function to display face image based on score
function displayFaceImage() {
  const faceImageContainer = document.createElement('div');
  faceImageContainer.classList.add('face-image-container');

  const faceImage = document.createElement('img');
  faceImage.classList.add('face-image');

  // Determine which image to display based on score
  const percentageScore = (score / questions.length) * 100;
  if (percentageScore <= 33) {
      faceImage.src = 'images/sad.png';
  } else if (percentageScore <= 66) {
      faceImage.src = 'images/neutral-face.png';
  } else {
      faceImage.src = 'images/happiness.png';
  }

  faceImageContainer.appendChild(faceImage);

  // Append the face image container to the quiz container or wherever you want it to appear
  const quizContainer = document.querySelector('.quiz-container');
  quizContainer.appendChild(faceImageContainer);
}

function displayFinalScore() {
  const scoreElement = document.querySelector('.score');
  scoreElement.textContent = `Το τελικό σου σκορ: ${score}/${questions.length}`;
  scoreElement.style.color = 'black'; // You can adjust the color as needed

  // Display the face image based on the score
  displayFaceImage();
}

// Handle the email submission
nextButton.addEventListener('click', () => {
  const selectedOption = document.querySelector('.selected');
  if (selectedOption) {
      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = selectedOption.textContent === currentQuestion.correctAnswer;

      if (isCorrect) {
          score++;
      }

      displayFeedback(isCorrect);
      selectedOption.classList.remove('selected');
      selectedOption.classList.add(isCorrect ? 'correct' : 'incorrect');

      disableOptions();

      nextButton.disabled = true;

      setTimeout(() => {
          nextButton.disabled = false;
          if (currentQuestionIndex < questions.length - 1) {
              currentQuestionIndex++;
              displayQuestion(currentQuestionIndex);
              enableOptions();
          } else {
              currentQuestionIndex++;
              optionsContainer.innerHTML = '';
              feedback.textContent = '';
              questionText.textContent = '';
              nextButton.style.display = 'none';

              // Add a delay before showing the score
              setTimeout(() => {
                  displayFinalScore();
                  // Trigger email input form display here if needed
                  displayEmailInputForm();
              }, 2000);
          }
          updateProgressBar();
      }, 1000);
  } else {
      feedback.textContent = 'Επιλέξτε μια απάντηση.';
      feedback.style.color = 'red';
  }
});

// Function to display the email input form
function displayEmailInputForm() {
  const emailForm = document.createElement('form');
  emailForm.id = 'email-form';
  emailForm.innerHTML = `
      <label for="email-input">Συμπληρώστε το email σας:</label>
      <input type="email" id="email-input" required>
      <button type="submit">Υποβολή</button>
  `;

  emailForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const userEmail = document.querySelector('#email-input').value;
      if (validateEmail(userEmail)) {
          sendSouvenirEmail(userEmail); // Placeholder - Implement this function
      } else {
          alert('Παρακαλώ εισάγετε μια έγκυρη διεύθυνση ηλεκτρονικού ταχυδρομείου.');
      }
  });

  // Append the email form to the quiz container or wherever you want it to appear
  const quizContainer = document.querySelector('.quiz-container');
  quizContainer.appendChild(emailForm);
}

async function initializeQuiz() {
  const fetchedQuestions = await fetchQuestions();
  if (fetchedQuestions.length > 0) {
      questions = fetchedQuestions; // Store fetched questions in the 'questions' array
      displayQuestion(currentQuestionIndex);
      updateProgressBar();
  } else {
      console.error('No questions available.');
  }
}

// Initialize the quiz by displaying the first question
initializeQuiz();
