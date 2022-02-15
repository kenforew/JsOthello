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

    add(pos) {
        return new Point3D(
            this.x + pos.x,
            this.y + pos.y,
            this.z + pos.z
        );
    }

    mlt(a) {
        return new Point3D(
            this.x * a,
            this.y * a,
            this.z * a
        );
    }
}

class Pos3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    rotate(rotZ, rotY) {
        var newX,newY,newZ;
        newX = this.x * Math.cos(rotZ) - this.y * Math.sin(rotZ);
        newY = this.x * Math.sin(rotZ) + this.y * Math.cos(rotZ);
        this.x = newX;
        this.y = newY;

        rotY = -rotY;
        
        newZ = this.z * Math.cos(rotY) - this.x * Math.sin(rotY);
        newX = this.z * Math.sin(rotY) + this.x * Math.cos(rotY);
        this.z = newZ;
        this.x = newX;
    }
}

class Object3D extends Pos3D {
    constructor(x, y, z, index) {
        super(x, y, z);
        this.index = index;
    }
}

class Stone extends Object3D {
    constructor(x, y, z, index, color) {
        super(x, y, z, index);
        this.color = color;//0 or 1 or -1
        this.target = false;
    }
}

class Controller extends Object3D {
    constructor(x, y, z, index, color) {
        super(x, y, z, index);
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
        this.is_longPress = false;
    }
}

class GameManager {
    constructor() {
        this.cursor = new Point3D(2, 2, 2);
        this.size = new Point3D(6, 6, 6);
        this.rotZ = 0;
        this.rotY = 0;
    }
}

var gameArea = new GameArea();
var mouse = new Mouse();
var gameManager = new GameManager();



var canvas, ctx, turn = 1, count = 0, mycolor = 0, fixedPlane = "yz";

stoneIndexList = [];

for(var i = 0; i < gameManager.size.x; ++i) {
    for(var j = 0; j < gameManager.size.y; ++j) {
        for(var k = 0; k < gameManager.size.z; ++k) {
            stoneIndexList.push(new Point3D(i, j, k));
        }
    }
}

neighborList = [];

for(var i = -1; i < 2; ++i) {
    for(var j = -1; j < 2; ++j) {
        for(var k = -1; k < 2; ++k) {
            if(!(i == 0 && j == 0 && k == 0)){
                neighborList.push(new Point3D(i, j, k));
            }
        }
    }
}



var stonelist = Array(gameManager.size.x);

for(var i = 0; i < gameManager.size.x; ++i) {
    stonelist[i] = Array(gameManager.size.y);
    for(var j = 0; j < gameManager.size.y; ++j) {
        stonelist[i][j] = Array(gameManager.size.z);
        for(var k = 0; k < gameManager.size.z; ++k) {
            stonelist[i][j][k] = new Stone(
                25 * (i - (gameManager.size.x - 1) / 2),
                25 * (j - (gameManager.size.y - 1) / 2),
                25 * (k - (gameManager.size.z - 1) / 2),
                new Point3D(i, j, k),
                0
            )
        }
    }
}

var controllerlist = [];

for(var i = 0; i < 2; ++i) {
    controllerlist.push(new Controller(
        50 * (2 * i - 1), 0, 0, new Point3D(1, 0, 0), [200 * i, 100, 100] 
    ));
    controllerlist.push(new Controller(
        0, 50 * (2 * i - 1), 0, new Point3D(0, 1, 0), [100, 200 * i, 100] 
    ));
    controllerlist.push(new Controller(
        0, 0, 50 * (2 * i - 1), new Point3D(0, 0, 1), [100, 100, 200 * i] 
    ));

}

var you = document.getElementById("you");
var turnplayer = document.getElementById("turn");

(() => {
    canvas = document.getElementsByTagName("canvas")[0];
    ctx = canvas.getContext("2d");
    canvas.width = gameArea.canvas.x;
    canvas.height = gameArea.canvas.y;

    ctx.fillStyle = "rgb(127,127,127)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
})();

gameInitialize();

function is_gameover() {
    var result = true;
    for(var i = 0; i < stoneIndexList.length; ++i) {
        if(result) {
            var p = stoneIndexList[i];
            result = result && (stonelist[p.x][p.y][p.z].color != 0);
        }
    }
    return result;
}

function gameover() {
    var black = 0, white = 0;
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        if(stonelist[p.x][p.y][p.z] == 1) {
            black++;
        } else if(stonelist[p.x][p.y][p.z] == -1) {
            white++;
        }
    }

    var winner;
    if(black == white) {
        winner = "draw.";
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
        if(stonelist[p.x][p.y][p.z].color == 0) {
            result = result || is_reverse(p);
        }
    }

    return !result;
}

