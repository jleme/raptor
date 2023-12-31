/*
THE GAME
I'm creating a production-level software project based on the classic game 'Penetrator' in JavaScript. This game is intended for real-world use and should be playable in a modern web browser, adhering to the professional software development standards.

It's a side-scrolling shooter where player's ship flies through a big cavern with enemy bases. There are enemies both on the ground and in the air, and the player's ship can drop bombs and shoot forwards. The game also features a fuel mechanic, where the player must destroy fuel tanks to replenish their own supply.

The game is not finished yet. It's currently being developed. So far we have:
- Ship flying
- Terrain being generated and scrolled horizontaly

THE TERRAIN - requirements
The terrain is a very big cavern. The cavern have a ceiling and a floor. The ships flies in the big space between the ceiling and the floor. We need to generate the ceiling and the floor. They are separated entities. I guess we need to have different generation code for both. 

The ceiling should be more stable with less irregularities. the ceiling must have some parts with smaller heights and some stalactites. It shouldn't be flat at all but most of the ceiling should have a regular height. It should resemble a cavern ceiling. It should have an organic shape.

The floor should be more irregular, with many different landforms types and heights like hills, plateaus, flatlands, mountains, lakes, gullies, canyons, fjord. Hills and flatlands should be the most common landform. The others should me more rare. All the surface must be organic, not flat at all.

There must always be enough space for the ship to pass between the floor and the ceiling, at least twice the height of the ship.

CHATGPT ACT
You must act as an experienced and highly skilled software engineer specializing in front-end development with javascript. You program as a master and your software design and code must follows the best programming practices and SOLID principles. You MUST follow strictly all SOLID principle ALL the time, in every code that you write.

CHATGPT HIGH QUALITY CODE GENERATED
The code generated should be robust, efficient, maintainable, and should adhere to the best practices of JavaScript game development. It should handle possible errors gracefully and be optimized for performance. Security measures, while not a primary concern for this single-player game, should still be considered, particularly in areas like data storage and user input.

Do not create simple, basic or example code, I need the full code. Generate production-level-quality code. 

TODO:
- speed increases when key keeps pressed, so slight pressing have less speed and long pressing have more speed.
- ship flames change based on acceleration or deceleration 
- maybe easing when stop moving ship, very lightly
- collision detection for the ship, weapons, enemies and their weapons
- ship explodes if hits terrain
- some planicies and planaltos
- ceiling with stalactites
- enemies rockets going up (with collision detection)
- enemies towers shooting bullets (with collision detections)

- new weapon: drop bombs
- score for killing enemies
- maybe some gravity keeps the ship going to floor

FUTURE
- weapons cause terrain damage and open more space
- new challenge: space open to fly may be blocked by terrain. The terrain must be destroyd to open enough space to fly
- enemies located in the ceiling, dropping bombs or shooting (for this the ship must have a weapon that can shoot upwards)
- Changes over time:
   - weapons get stronger when user gets more points
   - enemies get stronger as the time passes: they need to get more bullets/bombs to be destroyed, weapons shoot with more frequency,...
   - scroll speeds increase overtime
   - cave gets narrower or more difficult overtime
- enemies are destroyed if terrain where they are is destroyd
- more terrain landforms
- sound
- ship flames animation
- cave background


*/


// Ship constants
const SHI_START_X = 50; // Bottom left of the rectangle
const SHI_START_Y= 300; // Bottom left of the rectangle
const SHI_WIDTH = 50;
const SHI_HEIGHT = 15;
const SHI_SPEED = 5;
const SHI_NOSE_LENGHT = 15;
const SHI_STABILIZER_HEIGHT = SHI_WIDTH / 4;
const SHI_STABILIZER_WIDTH = SHI_WIDTH / 4;
const SHI_BOUNDARY_RIGHT = 100;
const SHI_BOUNDARY_TOP = 20;
const FLAME_WIDTH = 40;
const FLAME_HEIGHT = 19;

