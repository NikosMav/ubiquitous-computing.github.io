// Array of positive messages for correct answers
const positiveMessages = [
  "Μπράβο! Λίγοι απαντούν σωστά σε αυτό!",
  "Πολύ σωστά!",
  "Μπράβο! Συνέχισε έτσι!",
  "Είσαι ιδιοφυΐα!",
  "Ουάου! Το πέτυχες!",
  "Μπράβο! Πάμε στην επόμενη!",
  "Το κάνεις να φαίνεται εύκολο!"
];

// Array of negative messages for incorrect answers
const negativeMessages = [
  "Δεν πειράζει, πάμε στην επόμενη!",
  "Μην αγχώνεσαι, πάμε στην επόμενη!",
  "Χμμ, μάλλον μπερδεύτηκες...",
  "Αυτό δεν φαίνεται σωστό...",
  "Ίσως χρειάζεσαι επανάληψη..."
];

const negativeMessagesAboutPeople = [
  "Ποιός;!",
  "Μάλλον θα τους μπέρδεψες...",
  "Λάθος άτομο!",
  "Ίσως μπέρδεψες τα ονόματα..."
];

const negativeMessagesAboutTime = [
  "Πότε;!",
  "Θα μπέρδεψες τις χρονίες μάλλον...",
  "Δεν πρέπει να είσαι καλός με τις ημερομηνίες..."
];

// Quiz Questions
const quizData = [
  {
    question: "Τι σημαίνει το www στις διευθύνσεις ιστοτόπων;",
    options: ["World Wide Web", "World Wide Widget", "Webpage World Wide", "World Wide Wizardry"],
    answer: "World Wide Web"
  },
  {
    question: "Ποια γλώσσα προγραμματισμού χρησιμοποιείται συχνά για την ανάπτυξη ιστού και είναι γνωστή για τη χρήση της στην ανάπτυξη front-end;",
    options: ["Java", "Python", "C++", "JavaScript"],
    answer: "JavaScript"
  },
  {
    question: "Ποια εταιρεία ανέπτυξε το λειτουργικό σύστημα Windows;",
    options: ["Microsoft", "Apple", "Google", "Amazon"],
    answer: "Microsoft"
  },
  {
    question: "Η διάχυτη υπολογιστική αναφέρεται σε:",
    options: ["Υπολογιστές που είναι εξαιρετικά ακριβοί", "Υπολογιστές που είναι μικροί και εύκολοι στη μεταφορά", "Υπολογιστές που ενσωματωμένοι σε καθημερινά αντικείμενα και περιβάλλοντα", "Υπολογιστές που χρησιμοποιούνται αποκλειστικά για παιχνίδια"],
    answer: "Υπολογιστές που ενσωματωμένοι σε καθημερινά αντικείμενα και περιβάλλοντα"
  },
  {
    question: "Ποιά τεχνολογία χρησιμοποιείται συνήθως για τον εντοπισμό και την απόκριση σε αλλαγές στο φυσικό περιβάλλον;",
    options: ["Σάρωση γραμμωτού κώδικα", "RFID", "Κωδικοί QR", "Αισθητήρες και ενεργοποιητές"],
    answer: "Αισθητήρες και ενεργοποιητές"
  },
  {
    question: "Ποιος επιστήμονας υπολογιστών είναι γνωστός ως ο πατέρας της επιστήμης των υπολογιστών και της τεχνητής νοημοσύνης;",
    options: ["Alan Turing", "Albert Einstein", "Isaac Newton", "Charles Babbage"],
    answer: "Alan Turing",
    incorrectMessages: negativeMessagesAboutPeople
  },
  {
    question: "Ποια χρονιά θεωρείται η γέννηση του σύγχρονου υπολογιστή;",
    options: ["1936", "1945", "1951", "1960"],
    answer: "1936",
    incorrectMessages: negativeMessagesAboutTime
  },
  {
    question: "Σε ποιον πιστώνεται η ανάπτυξη του πρώτου υπολογιστή γενικής χρήσης, του Analytical Engine;",
    options: ["Alan Turing", "Ada Lovelace", "Charles Babbage", "Grace Hopper"],
    answer: "Charles Babbage",
    incorrectMessages: negativeMessagesAboutPeople
  },
  {
    question: "Τι σημαίνει IoT;",
    options: ["Internet of Things", "Information on Technology", "Interactive Online Tools", "Internet of Telecommunications"],
    answer: "Internet of Things"
  },
  {
    question: "Ποια ασύρματη τεχνολογία χρησιμοποιείται συνήθως για επικοινωνία μικρής εμβέλειας μεταξύ συσκευών;",
    options: ["NFC (Near Field Communication)", "Bluetooth", "Wi-Fi", "4G LTE"],
    answer: "Bluetooth"
  },
  {
    question: "Τι είναι ένα «έξυπνο σπίτι» στο πλαίσιο του διάχυτου υπολογισμού;",
    options: ["Ένα σπίτι με μεγάλη βιβλιοθήκη βιβλίων", "Κατοικία με προηγμένους αυτοματισμούς και συνδεδεμένες συσκευές", "Ένα σπίτι με εκτεταμένο κήπο", "Ένα σπίτι με σύνδεση internet υψηλής ταχύτητας"],
    answer: "Κατοικία με προηγμένους αυτοματισμούς και συνδεδεμένες συσκευές"
  },
  {
    question: "Στην πανταχού παρούσα πληροφορική, τι σημαίνει  ο όρος «επίγνωση πλαισίου»;",
    options: ["Η ικανότητα ενός υπολογιστή να κατανοεί τα ανθρώπινα συναισθήματα", "Οι συσκευές έχουν επίγνωση του φυσικού τους περιβάλλοντος και προσαρμόζουν τη συμπεριφορά τους ανάλογα", "Η ικανότητα ενός υπολογιστή να προβλέπει μελλοντικά γεγονότα", "Η δυνατότητα πρόσβασης σε πληροφορίες από οποιαδήποτε τοποθεσία"],
    answer: "Οι συσκευές έχουν επίγνωση του φυσικού τους περιβάλλοντος και προσαρμόζουν τη συμπεριφορά τους ανάλογα"
  }
];

