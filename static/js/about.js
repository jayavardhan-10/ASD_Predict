// Animated numbers for About page
window.addEventListener('DOMContentLoaded', function() {
    new CountUp('aboutStat1', 100, {duration: 2}).start();
    new CountUp('aboutStat2', 100, {duration: 2}).start();
    new CountUp('aboutStat3', 100, {duration: 2}).start();
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}); 