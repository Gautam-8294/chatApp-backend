import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const messageSchema = new mongoose.Schema({
    messageContent: String,
    time: String,
    timestamp: String,

})

const friendSchema = new mongoose.Schema({
    id: String,
    name: String,
    userId: {type: String},
    message: [messageSchema],//[{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
})

// const friendReq = new mongoose.Schema({
//     id: String,
//     userId: {type: String},
//     name: {type:String}
// })


const userSchema = new mongoose.Schema({
    id: {type: String, required: true, unique: true},
    userId: {type: String},
    // profileImg:
    // {
    //     data: Buffer,
    //     contentType: String
    // },
    name: {type:String},
    password: {type:String, required: true, select: false},
    friendReq: [{
    id: String,
    userId: {type: String, unique: true},
    name: {type:String}
}],
    friends: [{
        id: {type: String, required: true, unique: true},
        name: String,
        // userId: {type: String},
        message: [{
            messageContent: String,
            time: String,
            timestamp: String,
        
        }],//[{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
    }],//[{ type:  mongoose.Schema.Types.ObjectId, ref: 'Event' }],


    // message: String,
    // sender: Boolean,
})
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
}
})

const Message = mongoose.model('Message', messageSchema);
const Friend = mongoose.model('Friend', friendSchema);
const User = mongoose.model('User', userSchema);
// const FriendReq = mongoose.model('', userSchema);
export {Message, Friend, User};


