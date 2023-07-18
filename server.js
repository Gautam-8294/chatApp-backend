import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import {Server} from "socket.io"
import mongoose from "mongoose";
import router from './routes/routes.js'
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
dotenv.config();
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// mongodb+srv://gautam:@mnQJ4iYpUkdgKbsy@cluster0.uvgjk.mongodb.net/chatApp?authSource=admin&compressors=zlib&retryWrites=true&w=majority&ssl=true
const DB = process.env.MONGOURI;
const port = process.env.port || 5000;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    // origin: ["http://localhost:3000"],
    origin: ["https://chat-app-frontend-swart.vercel.app/"],
    methods: ["GET","POST"],
    credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("connection Successful");
}).catch((err) => {
    console.log(err);
});

app.use('/',router);



const server = app.listen(port, () => {
    console.log("server started at port 5000")
})

const io = new Server(server, {
    pingTimeout: 60000,
    cors:{
        // origin: "http://localhost:3000",
        origin: "https://chat-app-frontend-swart.vercel.app/",
        methods: ["GET","POST"],
        credentials: true
    },

});
io.engine.generateId
io.on("connection",(socket)=>{
    console.log("connected to socket.io");
    // console.log(socket.id);
    // console.log(socket.rooms);

    socket.on('setup', (userData)=>{
        socket.join(userData.id);
        console.log("Id is",userData.id);
        socket.emit("connected", "i m connected");
    });

    socket.on('join chat', (room)=>{
        socket.join(room);
        console.log("User joined room",room);
    })

    socket.on("new message",(newMessageRecieved)=>{
        socket.join(newMessageRecieved);
        console.log("this is",newMessageRecieved);
        socket.broadcast.in(newMessageRecieved.friendId).emit("message recieved", newMessageRecieved);
        socket.broadcast.in(newMessageRecieved.myId).emit("message recieved", newMessageRecieved);
    })
    socket.on("disconnect",()=>{
    })

});