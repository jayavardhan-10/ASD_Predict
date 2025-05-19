// Theme logic at the top
const html = document.documentElement;
const darkModeToggle = document.getElementById('darkModeToggle');

function applyTheme(theme) {
    html.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    updateDarkModeIcon(theme === 'dark');
    // Re-render graphs with correct theme
    setTimeout(() => {
        fetchStats();
    }, 100);
}

function updateDarkModeIcon(isDark) {
    if (!darkModeToggle) return;
    const icon = darkModeToggle.querySelector('i');
    icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
}

(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
})();

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });
}

// Back to Top Button
const backToTopBtn = document.createElement('button');
backToTopBtn.id = 'backToTopBtn';
backToTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
document.body.appendChild(backToTopBtn);
window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});
backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Rest of the app logic ---
// Initialize statistics counters (global scope)
const totalCasesCounter = new CountUp('totalCases', 0);
const autismCasesCounter = new CountUp('autismCases', 0);
const nonAutismCasesCounter = new CountUp('nonAutismCases', 0);

document.addEventListener('DOMContentLoaded', function() {
    // Load initial statistics
    fetchStats();

    // Handle form submission
    const predictionForm = document.getElementById('predictionForm');
    if (predictionForm) {
        predictionForm.addEventListener('submit', handlePrediction);
        addScoreInputs(); // Only run on home page
    }

    showRandomFact();

    const shareBtn = document.getElementById('shareResultBtn');
    if (shareBtn) shareBtn.addEventListener('click', shareResult);

    // Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Statistics Animation
    const options = {
        duration: 2,
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.'
    };
    const totalCases = new CountUp('totalCases', 0, 800, 0, 2, options);
    const autismCases = new CountUp('autismCases', 0, 400, 0, 2, options);
    const nonAutismCases = new CountUp('nonAutismCases', 0, 400, 0, 2, options);
    const statsCard = document.querySelector('.stats-card');
    if (statsCard) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    totalCases.start();
                    autismCases.start();
                    nonAutismCases.start();
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(statsCard);
    }
});

function addScoreInputs() {
    const scoreContainer1 = document.querySelector('.col-md-6:first-child');
    const scoreContainer2 = document.querySelector('.col-md-6:last-child');
    if (!scoreContainer1 || !scoreContainer2) return;
    // Add A2-A5 scores to first container
    for (let i = 2; i <= 5; i++) {
        const div = document.createElement('div');
        div.className = 'mb-3';
        div.innerHTML = `
            <label class="form-label">A${i} Score</label>
            <select class="form-select" name="A${i}_Score" required>
                <option value="0">0</option>
                <option value="1">1</option>
            </select>
        `;
        scoreContainer1.appendChild(div);
    }
    // Add A7-A10 scores to second container
    for (let i = 7; i <= 10; i++) {
        const div = document.createElement('div');
        div.className = 'mb-3';
        div.innerHTML = `
            <label class="form-label">A${i} Score</label>
            <select class="form-select" name="A${i}_Score" required>
                <option value="0">0</option>
                <option value="1">1</option>
            </select>
        `;
        scoreContainer2.appendChild(div);
    }
}

function showSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        if (show) {
            spinner.classList.remove('d-none');
        } else {
            spinner.classList.add('d-none');
        }
    }
}

async function fetchStats() {
    try {
        const response = await fetch('/get_stats');
        const data = await response.json();
        // Update counters with animation
        totalCasesCounter.update(data.total_cases);
        autismCasesCounter.update(data.autism_cases);
        nonAutismCasesCounter.update(data.non_autism_cases);
        // Create visualizations
        if (data.visualizations.pie_chart) createPieChart(data.visualizations.pie_chart);
        if (data.visualizations.histogram) createHistogram(data.visualizations.histogram);
    } catch (error) {
        console.error('Error fetching statistics:', error);
    }
}

