import { Message, Friend, User } from '../model/userSchema.js';
import dotenv from "dotenv"
import jwt, { decode } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
dotenv.config();


let currentUser = {};

const JWT_SECRET = process.env.JWT_SECRET;


const verifyUser = async (req, res, next) => {
    const jwt_token = req.cookies.jwt_token;
    if (!jwt_token) {
        return res.json("Token is missing");
    } else {
        jwt.verify(jwt_token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.json("Error with Token");
            } else {
                next();
            }
        })
    }
}

const postLogout = async (req, res) => {
    const isLogout = req.body.isLogout;
    try {
        res.clearCookie("jwt_token");
        return res.status(200).redirect('/login');
    } catch (err) {
        console.log(err);
    }
}


const postAddFriend = async (req, res) => {
    const friendId = req.body.addFriend.friendId;
    const myId = req.body.myId;
    const myName = req.body.myName;
    try {
        await User.findOne({ id: friendId }).then(async(result) => {
            if (result) {
                const newFriend ={
                    id: result.id,
                    name: result.name,
                    message: [],};
                const newFriend1 ={
                    id: myId,
                    name: myName,
                    message: [],};
                await User.findOneAndUpdate({$and:[{id: myId},{"friends.id":{$ne: friendId}}]},{
                $push:{friends : newFriend}});
                await User.findOneAndUpdate({$and:[{id: friendId},{"friends.id":{$ne: myId}}]},{
                $push:{friends : newFriend1}});
                res.json({message:"Friend"});
            } else {
                res.status(422).json({ message: "User doesn't exist" });
            }
        }).catch(err => console.log(err));
    } catch (err) {
        console.log(err);
    }
}
const postCurrentMessage = async (req, res) => {
    try {
        let det;
        const messageCame = req.body;
        const decodedToken = jwt.decode(req.cookies.jwt_token, JWT_SECRET);
        console.log(messageCame);
        console.log(currentUser.id);

        const messCame ={
            messageContent: messageCame.currentmessage,
            time: messageCame.messagetime,
            timestamp: messageCame.messagetime,};
            if(messageCame.messageFrom === messageCame.messageTo){
                await User.findOneAndUpdate({$and:[{id : messageCame.messageFrom},{"friends.id":messageCame.messageTo}]}, {
                    $push: {
                    //   friends :{message: zero}
                      "friends.$.message" :messCame
                    },
                  },{ upsert: true });
            }else{
            await User.findOneAndUpdate({$and:[{id : messageCame.messageFrom},{"friends.id":messageCame.messageTo}]}, {
            $push: {
            //   friends :{message: zero}
              "friends.$.message" :messCame
            },
          },{ upsert: true });
          await User.findOneAndUpdate({$and:[{id : messageCame.messageTo},{"friends.id":messageCame.messageFrom}]}, {
            $push: {
              "friends.$.message" :messCame
            },
          },{ upsert: true });}

        res.json({ why: "mr" });


        

    }
    catch (err) {
        console.log(err);
    }
}

const getHome = async (req, res) => {
    try {
        
    }
    catch (err) {
        console.log(err);
    }
}

const getUser = async (req, res) => {
    // console.log(req.body);

    let decodedToken = jwt.decode(req.cookies.jwt_token, JWT_SECRET);
    // let decodedToken = atob(req.cookies.jwt_token.split('.')[1]);
    // const mess = await User.find({messages : { $exists: true }})
    try {
        await User.findOne({ id: decodedToken.email }).then((detail) => {

            currentUser = detail;
            // console.log("aditi", detail);
            res.json(detail);
        }).catch(err => { console.log(err); })
    }
    catch (err) {
        console.log(err);
    }
}



const getFriend = async (req, res) => {
    // console.log(req.body);

    let decodedToken = jwt.decode(req.cookies.jwt_token, JWT_SECRET);
    // let decodedToken = atob(req.cookies.jwt_token.split('.')[1]);
    try {
        await User.findOne({ id: decodedToken.email }).then((detail) => {
            res.json(detail.friends);
        }).catch(err => { console.log(err); })
    }
    catch (err) {
        console.log(err);
    }
}

const getSignUp = async (req, res) => {
    try {
        const info = await req.body;
        res.send({ info })
    }
    catch (err) {
        console.log(err);
    }
}

const postSignUp = async (req, res) => {

    const username = req.body.username
    const email = req.body.email;
    const password = req.body.password;
    const userId = req.body.userId;
    console.log(username, email, password);

    try {
        await User.findOne({ id: email }).then(async(result) => {
            if (result) {
                console.log("User already Exist");
                res.json({message: "User already Exist"})
            } else {
                let newUser = new User({
                    id: email,
                    name: username,
                    userId: userId,
                    password: password,

                });

                await newUser.save();
                res.json({message:"Signed Up Successfully"})

            }
        }).catch(err => console.log(err));
    }
    catch (err) {
        console.log(err);
    }


}



const postLogin = async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    try {
        const userLogin = await User.findOne({ id: email }).select('+password')
        if (userLogin) {
                const isMatch = await bcrypt.compare(password, userLogin.password);
                    if (isMatch) {
                        const jwt_token = jwt.sign({ email: userLogin.id }, JWT_SECRET, { expiresIn: "30d" });
                        res.cookie('jwt_token', jwt_token,{
                            httpOnly:true,
                            maxAge:3600000*5,
                            secure:true,
                            sameSite:'none',
                            domain:'thriving-daffodil-79b760.netlify.app'
                         });

                        res.send({ "jwt_token": jwt_token });
                    } else {

                        res.status(401).send({ message: "Wrong Credential" });
                        console.log("Wrong Credential");
                    }
            } else {
                console.log("User doesn't exist");
                res.status(422).json({ message: "User doesn't exist" });
            }

    }
    catch (err) {
        console.log(err);
    }
}




const getLastMessage = async (req, res) => {
    try {
        const lastMessage = await User.find({})
        res.send(lastMessage)
    }
    catch (err) {
        console.log(err);
    }
}


export { getHome, getUser, getLastMessage, getSignUp, postSignUp, postLogin, verifyUser, postCurrentMessage, postAddFriend, postLogout, getFriend };