// quiz elements
const container = document.querySelector(".quiz-container");
const startBtn = document.getElementById("start-quiz-btn");
const questionElement = document.getElementById("quiz-question");
const optionsElement = document.getElementById("quiz-options");
const resultElement = document.getElementById("quiz-result");
const quizParagraph = document.getElementById("quiz-paragraph");

// Content elements
const progressBar = document.getElementById("progress-bar");
const restOfContent = document.getElementById("the-content");
const introAnimation = document.getElementById("intro-animation");
const istoria = document.getElementById("istoria");
const dy = document.getElementById("dy");
const dy2 = document.getElementById("dy-2");
const introQuiz = document.getElementById("intro-quiz-1");
const introQuizWrapper = document.getElementById("intro-quiz-wrapper");
const gradientSection = document.getElementById("gradient-section");
const customContent1 = document.getElementById("custom-content-1");
const customContent2 = document.getElementById("custom-content-2");

// result screens
const newbieSection = document.getElementById("newbie-section");
const moderateSection = document.getElementById("moderate-section");
const advancedSection = document.getElementById("advanced-section");
const resultScore = document.getElementsByClassName("result-score");

let currentQuestionIndex = 0;
let score = 0;
// Number of questions to be displayed in the quiz
const numQuestionsToDisplay = 8; // Change this to the desired number
// Shuffle and select random questions
const randomQuestions = getRandomQuestions(numQuestionsToDisplay);

// Function to get a random subset of questions
function getRandomQuestions(numQuestions) {
  const shuffledQuestions = [...quizData].sort(() => 0.5 - Math.random());
  return shuffledQuestions.slice(0, numQuestions);
}

function startQuiz() {
  quizParagraph.style.display = "none";
  startBtn.style.display = "none";
  questionElement.style.display = "block";
  optionsElement.style.display = "block";
  displayQuestion();
}
  
function displayQuestion() {
  // if user took the whole quiz
  if (currentQuestionIndex >= randomQuestions.length) {
    showResult();
    return;
  }

  const questionData = randomQuestions[currentQuestionIndex];
  questionElement.textContent = questionData.question;
  optionsElement.innerHTML = "";

  questionData.options.forEach((option, index) => {
    const optionButton = document.createElement("button");
    optionButton.setAttribute("class", "quiz-button");
    optionButton.textContent = option;
    optionsElement.appendChild(optionButton);

    optionButton.addEventListener("click", () => {
      // Disable all option buttons after selection to prevent multiple clicks
      const optionButtons = document.querySelectorAll(".quiz-button");
      optionButtons.forEach((button) => (button.disabled = true));

      // Check the answer and show result immediately
      checkAnswer(option, questionData.answer, optionButton);
    });
  });
}

function getRandomMessage(messages) {
  // Generate a random index within the range of the array length
  const randomIndex = Math.floor(Math.random() * messages.length);
  // Return the random message based on the random index
  return messages[randomIndex];
}

