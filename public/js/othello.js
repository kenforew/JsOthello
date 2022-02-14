var canvas, ctx, turn=1, count=0, mycolor=0;
stonelist = [];
for(var i = 0; i < 8; ++i) stonelist[i] = Array(8).fill(0);

var you = document.getElementById("you");
var turnplayer = document.getElementById("turn");

canvas = document.getElementsByTagName("canvas")[0];
ctx = canvas.getContext("2d");
canvas.width = canvas.height = 400;
(() => {
    ctx.fillStyle = "rgb(127,127,127)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
})();

gameInitialize();

function is_gameover() {
    var result = true;
    for(var i = 0; i < 8; ++i) {
        for(var j = 0; j < 8; ++j) {
            if(result) {
                result = result && (stonelist[i][j] != 0);
            }
        }
    }
    
    return result;
}

function gameover() {
    var black = 0, white = 0;
    for(var i = 0; i < 8; ++i) {
        for(var j = 0; j < 8; ++j) {
            if(stonelist[i][j] == 1) {
                black++;
            } else if(stonelist[i][j] == -1) {
                white++;
            }
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
        window.location = "../index.html"
    };
}

function is_skipped() {
    var result = false;
    for(var i = 0; i < 8; ++i) {
        for(var j = 0; j < 8; ++j) {
            if(stonelist[i][j] == 0) {
                result = result || is_reverse(i, j);
            }
        }
    }
    return !result;
}

function reverse(x, y) {
    for(var i = -1; i < 2; ++i) {
        for(var j = -1; j < 2; ++j) {
            if(!(i == 0 && j == 0)) {
                reverse_internal(x, y, i, j);
            }
        }
    }
}

function reverse_internal(x, y, dx, dy){
    if(x + dx >= 0 && x + dx <= 7
    && y + dy >= 0 && y + dy <= 7) {
        if(stonelist[x + dx][y + dy] == -turn) {
            var i = 2;
            do{
                if(x + dx * i < 0 || x + dx * i > 7
                || y + dy * i < 0 || y + dy * i > 7) {
                    return;
                }
                if(stonelist[x + dx * i][y + dy * i] == turn) {
                    for(var j = 0; j < i; ++j) {
                        stonelist[x + dx * j][y + dy * j] = turn;
                    }
                    return;
                } else if (stonelist[x + dx * i][y + dy * i] == 0) {
                    return;
                }
                i++;
            } while(i < 8);
        }
    }
}

function is_reverse(x, y) {
    var result = false;
    for(var i = -1; i < 2; ++i) {
        for(var j = -1; j < 2; ++j) {
            if(!(i == 0 && j == 0)) {
                result = result||is_reverse_internal(x, y, i, j);
            }
        }
    }
    return result;
}

function is_reverse_internal(x, y, dx, dy) {
    if(x + dx >= 0 && x + dx <= 7
    && y + dy >= 0 && y + dy <= 7) {
        if(stonelist[x + dx][y + dy] == -turn) {
            var i = 2;
            do{
                if(x + dx * i < 0 || x + dx * i > 7
                || y + dy * i < 0 || y + dy * i > 7) {
                    return false;
                }
                if(stonelist[x + dx * i][y + dy * i] == turn) {
                    return true;
                } else if(stonelist[x + dx * i][y + dy * i] == 0) {
                    return false;
                }
                i++;
            } while(i < 8);
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function turnChange() {
    turn *= (-1)
}
function stonelistInitialize() {
    for(i = 0; i < 8; ++i) {
        for(j = 0; j < 8; ++j) {
            stonelist[i][j] = 0;
        }
    }
}

function gameInitialize() {
    count = 0;
    stonelistInitialize();
    stonelist[3][3] = 1;
    stonelist[4][4] = 1;
    stonelist[3][4] = -1;
    stonelist[4][3] = -1;
    gameDisplay();
}

function gameDisplay() {
    ctx.fillStyle = "rgb(127,127,127)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(10,155,20)";
    ctx.fillRect(canvas.width / 6, canvas.height / 6,
                canvas.width * 4 / 6, canvas.height * 4 / 6);
    ctx.strokeStyle = "rgb(20,20,20)";
    for(var i = 1; i < 8; ++i) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 6 + canvas.width * 2 / 3 * i / 8, canvas.height / 6);
        ctx.lineTo(canvas.width / 6 + canvas.width * 2 / 3 * i / 8, canvas.height * 5 / 6);
        ctx.closePath();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(canvas.width / 6, canvas.height / 6 + canvas.height * 2 / 3 * i / 8);
        ctx.lineTo(canvas.width * 5 / 6, canvas.height / 6 + canvas.height * 2 / 3 * i / 8);
        ctx.closePath();
        ctx.stroke();
    }

    for(var i = 0; i < 8; ++i) {
        for(var j = 0; j < 8; ++j) {
            if(stonelist[i][j] != 0) {
                ctx.fillStyle = (stonelist[i][j] == 1)
                    ? "rgb(0,0,0)"
                    : "rgb(255,255,255)";
                ctx.beginPath();
                ctx.arc(canvas.width / 6 + canvas.width * 2 / 3 * (i + 0.5) / 8,
                canvas.height / 6 + canvas.height * 2 / 3 * (j + 0.5) / 8,
                canvas.width * 4 / 6 / 8 / 2 * 0.9,
                0, 2 * Math.PI, 0);
                ctx.fill();
            } else {
                if(is_reverse(i, j)) {
                    ctx.fillStyle = "rgba(144,144,22,"
                        + (Math.cos(count * Math.PI / 60) * 0.3 + 0.7) +
                    ")";
                    ctx.beginPath();
                    ctx.arc(canvas.width / 6 + canvas.width * 2 / 3 * (i + 0.5) / 8,
                    canvas.height / 6 + canvas.height * 2 / 3 * (j + 0.5) / 8,
                    canvas.width * 4 / 6 / 8 / 2 * 0.9,
                    0, 2 * Math.PI, 0);
                    ctx.fill();
                }
            }
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
                return "you are white.";
            case 0:
                return "watching...";
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

canvas.addEventListener("click", e => {
        
    if(turn == mycolor) {
        var rect = e.target.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        //console.log("x,y : ",x,y);
        var cx, cy;
        cx = Math.floor((x - canvas.width / 6) * 8 * 3 / 2 / canvas.width);
        cy = Math.floor((y - canvas.height / 6) * 8 * 3 / 2 / canvas.height);
        //console.log("cx,cy",cx,cy);

        if(is_reverse(cx, cy) && stonelist[cx][cy] == 0) {
            //reverse(cx,cy);
            //turnChange();
            socket.emit("I_put_stone", JSON.stringify({
                x:cx,
                y:cy,
                color:turn,
            }));
            //setLabel();            
        }
    }
});

socket.on("turnInitialize", (message) => {
    mycolor = message;
    console.log("my color : ", mycolor);
    setLabel();
});

socket.on("you_put_stone", (message) => {
    const{x, y, color} = JSON.parse(message);
    reverse(x, y);
    turnChange();
    setLabel();
    count = 0;
    
    //console.log("skipjudge : " + is_skipped());
    
    if(is_skipped()) {
        window.alert("置ける場所がありません。");
        turnChange();
    }
   
    if(is_gameover()) {
        gameover();
    }
});