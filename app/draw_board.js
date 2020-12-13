//code adapted from https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element
function drawBoard() {
  let elem = document.getElementById('board'),
      elemLeft = elem.offsetLeft + elem.clientLeft,
      elemTop = elem.offsetTop + elem.clientTop,
      context = elem.getContext('2d'),
      elements = [];
  console.log(elem);

  elem.addEventListener('click', function(event) {
    let x = event.pageX - elemLeft,
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
  for(let i = 0; i != 64; ++i) {
    const col = i%8;
    const row = Math.floor(i / 8);

    let color = "#636363"
    if (col % 2 == 0 && row % 2 == 0) {
      color = "#c26d6d";
    }
    if(col % 2 == 1 && row % 2 == 1) {
      color = "#c26d6d";
    }
    elements.push({
      id: i,
      colour: color,
      width: 100,
      height: 100,
      top: row * 100,
      left: col * 100
    });
  }

// Render elements.
  elements.forEach(function(element) {

    context.fillStyle = element.colour;
    context.fillRect(element.left, element.top, element.width, element.height);

    if (((element.left/100) % 2 != 0 && (element.top/100) % 2 == 0)
        || ((element.left/100) % 2 != 1 && (element.top/100) % 2 == 1)) {
      let img = new Image();
      img.onload = function () {
        context.drawImage(img, element.left, element.top);
      }
      if (element.id <= 23) {
        img.src = 'black_piece.png';
      } else if (element.id >= 40) {
        img.src = 'red_piece.png';
      }
    }
  });
}

function drawPiece(context) {
  let img = new Image();
  img.onload = function() {
    context.drawImage(img, 0, 0);
  }
  img.src = 'black_piece.png';
}