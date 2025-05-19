document.getElementById('open-biblio').onclick = function(e) {
    e.stopPropagation();
    document.getElementById('biblio-popup').style.display = 'block';
};
document.getElementById('close-biblio').onclick = function(e) {
    e.stopPropagation();
    document.getElementById('biblio-popup').style.display = 'none';
};
// Optional: Close bibliography popup if user clicks outside it
window.addEventListener('click', function(e) {
    const popup = document.getElementById('biblio-popup');
    if (popup.style.display === 'block' && !popup.contains(e.target) && e.target.id !== 'open-biblio') {
        popup.style.display = 'none';
    }
});