var context = document.getElementById('view').getContext('2d');
var timeout;
var timeoutvalue=100;
var fadertimeout=1;
var winthreshold;
var L=40;
var AREA_WIDTH = 641;
var AREA_HEIGHT = 401;
var X=Math.floor(AREA_WIDTH/L);
var Y=Math.floor(AREA_HEIGHT/L);
var black="rgb(0,0,0)";
var green="rgb(0,128,0)";
var white="rgb(255,255,255)";
var grey="rgb(224,224,224)";
var fadecolor;
var gameover;
var points;
var delta;
var powerup;
var protagonist=new Array();
var colortable=new Array();

init_tables();
init_all();
clear(black);
printinfo();

// initialize keyboard handler
document.onkeydown = function(event) {
    // explorer uses this
    if(window.event) {
        key = window.event.keyCode;
    }
    // firefox uses this
    else{
        key = event.which;
    }
    keyboard_handler(key);
}

document.onmousedown = function(event) {
    keyboard_handler(0);
}

function mainloop() {
    moveprotagonist();
    if (!gameover && collisiondetection()) {
        clear(black);
        printgrid();
        printprotagonist();
        printpowerup();
        if (updatescore(0)) {
            timeout = setTimeout("mainloop()",timeoutvalue);
        }
    }
}

function doodad(ax,ay) {
    this.x = ax;
    this.y = ay;
}

function newpowerup(newhead) {
    var removed=0;
    var freespaces = new Array();
    // initialize array
    for(i=0;i<X*Y;i++) {
        freespaces[i] = new doodad(i%X,Math.floor(i/X));
    }
    for(i=0;i<protagonist.length;i++) {
        freespaces[protagonist[i].y*X+protagonist[i].x] = null;
    }
    freespaces[newhead.y*X+newhead.x] = null;
    for(i=0;i<freespaces.length;i++) {
        if (freespaces[i]==null) {
            freespaces.splice(i,1);
            // An element was removed. Backtrack by one.
            i--;
            removed++;
        }
    }
    powerup=freespaces[Math.floor(Math.random()*(freespaces.length-1))];
}

function moveprotagonist() {
    var i;
    head = new doodad(protagonist[0].x, protagonist[0].y);
    newhead = new doodad(head.x + delta.x, head.y + delta.y);
    if (newhead.x == powerup.x && newhead.y == powerup.y) {
        // Score!
        updatescore(1);
        tail = new doodad(protagonist[protagonist.length-1].x, protagonist[protagonist.length-1].y);
        protagonist.push(tail);
        newpowerup(newhead);
    }
    for (i=protagonist.length-1;i>0;i--) {
        protagonist[i] = protagonist[i-1];
    }
    protagonist[0] = newhead;
}

function printprotagonist() {
    var i;
    for (i=0; i<protagonist.length;i++) {
        color=colortable[i]; // omg optimized lookup
        turn_on_special(protagonist[i].x, protagonist[i].y,color);
    }
}

function printpowerup() {
    turn_on_special(powerup.x,powerup.y,green);
}

// Clears the screen
function clear(color) {
    context.fillStyle = color;
    context.fillRect(0, 0, AREA_WIDTH, AREA_WIDTH);
}

function set_fill(x) {
    context.fillStyle = x;
}

function printgrid() {
    // Borders
    set_fill(black);
    context.fillRect(0, 0, AREA_WIDTH, AREA_HEIGHT);
    set_fill(grey);
    context.fillRect(1, 1, AREA_WIDTH-2, AREA_HEIGHT-2);

    // Grids
    var x,y;
    set_fill(black);
    for (y=0; y<AREA_HEIGHT;y++) {
        if (y%L == 0) {
            context.fillRect(0,y,AREA_WIDTH,1);
        }
    }
    for (x=0; x<AREA_WIDTH;x++) {
        if (x%L == 0) {
            context.fillRect(x,0,1,AREA_HEIGHT);
        }
    }
}

function turn_on(x,y) {
    set_fill(black);
    context.fillRect(x*L+2,y*L+2,L-3,L-3);
}

function turn_on_special(x,y,c) {
    set_fill(c);
    context.fillRect(x*L+2,y*L+2,L-3,L-3);
}

