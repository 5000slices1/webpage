
document.addEventListener('DOMContentLoaded', function() {
  var listItems = document.querySelectorAll('.news li');

  listItems.forEach(function(item) {
    var date = new Date().toLocaleDateString();
    var dateElement = document.createElement('span');
    dateElement.classList.add('date');
    dateElement.textContent = ' (' + date + ')';
    item.appendChild(dateElement);
  });
});
