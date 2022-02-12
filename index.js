const path=require("path");
const http=require("http");
const express=require("express");
const socketio=require("socket.io");
const formatMessage=require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}=require("./utils/users");

const app=express();
const server=http.createServer(app);
const io=socketio(server);

app.use(express.static(path.join(__dirname,"public")));

const botName="Othello Bot";

turncounter=Array(18).fill(0);
roomcounter=Array(18).fill(0);

io.on("connection",socket=>{
    socket.on("joinRoom",({username,room})=>{
        const user=userJoin(socket.id,username,room,0);

        socket.join(user.room);
        //console.log("user.room : "+user.room);
        var roomindex=parseInt((user.room).substring(5,6),10);
        //console.log("roomindex : "+roomindex+" "+typeof(roomindex));
        roomcounter[roomindex-1]++;
        //console.log("roomcounter : "+roomcounter);

        //var rm=io.sockets.adapter.rooms[user.room];
        //console.log("how many connected : "+Object.keys(io.sockets.connected).length);

        socket.emit("message",formatMessage(botName,"This is Othello game."));
      
        socket.broadcast
        .to(user.room)
        .emit(
            "message",
            formatMessage(botName,`${user.username} has joined the room.`)
        );

        if(roomcounter[roomindex-1]<=2){
            turncounter[roomindex-1]=(turncounter[roomindex-1]+1)%2;
            socket.emit("turnInitialize",turncounter[roomindex-1]%2==0?1:-1);
        }

        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });

    socket.on("chatMessage",msg=>{
        const user=getCurrentUser(socket.id);

        io.to(user.room).emit("message",formatMessage(user.username,msg));
    });
    
    socket.on("I_put_stone",msg=>{
        const {x,y,color}=JSON.parse(msg);
        const user=getCurrentUser(socket.id)
        
        io.to(user.room).emit("you_put_stone",msg);
    });

    socket.on("disconnect",()=>{
        const user=userLeave(socket.id);
        
        var roomindex=parseInt((user.room).substring(5,6),10);
        roomcounter[roomindex-1]--;
             
        if(user){
            io.to(user.room).emit(
                "message",
                formatMessage(botName,`${user.username} has left the room`)
            );

            io.to(user.room).emit("roomUsers",{
                room:user.room,
                users:getRoomUsers(user.room)
            });
        }
    });
});

const PORT=process.env.PORT||3000;

server.listen(PORT,()=>console.log(`Server running on port ${PORT}`));