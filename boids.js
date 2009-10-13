
// these are the beached boids

// init
int width = 1024;
int height = 600;
int fps = 25;
int clickedX = width/2;
int clickedY = height/2;

// boid design
int radius = 8;
int arrow_len = 20;
int arrow_width = 6;

// boids settings
int n = 20; // number of boids
int vlim = 10; // speed limit
int distance = 30; // distance to keep from other boids
int place_force = 500; // how strong boids are attracted (lower is higher)
int center_force = 200; // how strong boids steer to the center of the flock
int velo_force = 8; // how strong boids match the flock velocity ( 8 = 12.5% per frame)

class Vector {
    float x;
    float y;

    Vector() {
	x = 0;
	y = 0;
    }

    Vector(float xpos, float ypos) {
	x = xpos;
	y = ypos;
    }

    Vector add(Vector v) {
	return new Vector(x + v.x, y + v.y);
    }
    Vector sub(Vector v) {
	return new Vector(x - v.x, y - v.y);
    }
    Vector multi(Vector v) {
	return new Vector(x * v.x, y * v.y);
    }
    Vector div(Vector v) {
	return new Vector(x / v.x, y / v.y);
    }
    float heading2D() {
	float angle = (float) Math.atan2(-y, x);
	return -1*angle;
    }
    float mag() {
	return sqrt(x*x + y*y); 
    }
}

class Boid {
    Vector position = new Vector();
    Vector velocity = new Vector();

    Boid() {
	position.x = random(width);
	position.y = random(height);
	velocity.x = random(1,4);
	velocity.y = random(1,4);
    }
}

// data
Boid[] boids = new Boid[n];

void setup() {
    size(width,height);
    frameRate(fps);
    smooth();
    // generate Boids
    for (int i=0; i<n; i++) {
	Boid b = new Boid();
	boids[i] = b;
    }

}

// Boids try to fly towards the centre of mass of neighbouring boids. 
Vector rule1(int b) {
    Vector v = new Vector();
    for (int i=0; i<n; i++) {
	if (i != b) {
	    v = v.add(boids[i].position);
	}
    }
    v.x = v.x / (n-1);
    v.y = v.y / (n-1);
    v = v.sub(boids[b].position);
    v.x = v.x / center_force;
    v.y = v.y / center_force;
    return v;
}

// Boids try to keep a small distance away from other objects (including other boids)
Vector rule2(int b) {
    Vector v = new Vector(0,0);
    for (int i=0; i<n; i++) {
	if (i != b) {
	    Vector temp = boids[i].position.sub(boids[b].position);
	    if (temp.mag() < distance) {
		Vector diff = boids[i].position.sub(boids[b].position);
		v = v.sub(diff);
	    }
	}
    }
    v.x = v.x / 8;
    v.y = v.y / 8;    		
    return v;
}

// Boids try to match velocity with near boids. 
Vector rule3(int b) {
    Vector v = new Vector();
    for (int i=0; i<n; i++) {
	if (i != b) v = v.add(boids[i].velocity);
    }
    v.x = v.x / (n-1);
    v.y = v.y / (n-1);
    v = v.sub(boids[b].velocity);
    v.x = v.x / velo_force;
    v.y = v.y / velo_force;
    return v;
}

// stay roughly inside the screen
Vector bound_position(int b) {
    int xmin = -150;
    int xmax = width+150;
    int ymin = -150;
    int ymax = height+150;
    Vector v = new Vector();
    if (boids[b].position.x < xmin) v.x = 10;
    if (boids[b].position.x > xmax) v.x = -10;
    if (boids[b].position.y < ymin) v.y = 10;
    if (boids[b].position.y > ymax) v.y = -10;

    return v;
}

// speed limit
void limit_velocity(int b) {
    if (boids[b].velocity.mag() > vlim) {
	boids[b].velocity.x = (boids[b].velocity.x / boids[b].velocity.mag()) * vlim;
	boids[b].velocity.y = (boids[b].velocity.y / boids[b].velocity.mag()) * vlim;
    }
}

// steer roughly towards this place
Vector tend_to_place(int b) {
    Vector v = new Vector(clickedX,clickedY);

    v = v.sub(boids[b].position);
    v.x = v.x / place_force;
    v.y = v.y / place_force;
    return v;
}

void move_boids() {
    Vector v1 = new Vector();
    Vector v2 = new Vector();
    Vector v3 = new Vector();
    Vector vbound = new Vector();
    Vector vplace = new Vector();
    Vector rboost =  new Vector();

    for (int i=0; i<n; i++) {
	v1 = rule1(i);
	v2 = rule2(i);
	v3 = rule3(i);
	vbound = bound_position(i);
	vplace = tend_to_place(i);
	
	boids[i].velocity = boids[i].velocity.add(v1);
	boids[i].velocity = boids[i].velocity.add(v2);
	boids[i].velocity = boids[i].velocity.add(v3);
	boids[i].velocity = boids[i].velocity.add(vbound);
	boids[i].velocity = boids[i].velocity.add(vplace);
	limit_velocity(i);
	boids[i].position = boids[i].position.add(boids[i].velocity);
    }
}

void draw() {
    background(50);

    
    // boids
    stroke(255,150,0);
    fill(255,255,0);
    for (int i=0; i<n; i++) {
	pushMatrix();
	translate(boids[i].position.x, boids[i].position.y);
	rotate(boids[i].velocity.heading2D());
	triangle(arrow_len,0, 0,arrow_width, 0,-1*arrow_width);
	// andere vis
	//line(0,0,15,0); // mitte
	//line(20,0,0,6); 
	//line(20,0,0,-6);
	//line(0,-6, 0,6);
	//andere vis
	//ellipse(xpos, ypos, radius, radius);
	popMatrix();
    }

    // pointer circle
    stroke(0,0,0,50);
    fill(255,255,255);
    arc(clickedX, clickedY, 15,15, 0,2*PI);
    move_boids();
}

void mousePressed() {
    clickedX = mouseX;
    clickedY = mouseY;
}

void keyPressed() {
  if (key == 'a') {
      exit();
  }
}

