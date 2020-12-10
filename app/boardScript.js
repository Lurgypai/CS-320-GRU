//code adapted from https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element
var elem = document.getElementById('board'),
    elemLeft = elem.offsetLeft + elem.clientLeft,
    elemTop = elem.offsetTop + elem.clientTop,
    context = elem.getContext('2d'),
    elements = [];
console.log(elem);

// Add event listener for `click` events.
elem.addEventListener('click', function(event) {
  var x = event.pageX - elemLeft,
      y = event.pageY - elemTop;

  // Collision detection between clicked offset and element.
  elements.forEach(function(element) {
    if (y > element.top && y < element.top + element.height
        && x > element.left && x < element.left + element.width) {
      console.log("clicked element: " + element.id);
    }
  });

}, false);

// Add element.
for(var i = 0; i != 64; ++i) {
  var col = i%8;
  var row = Math.floor(i / 8);

  var color = "#c26d6d"
  if(col % 2 == 0 && row % 2 == 0) {
    color = "#636363";
  }
  if(col % 2 == 1 && row % 2 == 1) {
    color = "#636363";
  }
  elements.push({
    id: i,
    colour: color,
    width: 20,
    height: 20,
    top: row * 20,
    left: col * 20
  });
}

// Render elements.
elements.forEach(function(element) {
  context.fillStyle = element.colour;
  context.fillRect(element.left, element.top, element.width, element.height);
});