function createPieChart(data) {
    const pieData = JSON.parse(data);
    console.log('Pie chart data:', pieData);
    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    const pieChartDiv = document.getElementById('pieChart');
    if (pieChartDiv) pieChartDiv.style.minHeight = '350px';
    Plotly.newPlot('pieChart', pieData.data, {
        ...pieData.layout,
        paper_bgcolor: isDark ? '#181c24' : '#fff',
        plot_bgcolor: isDark ? '#181c24' : '#fff',
        font: { color: isDark ? '#f4f6fb' : '#222' }
    });
}

function createHistogram(data) {
    const histData = JSON.parse(data);
    console.log('Histogram data:', histData);
    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    const histogramDiv = document.getElementById('histogram');
    if (histogramDiv) histogramDiv.style.minHeight = '350px';
    Plotly.newPlot('histogram', histData.data, {
        ...histData.layout,
        paper_bgcolor: isDark ? '#181c24' : '#fff',
        plot_bgcolor: isDark ? '#181c24' : '#fff',
        font: { color: isDark ? '#f4f6fb' : '#222' }
    });
}

async function handlePrediction(event) {
    event.preventDefault();
    showSpinner(true);
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        showSpinner(false);
        if (result.status === 'success') {
            showPredictionResult(result);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showSpinner(false);
        showError('An error occurred while making the prediction.');
    }
}

const funFacts = [
    "Autism affects about 1 in 54 children in the United States.",
    "Autism is more common in boys than girls, with a ratio of about 4:1.",
    "Early intervention can significantly improve outcomes for children with autism.",
    "Autism is a spectrum disorder, meaning symptoms can vary widely between individuals.",
    "Many people with autism have exceptional abilities in areas like music, math, or art."
];

function showRandomFact() {
    const funFactElement = document.getElementById('funFact');
    if (funFactElement) {
        // Display a random fun fact
        const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        funFactElement.textContent = randomFact;
        // Change fun fact every 30 seconds
        setInterval(() => {
            const newFact = funFacts[Math.floor(Math.random() * funFacts.length)];
            funFactElement.style.opacity = '0';
            setTimeout(() => {
                funFactElement.textContent = newFact;
                funFactElement.style.opacity = '1';
            }, 500);
        }, 30000);
    }
}

function showPredictionResult(result) {
    const resultDiv = document.getElementById('predictionResult');
    const resultText = document.getElementById('resultText');
    const probabilityText = document.getElementById('probabilityText');
    const resultIcon = document.getElementById('resultIcon');
    resultDiv.classList.remove('d-none', 'alert-danger');
    resultDiv.classList.add('alert-success');
    resultDiv.querySelector('.alert').style.animation = 'popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
    const prediction = result.prediction === 1 ? 'Autism' : 'Non-Autism';
    const probability = (result.probability * 100).toFixed(2);
    resultText.textContent = `Prediction: ${prediction}`;
    probabilityText.textContent = `Confidence: ${probability}%`;
    // Animated icon
    if (result.prediction === 1) {
        resultIcon.innerHTML = '<i class="bi bi-emoji-smile text-warning"></i>';
    } else {
        resultIcon.innerHTML = '<i class="bi bi-emoji-sunglasses text-success"></i>';
    }
}

function showError(message) {
    const resultDiv = document.getElementById('predictionResult');
    const resultText = document.getElementById('resultText');
    const probabilityText = document.getElementById('probabilityText');
    resultDiv.classList.remove('d-none', 'alert-success');
    resultDiv.classList.add('alert-danger');
    resultText.textContent = 'Error';
    probabilityText.textContent = message;
    // Animate the error
    resultDiv.classList.add('animate__animated', 'animate__shakeX');
}

function shareResult() {
    const resultText = document.getElementById('resultText').textContent;
    const probabilityText = document.getElementById('probabilityText').textContent;
    const text = `${resultText}\n${probabilityText}\nTry it yourself: http://127.0.0.1:5000/`;
    navigator.clipboard.writeText(text).then(() => {
        alert('Result copied to clipboard!');
    });
} 