// Bullets constants
const BUL_SPEED = 7.5;
const BUL_RATE = 100;  // The minimum time interval between bullets (in milliseconds)
const BUL_WIDTH = 10;
const BUL_HEIGHT = 2;

// Terrain constants
const TER_SCROLL_SPEED = 2; // Adjust this to set the scrolling speed
const TER_SECTION_SEGMENTS_QTD = 100;  // number of segments of a terrain section
const TER_BUFFER_SIZE = 3;  // Extra segments for off-screen
const HILL_HEIGHT_MIN_RATIO = 0.05; // Mininum hill height
const HILL_HEIGHT_MAX_RATIO = 0.6; // Maximum hill height
const NEW_HILL_RATE = 0.05 // Rate of new hills created


// Keyboard constants
const KEY_SPACE = 32;;
const KEY_ESC = 27;
const KEY_ARROW_UP = 38;
const KEY_ARROW_DOWN = 40;
const KEY_ARROW_LEFT = 37;
const KEY_ARROW_RIGHT = 39;
const KEY_W = 87;
const KEY_S = 83;
const KEY_A = 65;
const KEY_D = 68;


// Set up the canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


class Ship {
  constructor() {
    this.x = SHI_START_X;
    this.y = SHI_START_Y;
    this.dx = 0; // Horizontal speed
    this.dy = 0; // Vertical speed
    this.movingUp = false;
    this.movingDown = false;
    this.movingRight = false;
    this.movingLeft = false;
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y); // body bottom left
    ctx.lineTo(this.x + SHI_WIDTH + SHI_NOSE_LENGHT, this.y); // nose bottom right
    ctx.lineTo(this.x + SHI_WIDTH, this.y - SHI_HEIGHT); // top nose
    ctx.lineTo(this.x + SHI_STABILIZER_WIDTH, this.y - SHI_HEIGHT); // botton right stabilizer
    ctx.lineTo(this.x, this.y - SHI_HEIGHT - SHI_STABILIZER_HEIGHT); // top stabilizer
    ctx.closePath();

