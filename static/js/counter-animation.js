document.addEventListener('DOMContentLoaded', function() {
    // Initialize counters
    const totalCasesCounter = new CountUp('totalCases', 0, 704, 0, 2.5, {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.'
    });

    const autismCasesCounter = new CountUp('autismCases', 0, 209, 0, 2.5, {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.'
    });

    const nonAutismCasesCounter = new CountUp('nonAutismCases', 0, 495, 0, 2.5, {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.'
    });

    // Function to start all counters
    function startCounters() {
        totalCasesCounter.start();
        autismCasesCounter.start();
        nonAutismCasesCounter.start();
    }

    // Start counters when page loads
    startCounters();

    // Helper to extract numbers from gender string like "F: 270, M: 530"
    function parseGenderDist(genderString) {
        const matchF = genderString.match(/F:\s*(\d+)/i);
        const matchM = genderString.match(/M:\s*(\d+)/i);
        return {
            F: matchF ? parseInt(matchF[1], 10) : 0,
            M: matchM ? parseInt(matchM[1], 10) : 0
        };
    }

    // Animate summary section
    function animateSummary(stats) {
        // Total Cases
        new CountUp('summaryTotalCases', 0, stats.total_cases, 0, 2.5, {useEasing:true,useGrouping:true,separator:',',decimal:'.'}).start();
        // Autism Cases
        new CountUp('summaryAutismCases', 0, stats.autism_cases, 0, 2.5, {useEasing:true,useGrouping:true,separator:',',decimal:'.'}).start();
        // Non-Autism Cases
        new CountUp('summaryNonAutismCases', 0, stats.non_autism_cases, 0, 2.5, {useEasing:true,useGrouping:true,separator:',',decimal:'.'}).start();
        // Average Age
        if (stats.age_statistics && stats.age_statistics.mean) {
            new CountUp('summaryAvgAge', 0, Number(stats.age_statistics.mean), 1, 2.5, {useEasing:true,useGrouping:true,separator:',',decimal:'.'}).start();
        }
        // Gender Distribution (F and M)
        let g = stats.gender_distribution;
        if (g && typeof g === 'object') {
            // Animate F and M if possible
            const genderText = `F: <span id='genderF'>0</span>, M: <span id='genderM'>0</span>`;
            document.getElementById('summaryGenderDist').innerHTML = genderText;
            new CountUp('genderF', 0, g.f || g.F || 0, 0, 2.5, {useEasing:true,useGrouping:true,separator:',',decimal:'.'}).start();
            new CountUp('genderM', 0, g.m || g.M || 0, 0, 2.5, {useEasing:true,useGrouping:true,separator:',',decimal:'.'}).start();
        }
    }

    // Update counters when stats are fetched
    fetch('/get_stats')
        .then(response => response.json())
        .then(stats => {
            if (stats.total_cases > 0) {
                // Update the target values
                totalCasesCounter.update(stats.total_cases);
                autismCasesCounter.update(stats.autism_cases);
                nonAutismCasesCounter.update(stats.non_autism_cases);
                // Restart the counters with new values
                startCounters();
                // Animate summary section
                animateSummary(stats);
            }
        })
        .catch(error => console.log('Using default statistics values'));
}); 