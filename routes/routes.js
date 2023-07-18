import express from 'express';
import { getFriend, getHome, getLastMessage, getSignUp, getUser, postAddFriend, postCurrentMessage, postLogin, postLogout, postSignUp, verifyUser } from '../controller/action.js';

const router = express.Router();

router.route('/').get(verifyUser,getHome)
router.route('/signup').get(getSignUp).post(postSignUp)
router.route('/user').get(verifyUser,getUser)
router.route('/friend').get(verifyUser,getFriend)
router.route('/lastMessage').get(verifyUser,getLastMessage)
router.route('/login').post(postLogin)
router.route('/currentmessage').post(verifyUser,postCurrentMessage)
router.route('/addfriend').post(verifyUser,postAddFriend)
router.route('/logout').post(verifyUser,postLogout)

export default router;