// This script ensures the statistics are displayed correctly
document.addEventListener('DOMContentLoaded', function() {
    // Add fallback values for statistics
    const defaultStats = {
        total_cases: 704,
        autism_cases: 209,
        non_autism_cases: 495
    };

    // Try to fetch stats from the server
    fetch('/get_stats')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update statistics with real data
            updateStatistics(data);
        })
        .catch(error => {
            console.error('Error loading statistics:', error);
            // Use default values if there's an error
            updateStatistics(defaultStats);
        });

    // Set fun fact
    updateFunFact();
});

// Function to update statistics
function updateStatistics(data) {
    // Update the main statistics counters
    const totalCasesElement = document.getElementById('totalCases');
    const autismCasesElement = document.getElementById('autismCases');
    const nonAutismCasesElement = document.getElementById('nonAutismCases');
    
    if (totalCasesElement) totalCasesElement.textContent = data.total_cases;
    if (autismCasesElement) autismCasesElement.textContent = data.autism_cases;
    if (nonAutismCasesElement) nonAutismCasesElement.textContent = data.non_autism_cases;
}

// Function to update fun fact
function updateFunFact() {
    const funFacts = [
        "Autism affects about 1 in 54 children in the United States.",
        "Autism is more common in boys than girls, with a ratio of about 4:1.",
        "Early intervention can significantly improve outcomes for children with autism.",
        "Autism is a spectrum disorder, meaning symptoms can vary widely between individuals.",
        "Many people with autism have exceptional abilities in areas like music, math, or art.",
        "The term 'autism' was first used by psychiatrist Eugen Bleuler in 1911.",
        "April is World Autism Awareness Month.",
        "About 40% of individuals with autism have above-average intelligence.",
        "Temple Grandin, a professor with autism, revolutionized animal welfare in the livestock industry."
    ];
    
    const funFactElement = document.getElementById('funFact');
    if (funFactElement) {
        funFactElement.textContent = funFacts[Math.floor(Math.random() * funFacts.length)];
    }
}