    ctx.fillStyle = 'rgb(70,130,180)';
    ctx.fill();
    this.drawFlame();
  }

  drawFlame() {
    let flame_xi = this.x - FLAME_WIDTH;
    let flame_xm = flame_xi + ((FLAME_WIDTH/3)*2);
    let flame_xf = flame_xi + FLAME_WIDTH;
    let flame_yi = this.y - (SHI_HEIGHT / 2);
    let flame_yt = flame_yi - (FLAME_HEIGHT/2);
    let flame_yb = flame_yi + (FLAME_HEIGHT/2);
  
    const grd = ctx.createLinearGradient(flame_xi,flame_yi,flame_xf,flame_yi);
    grd.addColorStop(0,"darkred");
    grd.addColorStop(0.2,"red");
    grd.addColorStop(0.4,"orange");
    grd.addColorStop(0.7,"yellow");
    grd.addColorStop(0.95,"white");
    
    // Fill with gradient
    ctx.beginPath()
    ctx.fillStyle = grd;
    ctx.moveTo(flame_xi, flame_yi);
    ctx.lineTo(flame_xm, flame_yt);
    ctx.lineTo(flame_xf, flame_yt);
    ctx.lineTo(flame_xf, flame_yb);
    ctx.lineTo(flame_xm, flame_yb);
    ctx.lineTo(flame_xi, flame_yi);
    ctx.closePath();
    ctx.fill();
   }

  shoot() {
    bullets.create(this.x + SHI_WIDTH + SHI_NOSE_LENGHT - 8, this.y - 1);
   }

  moveUp() {
    this.dy = -SHI_SPEED;
  }
  
  moveDown() {
    this.dy = SHI_SPEED;
  }
  
  moveLeft() {
    this.dx = -SHI_SPEED;
  }
  
  moveRight() {
    this.dx = SHI_SPEED;
  }

  update() {
    this.y += this.dy;
    this.x += this.dx;
  
    // Horizontal boundary checks
    if (this.x < SHI_START_X){
      this.x = SHI_START_X;
    }
    if (this.x + SHI_WIDTH > canvas.width - SHI_BOUNDARY_RIGHT){
      this.x = canvas.width - SHI_WIDTH - SHI_BOUNDARY_RIGHT;
    }
  
    // Vertical boundary checks
    if (this.y < SHI_HEIGHT + SHI_BOUNDARY_TOP){
      this.y = SHI_HEIGHT + SHI_BOUNDARY_TOP;
    }
    if (this.y + SHI_HEIGHT > canvas.height){
      this.y = canvas.height - SHI_HEIGHT;
    }
  }

  getPerimeterVertices() {
    return [
      {x: this.x, y: this.y}, // Bottom left
      {x: this.x + SHI_WIDTH + SHI_NOSE_LENGHT, y: this.y}, // Bottom right
      {x: this.x + SHI_WIDTH, y: this.y - SHI_HEIGHT}, // top nose
      {x: this.x + SHI_STABILIZER_WIDTH, y: this.y - SHI_HEIGHT}, //botton right stabilizer
      {x: this.x, y: this.y - SHI_HEIGHT - SHI_STABILIZER_HEIGHT}, //top stabilizer
      {x: this.x, y: this.y} // Bottom left
    ];
  }

  isColliding(terrain) {
    const perimeterVertices = this.getPerimeterVertices();

    // Checking collision with the floor
    let terrainVertices = terrain.floor.getRelevantVertices(this);
    if (checkVerticesIntersection(perimeterVertices, terrainVertices)) return true;

    // Checking collision with the ceiling
    terrainVertices = terrain.ceiling.getRelevantVertices(this);
    if (checkVerticesIntersection(perimeterVertices, terrainVertices)) return true;

    return false; // No collision
  }

}

class Bullets {
  constructor() {
    this.bullets = [];
    this.lastBulletTime = 0;  // The time when the last bullet was fired

  }

  create(x, y) {
    // Check if enough time has passed since the last bullet was fired
    if (Date.now() - this.lastBulletTime >= BUL_RATE) {
      let bullet = {x: x, y: y, width: BUL_WIDTH, height: BUL_HEIGHT};
      this.bullets.push(bullet);
      this.lastBulletTime = Date.now();  // Update the last bullet time
    }
  }

  draw() {
    for (let i = 0; i < this.bullets.length; i++) {
      let bullet = this.bullets[i];
      ctx.fillStyle = 'rgb(255,0,0)';
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

   update() {
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].x += BUL_SPEED;

      // Remove the bullet if it's off screen
      if (this.bullets[i].x > canvas.width) {
        this.bullets.splice(i, 1);
        i--;  // Adjust index after removal
      }
    }
  }

}

class TerrainSection {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.sectionSegments = [];
    this.segmentWidth = this.width / TER_SECTION_SEGMENTS_QTD;
    this.xOffset = 0;
    this.xPosition = 0; // horizontal position of the terrain
    this.init();
  }

  init() {
    this.generateInitialTerrain();
  }

  generateNoise() {
    return (Math.random() * 2 - 1)/10;
  }

  newSegmentHeight() {
    const { heightFactor, roughnessFactor } = this.getSegmentParameters();
    const noise = this.generateNoise();
    return this.height * ((heightFactor / 2) + (noise / roughnessFactor));
  }

  generateInitialTerrain() {
  for (let i = 0; i < TER_SECTION_SEGMENTS_QTD + TER_BUFFER_SIZE; i++) {
    this.sectionSegments.push({
      x: i * this.segmentWidth, 
      y: this.newSegmentHeight()});
    }
  }

