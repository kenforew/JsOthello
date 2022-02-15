class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Pos3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Point4D {
    constructor(u, x, y, z) {
        this.u = u;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    add(pos) {
        return new Point4D(
            this.u + pos.u,
            this.x + pos.x,
            this.y + pos.y,
            this.z + pos.z
        );
    }

    mlt(a) {
        return new Point4D(
            this.u * a,
            this.x * a,
            this.y * a,
            this.z * a
        );
    }
}

class Pos4D {
    constructor(u, x, y, z) {
        this.u = u;
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

/*
const QuaternionOps = Operators({
    "+"(l, r) {
        return Pos4D(
            l.pos.u + r.pos.u,
            l.pos.x + r.pos.x,
            l.pos.y + r.pos.y,
            l.pos.z + r.pos.z
        );
    },
    "-"(l, r) {
        return Pos4D(
            l.pos.u - r.pos.u,
            l.pos.x - r.pos.x,
            l.pos.y - r.pos.y,
            l.pos.z - r.pos.z
        );
    },
    "*"(l, r) {
        return Pos4D(
            l.pos.u * r.pos.u - l.pos.x * r.pos.x - l.pos.y * r.pos.y - l.pos.z * r.pos.z,
            l.pos.u * r.pos.x + l.pos.x * r.pos.u + l.pos.y * r.pos.z - l.pos.z * r.pos.y,
            l.pos.u * r.pos.y - l.pos.x * r.pos.z + l.pos.y * r.pos.u + l.pos.z * r.pos.x,
            l.pos.u * r.pos.z + l.pos.x * r.pos.y - l.pos.y * r.pos.x + l.pos.z * r.pos.u
        );
    },
    "=="(l, r) {
        return l.pos.u == r.pos.u
            && l.pos.x == r.pos.x
            && l.pos.y == r.pos.y
            && l.pos.z == r.pos.z;
    }
});

class Quaternion extends QuaternionOps {
    pos;
    constructor(u, x, y, z) {
        super();
        this.pos = new Pos4D(u, x, y, z);
    }
};

var q1 = new Quaternion(1, 1, 1, 1);
var q2 = new Quaternion(2, 2, 3, 3);
var q3 = new Quaternion(3, 3, 4, 4);
*/

//console.log("test : "+(q1+q2==q3));


class Object4D extends Pos4D {
    constructor(u, x, y, z, index) {
        super(u, x, y, z);
        this.index = index;//Point4D index (0 ~ 5) * 4
        this.cartesian = new Pos3D(0, 0, 0);
        this.project();
    }
    
    project(){
        var f = gameManager.lightSource.u;
        this.cartesian.x = f / (f - this.u) * this.x;
        this.cartesian.y = f / (f - this.u) * this.y;
        this.cartesian.z = f / (f - this.u) * this.z;
    }
    
    projectParallel() {
        this.cartesian.x = this.x;
        this.cartesian.y = this.y;
        this.cartesian.z = this.z;
    }

    Euler(a, b, c) {
        var ra, rb, rc, ca, sa, cb, sb, cc, sc;
        ra = a * 2 * Math.PI / 360;
        rb = b * 2 * Math.PI / 360;
        rc = c * 2 * Math.PI / 360;
        ca = Math.cos(ra / 2);
        sa = Math.sin(ra / 2);
        cb = Math.cos(rb / 2);
        sb = Math.sin(rb / 2);
        cc = Math.cos(rc / 2);
        sc = Math.sin(rc / 2);

        return new Pos4D(
            ca * cb * cc + sa * sb * sc,
            sa * cb * cc - ca * sb * sc,
            ca * sb * cc + sa * cb * sc,
            ca * cb * sc - sa * sb * cc
        );
    }

    mlt(l, r) {
        return new Pos4D(
            l.u * r.u - l.x * r.x - l.y * r.y - l.z * r.z,
            l.u * r.x + l.x * r.u + l.y * r.z - l.z * r.y,
            l.u * r.y - l.x * r.z + l.y * r.u + l.z * r.x,
            l.u * r.z + l.x * r.y - l.y * r.x + l.z * r.u
        );
    }    

    rotate(x1, y1, z1, x2, y2, z2) {
        var p = this.mlt(
                    this.mlt(
                        this.Euler(x1, y1, z1), 
                        new Pos4D(this.u, this.x, this.y, this.z)
                    ),
                    this.Euler(x2, y2, z2)
                );
        this.u = p.u;
        this.x = p.x;
        this.y = p.y;
        this.z = p.z;
    }
}



class Stone extends Object4D {
    constructor(u, x, y, z, index, color) {
        super(u, x, y, z ,index);
        this.color = color;//0 or 1 or -1
    }
}

class Controller extends Object4D {
    constructor(u, x, y, z, index, color) {
        super(u, x, y, z, index);
        this.color = color;//[R, G, B]
    }
}

class GameArea {
    constructor() {
        this.canvas = new Point2D(400, 400);
    }
}

class Mouse {
    constructor() {
        this.downPos = new Point2D(0, 0);
        this.escapePos = new Point2D(0, 0);
        this.updatePos = new Point2D(0, 0);
        this.upPos = new Point2D(0, 0);

        this.is_down = false;
        this.is_longPress =false;
    }
}

class GameManager {
    constructor() {
        this.cursor = new Point4D(2, 2, 2, 2);
        this.size = new Point4D(6, 6, 6, 6);
        this.rotZ = 0;
        this.rotY = 0;
        this.lightSource = new Pos4D(500, 0, 0, 0);
    }
}


var canvas, ctx, turn = 1, count = 0, mycolor =0;

var you = document.getElementById("you");
var turnplayer = document.getElementById("turn");

var gameArea = new GameArea();
var mouse = new Mouse();
var gameManager = new GameManager();

stoneIndexList = [];

for(var i = 0; i < gameManager.size.u; ++i) {
    for(var j = 0; j < gameManager.size.x; ++j) {
        for(var k = 0; k < gameManager.size.y; ++k) {
            for(var l = 0; l < gameManager.size.z; ++l) {
                stoneIndexList.push(new Point4D(i, j, k, l));
            }
        }
    }
}

neighborList = [];

for(var i = -1; i < 2; ++i) {
    for(var j = -1; j < 2; ++j) {
        for(var k = -1; k < 2; ++k) {
            for(var l = -1; l < 2; ++l) {
                if(!(i == 0 && j == 0 && k == 0)){
                    neighborList.push(new Point4D(i, j, k, l));
                }
            }
        }
    }
}


var stoneList = Array(gameManager.size.u);
for(var i = 0; i < gameManager.size.u; ++i) {
    stoneList[i] = Array(gameManager.size.x);
    for(var j = 0; j < gameManager.size.x; ++j) {
        stoneList[i][j] = Array(gameManager.size.y);
        for(var k = 0; k < gameManager.size.y; ++k) {
            stoneList[i][j][k] = Array(gameManager.size.z);
            for(var l = 0; l < gameManager.size.z; ++l) {
                stoneList[i][j][k][l] = new Stone(
                    35 * (i - (gameManager.size.u - 1) / 2),
                    35 * (j - (gameManager.size.x - 1) / 2),
                    35 * (k - (gameManager.size.y - 1) / 2),
                    35 * (l - (gameManager.size.z - 1) / 2),
                    new Point4D(i, j, k, l),
                    0
                )
            }
        }
    }
}


var controllerList = [];
for(var i = 0; i < 2; ++i) {
    var arrow, size;
    arrow = 2 * i - 1;
    size = 50;
    controllerList.push(new Controller(size * arrow, 0, 0, 0, new Point4D(arrow, 0, 0, 0), [100 * i + 50, 100 * i + 75, 100 * i + 100]));
    controllerList.push(new Controller(0, size * arrow, 0, 0, new Point4D(0, arrow, 0, 0), [200 * i, 100, 100]));
    controllerList.push(new Controller(0, 0, size * arrow, 0, new Point4D(0, 0, arrow, 0), [100, 200 * i, 100]));
    controllerList.push(new Controller(0, 0, 0, size * arrow, new Point4D(0, 0, 0, arrow), [100, 100, 200 * i]));
}


(() => {
    canvas = document.getElementsByTagName("canvas")[0];
    ctx = canvas.getContext("2d");
    canvas.width = gameArea.canvas.x;
    canvas.height = gameArea.canvas.y;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
})();



gameInitialize();

function is_gameover() {
    var result = true;
    for(var i = 0; i < stoneIndexList.length; ++i) {
        if(result) {
            var p = stoneIndexList[i];
            result = result && (stoneList[p.u][p.x][p.y][p.z].color != 0);
        }
    }
    return result;
}

function gameover() {
    var black = 0, white = 0;
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        if(stoneList[p.u][p.x][p.y][p.z] == 1) {
            black++;
        } else if(stoneList[p.u][p.x][p.y][p.z] == -1) {
            white++;
        }
    }
    var winner;
    if(black == white) {
        winner = "draw";
    } else {
        winner = (black < white) ? "white win." : "black win.";
    }
    if(window.alert(
        "black : " + black + " white : " + white + "\n" + winner + "\nnew game?",
    )) {
        gameInitialize();
    } else {
        window.location = "../index.html";
    }
}

function is_skipped() {
    var result = false;
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        if(stoneList[p.u][p.x][p.y][p.z].color == 0) {
            result = result || is_reverse(p);
        }
    }
    return !result;
}

function targetInitialize() {
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        stoneList[p.u][p.x][p.y][p.z].target = false;
    }
}

