// Dropdown menu JS

document.addEventListener('DOMContentLoaded', function() {
  var dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(function(dropdown) {
    var button = dropdown.querySelector('.dropbtn');
    var content = dropdown.querySelector('.dropdown-content');
    if (button && content) {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        // Close other dropdowns
        document.querySelectorAll('.dropdown-content.show').forEach(function(openContent) {
          if (openContent !== content) {
            openContent.classList.remove('show');
            if (openContent.parentElement.classList.contains('dropdown')) {
              openContent.parentElement.classList.remove('open');
            }
          }
        });
        // Toggle this dropdown
        content.classList.toggle('show');
        dropdown.classList.toggle('open', content.classList.contains('show'));
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function() {
    document.querySelectorAll('.dropdown-content.show').forEach(function(content) {
      content.classList.remove('show');
      if (content.parentElement.classList.contains('dropdown')) {
        content.parentElement.classList.remove('open');
      }
    });
  });
});