function keyboard_handler(key) {
    if (gameover && fadecolor>0) {
        return;
    } else if (gameover && fadecolor==0) {
        init_all();
        mainloop();
    }
    var oldx = delta.x;
    var oldy = delta.y;
    if (key==38) { //up
        delta.x = 0;
        delta.y = -1;
    } else if (key==37) { //left
        delta.x = -1;
        delta.y = 0;
    } else if (key==40) { //down
        delta.x = 0;
        delta.y = 1;
    } else if (key==39) { //right
        delta.x = 1;
        delta.y = 0;
    }
    // Check direction
    if (protagonist[0].x + delta.x == protagonist[1].x && protagonist[0].y + delta.y == protagonist[1].y) {
        // Invalid direction
        delta.x = oldx;
        delta.y = oldy;
    } else {
        clearTimeout(timeout);
        mainloop();
    }
}

function collisiondetection() {
    if (protagonist[0].x<0||protagonist[0].x>X-1||protagonist[0].y<0||protagonist[0].y>Y-1) {
        death(0);
        return 0;
    }
    var i;
    for (i=1;i<protagonist.length;i++) {
        if (protagonist[0].x==protagonist[i].x && protagonist[0].y==protagonist[i].y) {
            death(0);
            return 0;
        }
    }
    return 1;
}

function printwin() {
    if (points==1) {
        var score = "u gots just " + points + " point";
    } else {
        var score = "u gots " + points + " points";
    }
    context.fillStyle    = 'rgb(0,255,0)';
    context.font         = '60px sans-serif';
    context.fillText("YOU'RE WINNER", 170, 200);
    context.fillStyle    = 'rgb(0,255,0)';
    context.font         = '40px sans-serif';
    context.fillText(score, 170, 260);
    context.fillStyle    = 'rgb(0,255,0)';
    context.font         = '10px sans-serif';
    context.fillText("click 2 play again", 240, 290);
}

function printfail() {
    if (points==1) {
        var score = "u gots just " + points + " point";
    } else {
        var score = "u gots " + points + " points";
    }
    context.fillStyle    = 'rgb(255,0,0)';
    context.font         = '60px sans-serif';
    context.fillText('LOL U FAIL', 170, 200);
    context.fillStyle    = 'rgb(255,0,0)';
    context.font         = '40px sans-serif';
    context.fillText(score, 170, 260);
    context.fillStyle    = 'rgb(255,0,0)';
    context.font         = '10px sans-serif';
    context.fillText("click 2 play again", 240, 290);

}

function printinfo() {
    context.fillStyle    = 'rgb(255,255,255)';
    context.font         = '80px sans-serif';
    context.fillText("snake gaem", 0, 100);
    context.fillStyle    = 'rgb(255,0,0)';
    context.font         = '60px sans-serif';
    context.fillText("click 2 play!!1", 0, 200);
    context.fillStyle    = 'rgb(255,0,0)';
    context.font         = '40px sans-serif';
    context.fillText("use dem arrow keyz", 0, 260);
}

function win(p) {
    if (p==0) {
        fadecolor=255;
        gameover=1;
    }
    context.fillStyle = "rgb(0," + fadecolor + ",0)";
    fadecolor -= 1;
    context.fillRect(0, 0, AREA_WIDTH, AREA_HEIGHT);
    if (fadecolor > 0) {
        timeout = setTimeout("win(1)",fadertimeout);
    } else {
        printwin();
    }
}

function death(p) {
    if (p==0) {
        fadecolor=255;
        gameover=1;
    }
    context.fillStyle = "rgb(" + fadecolor + ",0,0)";
    fadecolor -= 1;
    context.fillRect(0, 0, AREA_WIDTH, AREA_HEIGHT);
    if (fadecolor > 0) {
        timeout = setTimeout("death(1)",fadertimeout);
    } else {
        printfail();
    }
}

function updatescore(i) {
    if (i) {
        points++;
    }

    if (points==winthreshold) {
        win(0);
        return 0;
    }

    return 1;
}

function init_tables() {
    var i;
    for (i=0;i<X*Y;i++) {
        colortable[i] = "rgb(" + i + "," + i + "," + i + ")";
    }
}

function init_all() {
    fadecolor=255;
    gameover=0;
    badge="";
    points=0;
    delta = new doodad(1,0);
    powerup = new doodad(Math.floor(X/2+1),Math.floor(Y/2)-1);
    protagonist=[];
    protagonist[0] = new doodad(2,6);
    protagonist[1] = new doodad(1,6);
    protagonist[2] = new doodad(0,6);
    initlength=protagonist.length;
    winthreshold=X*Y-initlength;
}