function targetActivate(pos) {
    targetInitialize();
    for(var i = 0; i < neighborList.length; ++i) {
        targetActivate_internal(pos, neighborList[i]);
    }
}

function targetActivate_internal(pos, arrow) {
    if(is_inBoard(pos.add(arrow))
    && stoneList[pos.u + arrow.u][pos.x + arrow.x][pos.y + arrow.y][pos.z + arrow.z].color == -turn) {
        var i = 2;
        do {
            if(!is_inBoard(pos.add(arrow.mlt(i)))) {
                return;
            }
            
            if(stoneList[pos.u + arrow.u * i][pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == turn) {
                for(var j = 1; j < i; ++j) {
                    stoneList[pos.u + arrow.u * j][pos.x + arrow.x * j][pos.y + arrow.y * j][pos.z + arrow.z * j].target = true;
                }
                return;
            } else if(stoneList[pos.u + arrow.u * i][pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == 0) {
                return;
            }
            i++;
        } while(i < 6);
    }
    return;
}

function reverse(pos) {
    for(var i = 0; i < neighborList.length; ++i) {
        reverse_internal(pos, neighborList[i]);
    }
}

function reverse_internal(pos, arrow) {
    if(is_inBoard(pos.add(arrow))
    && stoneList[pos.u + arrow.u][pos.x + arrow.x][pos.y + arrow.y][pos.z + arrow.z].color == -turn) {
        var i = 2;
        do {
            if(!is_inBoard(pos.add(arrow.mlt(i)))) {
                return;
            }
            
            if(stoneList[pos.u + arrow.u * i][pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == turn) {
                for(var j = 0; j < i; ++j) {
                    stoneList[pos.u + arrow.u * j][pos.x + arrow.x * j][pos.y + arrow.y * j][pos.z + arrow.z * j].color = turn;
                }
                return;
            } else if(stoneList[pos.u + arrow.u * i][pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == 0) {
                return;
            }
            i++;
        } while(i < 6);
    }
    return;
}

function is_reverse(pos) {
    var result = false;
    for(var i = 0; i < neighborList.length; ++i) {
        result = result || is_reverse_internal(pos, neighborList[i]);
    }
    return result;
}

function is_reverse_internal(pos, arrow) {
    if(is_inBoard(pos.add(arrow))
    && stoneList[pos.u + arrow.u][pos.x + arrow.x][pos.y + arrow.y][pos.z + arrow.z].color == -turn) {
        var i = 2;
        do {
            if(!is_inBoard(pos.add(arrow.mlt(i)))) {
                return false;
            }
            
            if(stoneList[pos.u + arrow.u * i][pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == turn) {
                return true;
            } else if(stoneList[pos.u + arrow.u * i][pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == 0) {
                return false;
            }
            i++;
        } while(i < 6);
    }
    return false;
}

function is_inBoard(pos) {
    if(pos.u >= 0 && pos.u < gameManager.size.u
    && pos.x >= 0 && pos.x < gameManager.size.x
    && pos.y >= 0 && pos.y < gameManager.size.y
    && pos.z >= 0 && pos.z < gameManager.size.z) {
        return true;
    } else {
        return false;
    }
}

function turnChange() {
    turn *= (-1);
}

function stoneListInitialize() {
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        stoneList[p.u][p.x][p.y][p.z].color = 0;
    }
}

function gameInitialize() {
    count = 0;

    stoneList[2][2][2][2].color = 1;
    stoneList[2][2][3][3].color = 1;
    stoneList[2][3][2][3].color = 1;
    stoneList[2][3][3][2].color = 1;
    stoneList[3][2][2][3].color = 1;
    stoneList[3][2][3][2].color = 1;
    stoneList[3][3][2][2].color = 1;
    stoneList[3][3][3][3].color = 1;

    stoneList[2][2][2][3].color = -1;
    stoneList[2][2][3][2].color = -1;
    stoneList[2][3][2][2].color = -1;
    stoneList[3][2][2][2].color = -1;
    stoneList[2][3][3][3].color = -1;
    stoneList[3][2][3][3].color = -1;
    stoneList[3][3][2][3].color = -1;
    stoneList[3][3][3][2].color = -1;
    
    gameDisplay();
}

function sortList(input) {
    for(var i = 0; i < input.length; ++i) {
        input[i].project();
        for(var j = i + 1; j < input.length; ++j) {
            input[j].project();
            if(input[i].cartesian.x > input[j].cartesian.x) {
                var t = input[i];
                input[i] = input[j];
                input[j] = t;
            }
        }
    }
    
    return input;
}

function gameDisplay() {
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    stonelist_line = [];
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        stonelist_line.push(stoneList[p.u][p.x][p.y][p.z]);
    }

    var sortStoneList = sortList(stonelist_line);
  
    for(var i = 0; i < sortStoneList.length; ++i) {
        var p = sortStoneList[i].index;
        var stone = sortStoneList[i];
        stone.project();
        
        var fy, fz, fr, oy, oz, size;
        fy = stone.cartesian.y;
        fz = stone.cartesian.z;
        fr = 1 + stone.cartesian.x / gameManager.lightSource.u;
        oy = gameArea.canvas.x / 2;
        oz = gameArea.canvas.y * 3 / 8;
        size = 8;

        
        if(stone.color != 0) {
            var alpha = stone.target
                ? Math.cos(count * Math.PI / 30) * 0.3 + 0.7
                : 1.0;
            ctx.fillStyle = (stone.color == 1)
                ? "rgba(0, 255, 255, " + alpha + ")"
                : "rgba(255, 0, 255, " + alpha + ")";
            
        } else {
            if(is_reverse(p)) {
                ctx.fillStyle = "rgba(144,144,22,"
                    + (Math.cos(count * Math.PI / 60) * 0.2 + 0.6) +
                ")";
            } else {
                //ctx.strokeStyle = "rgba(144,144,144,0.05)";
                ctx.fillStyle = "rgba(144,144,144,0.05)";
            }
        }
        
        if(stone.index.u == gameManager.cursor.u
        && stone.index.x == gameManager.cursor.x
        && stone.index.y == gameManager.cursor.y
        && stone.index.z == gameManager.cursor.z) {
            ctx.fillStyle = "rgb(254,254,254)";
        }

        ctx.beginPath();
        ctx.arc(
            fy * fr + oy, fz * fr + oz, size * fr,
            0, 2 * Math.PI, false
        );
        ctx.fill();
        //ctx.stroke();

        
    }

    //controller

    var sortControllerList = sortList(controllerList);

    for(var i = 0; i < sortControllerList.length; ++i) {
        ctx.fillStyle = "rgb("
            + sortControllerList[i].color[0] + ","
            + sortControllerList[i].color[1] + ","
            + sortControllerList[i].color[2] + ")";
        
        var cnt = sortControllerList[i];
        cnt.project();

        var fy, fz, fr, oy, oz, size;
        fy = cnt.cartesian.y;
        fz = cnt.cartesian.z;
        fr = 1 + cnt.cartesian.x / gameManager.lightSource.u;
        oy = canvas.width / 2;
        oz = canvas.height * 13 /16;
        size = 10;

        ctx.beginPath();
        ctx.arc(
            fy * fr + oy, fz * fr + oz, size * fr,
            0, 2 * Math.PI, false
        );
        ctx.fill();

        if(i == 3) {
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.beginPath();
            ctx.arc(oy, oz, 2 * size, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    }

    

    
    count++;
    requestAnimationFrame(gameDisplay);
}

function setLabel() {
    you.innerHTML = (() => {
        switch(mycolor) {
            case 1:
                return "you are black.";
            case -1:
                return "you are white";
            case 0:
                return "watching ...";
            default:
                return "";
        }
    })();

    turnplayer.innerHTML = (() => {
        switch(turn) {
            case 1:
                return "black's turn.";
            case -1:
                return "white's turn.";
            default:
                return "";
        }
    })();
}

canvas.addEventListener("mousedown", e => {
    mouse.is_down = true;
    mouse.is_longPress = false;
    
    var rect = e.target.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;

    mouse.downPos = new Point2D(x, y);
    mouse.escapePos = new Point2D(x, y);
    mouse.updatePos = new Point2D(x, y);
});

canvas.addEventListener("mousemove", e => {
    var rect = e.target.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;

    if(!mouse.is_longPress
        && Math.sqrt(
            (x - mouse.downPos.x) * (x - mouse.downPos.x)
            + (y - mouse.downPos.y) * (y - mouse.downPos.y)
    ) > 10) {
        mouse.is_longPress = true;           
    }
    
    if(mouse.is_down) {
        mouse.updatePos = new Point2D(x, y);
        gameManager.rotZ = (mouse.updatePos.x - mouse.escapePos.x) / 0.3;
        gameManager.rotY = (mouse.updatePos.y - mouse.escapePos.y) / 0.3;

        for(var i = 0; i < stoneIndexList.length; ++i) {
            var p = stoneIndexList[i];
            stoneList[p.u][p.x][p.y][p.z].rotate(0, gameManager.rotZ, gameManager.rotY, 0, gameManager.rotZ, gameManager.rotY);
        }

        for(var i = 0; i < controllerList.length; ++i) {
            controllerList[i].rotate(0, gameManager.rotZ, gameManager.rotY, 0, gameManager.rotZ, gameManager.rotY);
        }

        //console.log("rotate");
        
        mouse.escapePos = new Point2D(x, y);
    }
});

canvas.addEventListener("mouseup", e => {
    mouse.is_down = false;
    if(mouse.is_longPress) {
        mouse.is_longPress = false;
        return;
    }

    var rect = e.target.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    var p =ctx.getImageData(x, y, 1, 1).data;

    
    if(p[0] == 255
    && p[1] == 255
    && p[2] == 255) {
        mouse.is_longPress = false;
        
        if(is_reverse(
            gameManager.cursor
        )) {
            //putstone...
            //reverse(gameManager.cursor);
            //targetInitialize();
            //turnChange();
            socket.emit("I_put_stone_4", JSON.stringify({
                u : gameManager.cursor.u,
                x : gameManager.cursor.x,
                y : gameManager.cursor.y,
                z : gameManager.cursor.z,
                color : turn,
            }));
        }
        
        return;
    }

    if(p[0] == 50
    && p[1] == 75
    && p[2] == 100) {
        gameManager.cursor.u--;
        if(gameManager.cursor.u < 0) {
            gameManager.cursor.u += gameManager.size.u;
        }
    }
    if(p[0] == 150
    && p[1] == 175
    && p[2] == 200) {
        gameManager.cursor.u++;
        if(gameManager.cursor.u > gameManager.size.u) {
            gameManager.cursor.u -= gameManager.size.u;
        }
    }

 
    if(p[0] == 0
    && p[1] == 100
    && p[2] == 100) {
        gameManager.cursor.x--;
        if(gameManager.cursor.x < 0) {
            gameManager.cursor.x += gameManager.size.x;
        }
    }
    if(p[0] == 200
    && p[1] == 100
    && p[2] == 100) {
        gameManager.cursor.x++;
        if(gameManager.cursor.x > gameManager.size.x) {
            gameManager.cursor.x -= gameManager.size.x;
        }
    }
  
    if(p[0] == 100
    && p[1] == 0
    && p[2] == 100) {
        gameManager.cursor.y--;
        if(gameManager.cursor.y < 0) {
            gameManager.cursor.y += gameManager.size.y;
        }
    }
    if(p[0] == 100
    && p[1] == 200
    && p[2] == 100) {
        gameManager.cursor.y++;
        if(gameManager.cursor.y > gameManager.size.y) {
            gameManager.cursor.y -= gameManager.size.y;
        }
    }
   
    if(p[0] == 100
    && p[1] == 100
    && p[2] == 0) {
        gameManager.cursor.z--;
        if(gameManager.cursor.z < 0) {
            gameManager.cursor.z += gameManager.size.z;
        }
    }
    if(p[0] == 100
    && p[1] == 100
    && p[2] == 200) {
        gameManager.cursor.z++;
        if(gameManager.cursor.z > gameManager.size.z) {
            gameManager.cursor.z -= gameManager.size.z;
        }
    }
    
    if(is_reverse(
        gameManager.cursor
    )) {
        targetActivate(
            gameManager.cursor
        );
    } else {
        targetInitialize();
    }

    mouse.is_longPress = false;
  
});

document.addEventListener("keydown", (e) => {
    switch(e.key) {
        case "u":
            //fixedParam = "u";
            break;
        case "x":
            //fixedParam = "x";
            break;
        case "y":
            //fixedParam = "y";
            break;
        case "z":
            //fixedParam = "z";
            break;
        default:
            break;
    }

    if(is_reverse(
        gameManager.cursor
    )) {
        targetActivate(
            gameManager.cursor
        );
    } else {
        targetInitialize();
    }

    var keyRot1 = 0, keyRot2 = 0;

    if(e.ctrlKey) {
        //console.log("control");
        switch(e.key) {
            case "ArrowLeft":
                keyRot1 = -10;
                break;
            case "ArrowRight":
                keyRot1 = 10;
                break;
            case "ArrowUp":
                keyRot2 = -10;
                break;
            case "ArrowDown":
                keyRot2 = 10;
                break;
            default:
                break;
        }
    } else if(e.shiftKey) {
        switch(e.key) {
            case "ArrowLeft":
                gameManager.cursor.u += 1;
                if(gameManager.cursor.u > gameManager.size.u) {
                    gameManager.cursor.u -= gameManager.size.u;
                }
                break;
            case "ArrowRight":
                gameManager.cursor.x+=1;
                if(gameManager.cursor.x > gameManager.size.x) {
                    gameManager.cursor.x -= gameManager.size.x;
                }
                break;
            case "ArrowUp":
                gameManager.cursor.y += 1;
                if(gameManager.cursor.y > gameManager.size.y) {
                    gameManager.cursor.y -= gameManager.size.y;
                }
                break;
            case "ArrowDown":
                gameManager.cursor.z += 1;
                if(gameManager.cursor.z > gameManager.size.z) {
                    gameManager.cursor.z -= gameManager.size.z;
                }
                break;
            default:
                break;
        }

    } else {
        switch(e.key) {
            case "Enter":
                if(is_reverse(
                    gameManager.cursor
                )) {
                    socket.emit("I_put_stone_4", JSON.stringify({
                        u : gameManager.cursor.x,
                        x : gameManager.cursor.x,
                        y : gameManager.cursor.y,
                        z : gameManager.cursor.z,
                        color : turn,
                    }));
                }
                break; 
            case "ArrowLeft":
                gameManager.cursor.u -= 1;
                if(gameManager.cursor.u < 0) {
                    gameManager.cursor.u += gameManager.size.u;
                }
                break;
            case "ArrowRight":
                gameManager.cursor.x -= 1;
                if(gameManager.cursor.x < 0) {
                    gameManager.cursor.x += gameManager.size.x;
                }
                break;
            case "ArrowUp":
                gameManager.cursor.y -= 1;
                if(gameManager.cursor.y < 0) {
                    gameManager.cursor.y += gameManager.size.y;
                }
                break;
            case "ArrowDown":
                gameManager.cursor.z -= 1;
                if(gameManager.cursor.z < 0) {
                    gameManager.cursor.z += gameManager.size.z;
                }
                break;
            default:
                break;
        }

    }
  
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        stoneList[p.u][p.x][p.y][p.z].rotate(0, keyRot1, keyRot2, 0, 0, 0);
    }
  
    for(var i = 0; i < controllerList.length; ++i) {
        controllerList[i].rotate(0, keyRot1, keyRot2, 0, 0, 0);
    }

});

socket.on("turnInitialize", (message) => {
    mycolor = message;
    console.log("mycolor : "+mycolor);
    setLabel();
});

socket.on("you_put_stone_4", (message) => {
    const {u, x, y, z, color} = JSON.parse(message);
    reverse(new Point4D(u, x, y, z));
    targetInitialize();
    turnChange();
    setLabel();
    count = 0;

    if(is_skipped()) {
        window.alert("置ける場所がありません。");
        turnChange();
    }
    
    if(is_gameover()) {
        gameover();
    }
});