getRelevantVertices(ship) {
  const minY = ship.y - SHI_HEIGHT - SHI_STABILIZER_HEIGHT;
  const maxY = ship.y;
  const minX = ship.x - SHI_NOSE_LENGHT;  // extended x-range
  const maxX = ship.x + SHI_WIDTH + SHI_NOSE_LENGHT;  // extended x-range

  const indices = this.sectionSegments
    // Start by reducing the sectionSegments array to an array of indices
    // We only want the indices of vertices within the ship's x-range
    .reduce((acc, vertex, i) => {
      if (vertex.x >= minX && vertex.x <= maxX) {
        acc.push(i);
      }
      return acc;
    }, [])
    // Now we have an array of indices where the corresponding vertices are within the ship's x-range
    // Next we want to filter out any segments where both vertices are outside the ship's y-range
    .filter(i => {
      let currentVertex = this.sectionSegments[i];
      let nextVertex = this.sectionSegments[i + 1];
  
      if (currentVertex && nextVertex) {
        if ((currentVertex.y < minY && nextVertex.y < minY) || (currentVertex.y > maxY && nextVertex.y > maxY)) {
          return false;
        }
      }
      return true;
    });

    if (indices.length === 0) {
      return [];
    }
  
  let start = indices[0] > 0 ? indices[0] - 1 : 0;
  let end = indices[indices.length - 1] < this.sectionSegments.length - 1 ? indices[indices.length - 1] + 1 : indices[indices.length - 1];
  
  return this.sectionSegments.slice(start, end + 1);
}

  update() {
    for (let i = 0; i < this.sectionSegments.length; i++) {
      this.sectionSegments[i].x -= TER_SCROLL_SPEED;
    }
  
    if (this.sectionSegments[1].x <= 0) {
      this.sectionSegments.shift(); // Remove the first segment
      const lastSegment = this.sectionSegments[this.sectionSegments.length - 1];
      this.sectionSegments.push({
        x: lastSegment.x + this.segmentWidth, 
        y: this.newSegmentHeight()
      });  // push new segment onto end of array
    }
  }

  draw() {
    const { yBoundary, color } = this.getDrawingParameters();
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(this.sectionSegments[0].x, this.sectionSegments[0].y);
  
    for (let i = 1; i < this.sectionSegments.length; i++) {
      this.ctx.lineTo(this.sectionSegments[i].x, this.sectionSegments[i].y);
    }
    const lastX = this.sectionSegments[this.sectionSegments.length - 1].x;
    this.ctx.lineTo(lastX, yBoundary);
    this.ctx.lineTo(0, yBoundary);
    this.ctx.closePath();
    this.ctx.fill();
  }

  getSegmentParameters() {
    throw new Error('getSegmentParameters() must be implemented in the child class.');
  }

  getDrawingParameters() {
    throw new Error('getDrawingParameters() must be implemented in the child class.');
  }

}


class Ceiling extends TerrainSection {
  getSegmentParameters() {
    return { heightFactor: 0.2, roughnessFactor: 16 };
  }
  getDrawingParameters() {
    return { yBoundary: 0, color: 'rgb(80, 63, 39)' };
  }
}


class Floor extends TerrainSection {
  constructor(ctx, canvas) {
    super(ctx, canvas);
  }

  init() {
    this.hillStep = 0; 
    this.hillHeight = 0;
    this.generateHills = false; // Initial terrain should have no hills
    super.init();
  }

  getSegmentParameters() {
    return { heightFactor: 1.6, roughnessFactor: 4 };
  }
  getDrawingParameters() {
    return { yBoundary: this.height, color: 'rgb(133, 81, 53)' };
  }