function targetInitialize() {
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        stonelist[p.x][p.y][p.z].target = false;
    }
}

function targetActivate(pos) {
    targetInitialize();
    for(var i = 0; i < neighborList.length; ++i) {
        targetActivate_internal(pos, neighborList[i]);
    }
}

function targetActivate_internal(pos, arrow){
    if(is_inBoard(pos.add(arrow))
    && stonelist[pos.x + arrow.x][pos.y + arrow.y][pos.z + arrow.z].color == -turn) {
        var i = 2;
        do {
            if(!is_inBoard(pos.add(arrow.mlt(i)))) {
                return;
            }                
            
            if(stonelist[pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == turn) {
                for(var j = 1; j < i; ++j) {
                    stonelist[pos.x + arrow.x * j][pos.y + arrow.y * j][pos.z + arrow.z * j].target = true;
                }
                return;
            } else if (stonelist[pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == 0) {
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
    && stonelist[pos.x + arrow.x][pos.y + arrow.y][pos.z + arrow.z].color == -turn) {
        var i = 2;
        do {
            if(!is_inBoard(pos.add(arrow.mlt(i)))) {
                return;
            }
            if(stonelist[pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == turn) {
                for(var j = 0; j < i; ++j) {
                    stonelist[pos.x + arrow.x * j][pos.y + arrow.y * j][pos.z + arrow.z * j].color = turn;
                }
                return;
            } else if (stonelist[pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == 0) {
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
    && stonelist[pos.x + arrow.x][pos.y + arrow.y][pos.z + arrow.z].color == -turn) {
        var i = 2;
        do {
            if(!is_inBoard(pos.add(arrow.mlt(i)))) {
                return false;
            }
            if(stonelist[pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == turn) {
                return true;
            } else if (stonelist[pos.x + arrow.x * i][pos.y + arrow.y * i][pos.z + arrow.z * i].color == 0) {
                return false;
            }
            i++;
        } while (i < 6);
    }
    return false;
}

function is_inBoard(pos) {
    if(pos.x >= 0 && pos.x < gameManager.size.x
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

function stonelistInitialize() {
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        stonelist[p.x][p.y][p.z].color = 0;
    }   
}

function gameInitialize() {
    count = 0;
    stonelistInitialize();
    stonelist[2][2][2].color = 1;
    stonelist[2][3][3].color = 1;
    stonelist[3][2][3].color = 1;
    stonelist[3][3][2].color = 1;
    stonelist[2][2][3].color = -1;
    stonelist[2][3][2].color = -1;
    stonelist[3][2][2].color = -1;
    stonelist[3][3][3].color = -1;
    gameDisplay();
}

function sortList(input) {
    //if(typeof(input) != Array) return;
    
    //var list = input;
    for(var i = 0; i < input.length; ++i) {
        for(var j = i + 1; j < input.length; ++j) {
            if(input[i].x > input[j].x) {
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
        stonelist_line.push(stonelist[p.x][p.y][p.z]);
    }

    var sortStoneList = sortList(stonelist_line);

    for(var i = 0; i < sortStoneList.length; ++i){
        
        var fy, fz, fr, oy, oz, size;
        fy = sortStoneList[i].y;
        fz = sortStoneList[i].z;
        fr = 1 + sortStoneList[i].x / 200;
        oy = canvas.width / 2;
        oz = canvas.height * 3 / 8;
        size = 10;

        if(sortStoneList[i].color != 0) {
            var alpha = (sortStoneList[i].target)
                ? Math.cos(count * Math.PI / 30) * 0.3 + 0.7
                : 1.0;
            ctx.fillStyle = (sortStoneList[i].color == 1)
                ? "rgba(0, 255, 255, " + alpha + ")"
                : "rgba(255, 0, 255, " + alpha + ")";

            
        } else {
            if(is_reverse(new Point3D(
                    sortStoneList[i].index.x,
                    sortStoneList[i].index.y,
                    sortStoneList[i].index.z))
            ) {
                ctx.fillStyle = "rgba(144,144,22,"
                    + (Math.cos(count * Math.PI / 60) * 0.2 + 0.6)+
                ")";
                
            } else {
                ctx.strokeStyle = "rgba(144,144,144,0.3)";

            }
        }
        
        if(sortStoneList[i].index.x == gameManager.cursor.x
        && sortStoneList[i].index.y == gameManager.cursor.y
        && sortStoneList[i].index.z == gameManager.cursor.z) {
            ctx.fillStyle = "rgb(254,254,254)";
            
        }
            
        ctx.beginPath();
        ctx.arc(
            fy * fr + oy, fz * fr + oz, size * fr,
            0, 2 * Math.PI, false     
        );
        ctx.fill();
        ctx.stroke();
        
    }

    var sortControllerList = sortList(controllerlist);


    for(var i = 0; i < 6; ++i) {
        ctx.fillStyle = "rgb("
            + sortControllerList[i].color[0] + ","
            + sortControllerList[i].color[1] + ","
            + sortControllerList[i].color[2] + ")";
        var fy, fz, fr, oy, oz, size;
        fy = sortControllerList[i].y;
        fz = sortControllerList[i].z;
        fr = 1 + sortControllerList[i].x / 200;
        oy = canvas.width / 2;
        oz = canvas.height * 13 / 16;
        size = 10;

        ctx.beginPath();
        ctx.arc(
            fy * fr + oy, fz * fr + oz, size * fr,
            0, 2 * Math.PI, false
        );
        ctx.fill();

        var label=(() => {
            if(sortControllerList[i].index.x != 0) {
                return "x";
            } else if(sortControllerList[i].index.y != 0) {
                return "y";
            } else if(sortControllerList[i].index.z != 0) {
                return "z";
            } else {
                return "";
            }
        })();
        ctx.strokeStyle="rgb(164,164,164)";
        ctx.strokeText(label, fy * fr * 1.4 + oy - 2, fz * fr * 1.4 + oz + 2);

        if(i == 2) {
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.beginPath();
            ctx.arc(oy, oz, 2 * size, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    }

    ctx.strokeStyle="rgb(255,255,255)";
    ctx.strokeText("Move on " + fixedPlane + " Plane.", 20, canvas.height - 20);
    
    count++;
    requestAnimationFrame(gameDisplay);
}

function setLabel() {
    you.innerHTML = (() => {
        switch(mycolor) {
            case 1:
                return "you are black.";
            case -1:
                return "you are white.";
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
    //console.log("mouse down pos : "+x+" "+y);
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
    
    //console.log("mouse move pos : "+x+" "+y);
    
    if(mouse.is_down) {
        mouse.updatePos = new Point2D(x, y);
        gameManager.rotZ = (mouse.updatePos.x - mouse.escapePos.x) / 30;
        gameManager.rotY = (mouse.updatePos.y - mouse.escapePos.y) / 30;
        
        for(var i = 0; i < stoneIndexList.length; ++i) {
            var p = stoneIndexList[i];
            stonelist[p.x][p.y][p.z].rotate(gameManager.rotZ, gameManager.rotY);
        }

        for(var i = 0; i < 6; ++i) {
            controllerlist[i].rotate(gameManager.rotZ, gameManager.rotY);
        }

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
    var p = ctx.getImageData(x, y, 1, 1).data;

    console.log("cursor : "+gameManager.cursor.x+" "+gameManager.cursor.y+" "+gameManager.cursor.z);
    if(p[0] == 255
    && p[1] == 255
    && p[2] == 255) {

        mouse.is_longPress = false;
        
        if(is_reverse(
            gameManager.cursor
        )){
            socket.emit("I_put_stone_3" ,JSON.stringify({
                        x:gameManager.cursor.x,
                        y:gameManager.cursor.y,
                        z:gameManager.cursor.z,
                        color:turn,
            }));
        }

        return;
    }

    if(p[0] == 0
    && p[1] == 100
    && p[2] == 100) {
        gameManager.cursor.x--;
        if(gameManager.cursor.x < 0) gameManager.cursor.x += 6;
    }
    if(p[0] == 200
    && p[1] == 100
    && p[2] == 100) {
        gameManager.cursor.x++;
        if(gameManager.cursor.x > 5) gameManager.cursor.x -= 6;
    }
    
    if(p[0] == 100
    && p[1] == 0
    && p[2] == 100) {
        gameManager.cursor.y--;
        if(gameManager.cursor.y < 0) gameManager.cursor.y += 6;
    }
    if(p[0] == 100
    && p[1] == 200
    && p[2] == 100) {
        gameManager.cursor.y++;
        if(gameManager.cursor.y > 5) gameManager.cursor.y -= 6;
    }

    if(p[0] == 100
    && p[1] == 100
    && p[2] == 0) {
        gameManager.cursor.z--;
        if(gameManager.cursor.z < 0) gameManager.cursor.z += 6;
    }
    if(p[0] == 100
    && p[1] == 100
    && p[2] == 200) {
        gameManager.cursor.z++;
        if(gameManager.cursor.z > 5) gameManager.cursor.z -= 6;
    }
 
    
    if(is_reverse(
        gameManager.cursor
    )){
        console.log("target activate");
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
        case "x":
            fixedPlane = "yz";
            break;
        case "y":
            fixedPlane = "zx"
            break; 
        case "z":
            fixedPlane = "xy";
            break;
        default:
            break;
    }

    console.log("hoge : "+e+" "+typeof(e.key)+" " +e.key);
    
    if(is_reverse(
        gameManager.cursor
    )) {
        //console.log("hoge");
        targetActivate(
            gameManager.cursor
        );
    } else {
        targetInitialize();
    }

    var keyRotZ = 0, keyRotY = 0;
    
    if(e.ctrlKey) {//preww arrow key with ctrl key ... rotate
        switch(e.key) {
            case "ArrowLeft"://right
                //console.log("left : "+e.key);
                keyRotZ = -0.1;
                break;
            case "ArrowRight"://left
                //console.log("right : "+e.key);
                keyRotZ = 0.1;
                break;
            case "ArrowUp"://up
                //console.log("up : "+e.key);
                keyRotY = -0.1;
                break;
            case "ArrowDown"://down
                //console.log("down  "+e.key);
                keyRotY = 0.1;
                break;
            default:
                break;
        }
    } else if(fixedPlane == "yz") {
        switch(e.key) {
            case "ArrowLeft"://right
                //console.log("left : "+e.key);
                gameManager.cursor.y -= 1;
                if(gameManager.cursor.y < 0) gameManager.cursor.y += 6;
                break;
            case "ArrowRight"://left
                //console.log("right : "+e.key);
                gameManager.cursor.y += 1;
                if(gameManager.cursor.y > 5) gameManager.cursor.y -= 6;
                break;
            case "ArrowUp"://up
                //console.log("up : "+e.key);
                gameManager.cursor.z -= 1;
                if(gameManager.cursor.z < 0) gameManager.cursor.z += 6;
                break;
            case "ArrowDown"://down
                //console.log("down  "+e.key);
                gameManager.cursor.z += 1;
                if(gameManager.cursor.z > 5) gameManager.cursor.z -= 6;
                break;
            default:
                break;
        }
    }else if(fixedPlane == "zx") {
        switch(e.key) {
            case "ArrowLeft"://right
                //console.log("left : "+e.key);
                gameManager.cursor.z -= 1;
                if(gameManager.cursor.z < 0) gameManager.cursor.z += 6;
                break;
            case "ArrowRight"://left
                //console.log("right : "+e.key);
                gameManager.cursor.z += 1;
                if(gameManager.cursor.z > 5) gameManager.cursor.z -= 6;
                break;
            case "ArrowUp"://up
                //console.log("up : "+e.key);
                gameManager.cursor.x -= 1;
                if(gameManager.cursor.x < 0) gameManager.cursor.x += 6;
                break;
            case "ArrowDown"://down
                //console.log("down  "+e.key);
                gameManager.cursor.x += 1;
                if(gameManager.cursor.x > 5) gameManager.cursor.x -= 6;
                break;
            default:
                break;
        }
    } else if(fixedPlane == "xy") {
        switch(e.key) {
            case "ArrowLeft"://right
                //console.log("left : "+e.key);
                gameManager.cursor.x -= 1;
                if(gameManager.cursor.x < 0) gameManager.cursor.x += 6;
                break;
            case "ArrowRight"://left
                //console.log("right : "+e.key);
                gameManager.cursor.x += 1;
                if(gameManager.cursor.x > 5) gameManager.cursor.x -= 6;
                break;
            case "ArrowUp"://up
                //console.log("up : "+e.key);
                gameManager.cursor.y -= 1;
                if(gameManager.cursor.y < 0) gameManager.cursor.y += 6;
                break;
            case "ArrowDown"://down
                //console.log("down  "+e.key);
                gameManager.cursor.y += 1;
                if(gameManager.cursor.y > 5) gameManager.cursor.y -= 6;
                break;
            default:
                break;
        }
    } else {
        switch(e.key) {
            case "Enter":
                if(is_reverse(
                    gameManager.cursor
                )){
                    socket.emit("I_put_stone_3" ,JSON.stringify({
                        x:gameManager.cursor.x,
                        y:gameManager.cursor.y,
                        z:gameManager.cursor.z,
                        color:turn,
                    }));
                    //reverse(
                    //    gameManager.cursor
                    //);
                    //targetInitialize();
                    //turnChange();
                }
                break;
            default:
                break;
        }
    }

    
    for(var i = 0; i < stoneIndexList.length; ++i) {
        var p = stoneIndexList[i];
        stonelist[p.x][p.y][p.z].rotate(keyRotZ, keyRotY);
    }

    for(var i = 0; i < 6; ++i) {
        controllerlist[i].rotate(keyRotZ, keyRotY);
    }
     
});

socket.on("turnInitialize" ,(message) => {
    mycolor = message;
    console.log("mycolor: ", mycolor);
    setLabel();
});

socket.on("you_put_stone_3", (message) => {
    const {x, y, z, color} = JSON.parse(message);
    reverse(new Point3D(x, y, z));
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