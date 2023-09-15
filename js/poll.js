const fixedResults = {
    Very_Familiar: 5,
    Somewhat_Familiar: 20,
    Not_Sure: 30,
    Not_Very_Familiar: 25,
    Not_Familiar_at_All: 20
};

const totalVotes = Object.values(fixedResults).reduce((acc, value) => acc + value, 0);

// Event listener for radio button changes (to highlight the selected option)
const radioButtons = document.querySelectorAll('input[type="radio"]');
radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
        const labels = document.querySelectorAll('form label');
        labels.forEach(label => {
            if (label.getAttribute('for') === this.value) {
                label.classList.add('selected-option');
            } else {
                label.classList.remove('selected-option');
            }
        });
    });
});

// Event listener for form submission
document.getElementById("pollForm").onsubmit = function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const voteValue = formData.get("vote");

    // Update the UI with a thank-you message and show fixed results
    document.getElementById("pollForm").style.display = "none";
    const messageElement = document.getElementById("message");
    messageElement.style.display = "block";
    messageElement.innerHTML = "Ευχαριστούμε που ψηφίσατε!";
    
    const resultsElement = document.getElementById("results");
    resultsElement.style.display = "block";

    // Calculate percentages and display the results
    const percentages = Object.keys(fixedResults).map(key => 
        ((fixedResults[key] / totalVotes) * 100).toFixed(1)
    );

    // Highlight the selected option with a custom color
    const highlightColor = "#ff1825";
    const backgroundColors = ["#004c6d", "#256488", "#407da4", "#5997c1", "#72b2df"];

    const chartData = {
        labels: ["Εξπέρ των Νεφών", "Έμπειρος στο Cloud", "Έτσι και έτσι", "Νέος στο Cloud", "Συννεφιασμένη Κυριακή"],
        datasets: [{
            data: percentages.map(value => parseFloat(value)),
            backgroundColor: [
                voteValue === "Very_Familiar" ? highlightColor : backgroundColors[0],
                voteValue === "Somewhat_Familiar" ? highlightColor : backgroundColors[1],
                voteValue === "Not_Sure" ? highlightColor : backgroundColors[2],
                voteValue === "Not_Very_Familiar" ? highlightColor : backgroundColors[3],
                voteValue === "Not_Familiar_at_All" ? highlightColor : backgroundColors[4],
            ],
        }],
    };

    // Display the chart
    const ctx = document.getElementById("chart").getContext("2d");
    const chart = new Chart(ctx, {
        type: "pie",
        data: chartData,
        options: {
            responsive: true,
            title: {
                display: true,
                text: "Poll Results",
                fontSize: 20
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.parsed;
                            let label = context.label;
                            return label + ': ' + value + '%';
                        }
                    }
                }
            }
        }
    });
};