  // function to control the hill creation
  generateHill() {
    // If hillStep is 0, we're not currently generating a hill.
    if (this.hillStep === 0) {
      return 0;
    }

    // If hillStep is between 1 and 20, we're generating the uphill slope
    if (this.hillStep <= 20) {
      this.hillStep++;
      return this.hillHeight * (this.hillStep / 20);
    }

    // If hillStep is between 21 and 40, we're generating the downhill slope
    if (this.hillStep <= 40) {
      this.hillStep++;
      return this.hillHeight * ((40 - this.hillStep) / 20);
    }

    // If hillStep is above 40, we've finished generating the hill
    this.hillStep = 0;
    return 0;
}

  generateInitialTerrain() {
    super.generateInitialTerrain();
    this.generateHills = true; // Now that we have generated the initial terrain we can have hills
  }

  newSegmentHeight() {
    // decide whether to generate a hill or not
    if (this.generateHills && ((this.hillStep === 0) && (Math.random() < NEW_HILL_RATE))) {  
      this.hillStep = 1; // Start hill generation
      this.hillHeight = this.height * ((Math.random() * (HILL_HEIGHT_MAX_RATIO - HILL_HEIGHT_MIN_RATIO)) + HILL_HEIGHT_MIN_RATIO);
    }
    let segmentHeight = super.newSegmentHeight();
    segmentHeight -= this.generateHill();
    return segmentHeight;
  }
}


class Terrain {
  constructor(ctx, canvas) {
    this.ceiling = new Ceiling(ctx, canvas);
    this.floor = new Floor(ctx, canvas);
  }

  update() {
    this.ceiling.update();
    this.floor.update();
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ceiling.draw();
    this.floor.draw();
  }
}


// Add an event listeners for keyboard input
let keys = {};

window.addEventListener('keydown', function (e) {
  keys[e.keyCode] = true;
});

window.addEventListener('keyup', function (e) {  //to stop the ship movement when key up
  keys[e.keyCode] = false;

  switch(e.keyCode) {  
    case KEY_ARROW_UP:
    case KEY_W:
    case KEY_ARROW_DOWN:
    case KEY_S:
      ship.dy = 0;
      break;

    case KEY_ARROW_LEFT:
    case KEY_A:
    case KEY_ARROW_RIGHT:
    case KEY_D:
      ship.dx = 0;
      break;
  }
});

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denominator = ((x2 - x1) * (y4 - y3)) - ((y2 - y1) * (x4 - x3));
  if (denominator === 0) return false; // lines are parallel and won't intersect

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false; // lines are not intersecting within the line segments
  } else {
    return true; // lines are intersecting within the line segments
  }
}

function checkVerticesIntersection(vertices1, vertices2) {
  for (let i = 0; i < vertices1.length - 1; i++) {
    for (let j = 0; j < vertices2.length - 1; j++) {
      if (lineIntersect(
          vertices1[i].x, vertices1[i].y,
          vertices1[i + 1].x, vertices1[i + 1].y,
          vertices2[j].x, vertices2[j].y,
          vertices2[j + 1].x, vertices2[j + 1].y)) {
        return true;
      }
    }
  }
  return false;
}

function gameLoop() {

  if (keys[KEY_ESC]) {
    return;
  }
  if (keys[KEY_ARROW_UP] || keys[KEY_W]) {
    ship.moveUp();
  }
  if (keys[KEY_ARROW_DOWN] || keys[KEY_S]) {
    ship.moveDown();
  }
  if (keys[KEY_ARROW_LEFT] || keys[KEY_A]) {
    ship.moveLeft();
  }
  if (keys[KEY_ARROW_RIGHT] || keys[KEY_D]) {
    ship.moveRight();
  }
  if (keys[KEY_SPACE]) { 
    ship.shoot();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  terrain.update();
  terrain.draw();

  ship.update();
  ship.draw();

  if (ship.isColliding(terrain)) {
    return;
  }

  bullets.update();
  bullets.draw();

  animationId = requestAnimationFrame(gameLoop);
  
}


const ship = new Ship();
const bullets = new Bullets();
const terrain = new Terrain(ctx, canvas);
let animationId;
gameLoop();