function checkAnswer(selectedOption, correctAnswer, optionButton) {
  const optionButtons = document.querySelectorAll(".quiz-button");

  optionButtons.forEach((button) => {
    button.disabled = true; // Disable all option buttons after selection to prevent multiple clicks

    if (button === optionButton) {
      // Apply the correct or incorrect color to the selected option
      if (selectedOption === correctAnswer) {
        score++;
        resultElement.textContent = getRandomMessage(positiveMessages);
        button.classList.add("correct-answer");
      } else {
        // Add a class to show the correct answer button with green color
        const correctButton = Array.from(optionsElement.children).find(
          (button) => button.textContent === correctAnswer
        );
        // indicate the correct answer
        correctButton.classList.add("correct-answer");
        
        // Lets show some incorrect messages for the user
        // If question has spesific incorrect messages, use them instead
        const questionData = randomQuestions[currentQuestionIndex];
        const incorrectMessages = questionData.incorrectMessages || negativeMessages;
        resultElement.textContent = getRandomMessage(incorrectMessages);
        button.classList.add("incorrect-answer");
      }
    }
  });

  // Show the result with a fade-in effect
  resultElement.style.opacity = 1;

  currentQuestionIndex++;
  setTimeout(() => {
    // Reset background color for all option buttons before showing the next question
    optionButtons.forEach((button) => {
      button.classList.remove("correct-answer", "incorrect-answer");
      button.disabled = false; // Re-enable all option buttons
    });
    displayQuestion();

    // Hide the result with a fade-out effect
    resultElement.style.opacity = 0;
  }, 2500); // Set the delay
}

function showResult() {
  questionElement.style.display = "none";
  optionsElement.style.display = "none";
  resultElement.style.display = "none";
  
  // Based on the user's score, customize the rest of the content
  // first of all apply fade out effect and set the rest of the content to be visible
  container.classList.toggle("fade-out");
  // hide the previous intro for the quiz
  introQuiz.style.display= "none";
  // Hide the quiz wrapper...
  introQuizWrapper.classList.add('hidden');
  // and based on the users score personalize the content
  // and also show him a result screen...
  if (score >= randomQuestions.length - 1) { // for example, user has knowledge of the subject, hide unecessary content
    // Show advanced screen
    gradientSection.classList.remove('hidden');
    advancedSection.style.display = "flex";
    advancedSection.classList.remove('hidden');

    //Show score
    resultScore[2].textContent = `Το σκορ σου: ${score}/${randomQuestions.length}`;

    // Show custom intro section
    customContent1.style.display = "block";
    // Show content
    dy2.style.display = "block";
  } else if (score > randomQuestions.length / 2) {
    // Show moderate screen
    gradientSection.classList.remove('hidden');
    moderateSection.style.display = "flex";
    moderateSection.classList.remove('hidden');

    //Show score
    resultScore[1].textContent = `Το σκορ σου: ${score}/${randomQuestions.length}`;

    // Show custom intro section
    customContent2.style.display = "block";
    // Show content
    dy.style.display = "block";
    dy2.style.display = "block";
  } else {
    // Show newbie screen
    gradientSection.classList.remove('hidden');
    newbieSection.style.display = "flex";
    newbieSection.classList.remove('hidden');

    //Show score
    resultScore[0].textContent = `Το σκορ σου: ${score}/${randomQuestions.length}`;

    // Show content
    introAnimation.style.display = "block";
    istoria.style.display = "block";
    dy.style.display = "block";
    dy2.style.display = "block";
  }

  // reveal the rest of the content
  restOfContent.style.display = "block";
  // and the progress bar
  progressBar.style.display = "block";

  // Bind the scroll event for the artificial resize event
  bindScrollEvent();
}

function triggerFakeResize() {
  window.dispatchEvent(new Event('resize'));
}

function bindScrollEvent() {
  const targetSection = document.querySelector("#scenario-intro");

  if (targetSection) {
    window.addEventListener("scroll", function() {
      const rect = targetSection.getBoundingClientRect();

      if (rect.top <= window.innerHeight / 2) {
        triggerFakeResize();

        // Optionally: Remove the scroll event listener after triggering to avoid repeated triggers
        this.removeEventListener('scroll', arguments.callee);
      }
    });
  }
}

// First set the progress bar and the rest of content to be hidden
progressBar.style.display = "none";
restOfContent.style.display = "none";
// Then hide all of the different divs too
// in order to perform a customizable content after the quiz
introAnimation.style.display = "none";
istoria.style.display = "none";
dy.style.display = "none";
dy2.style.display = "none";
customContent1.style.display = "none";
customContent2.style.display = "none";

// Initialize the quiz
questionElement.style.display = "none";
optionsElement.style.display = "none";
resultElement.style.opacity = 0;

//Hide the result screens
newbieSection.style.display = "none";
moderateSection.style.display = "none";
advancedSection.style.display = "none";

// Start the quiz
startBtn.addEventListener("click", startQuiz);
  