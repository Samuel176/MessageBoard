import express from "express";
import {dirname} from "path";
import{fileURLToPath} from "url";
import bodyParser from "body-parser";
import multer from "multer";
import cookieParser from "cookie-parser";
import path from 'path';

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

const messages = [
  {
  id: 1795,
  userId: 1234,
  user: 'UserName1 ',
  subject: 'test 1 ',
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  image: 'images/uploads/test.jpeg'
},
{
  id: 2341,
  userId: 1234,
  user: 'testname ',
  subject: "What's the worst hotel in the UK you've ever stayed in?",
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  image: null
}
];

const comments = [{
  userId: 1234,
  messageId: 1795, 
  idComment: 123,
  user: "user  1234",
  text: "wow so cool",
}];
const userName = [];
const topics = [
  "Criminals? Should They Be President?",
  "Is Italian food overRated??"
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/images/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const imageUpload = multer({ storage: storage });

const randomIndex = Math.floor(Math.random() * topics.length);
const randomTopic = topics[randomIndex];


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", (req, res) => {
  const userId = req.cookies.userId;
  const userNumberId = req.cookies.userNumberId;
  const firstVistit = false;
  if(!userId){
    userId = generateUserName();
    userNumberId = generateUserName();
    firstVistit = true;
    res.cookie('userId', userId,  {httpOnly: true})
    res.cookie('userNumberId', userNumberId,  {httpOnly: true})
    
  };

  console.log(userId)
  res.render(__dirname + "/views/index.ejs", { messages: messages, comments: comments, userName: userName, randomTopic, userId, userNumberId, firstVistit });
});

// userName
app.post("/userName", (req, res) =>{
  const newName = req.body.user || req.cookies.userId;
  res.cookie('userId', newName, { httpOnly: true });
  console.log(newName);
  res.redirect("/");
})


// message ID generate
function generateID(){
  return Math.floor((Math.random() * 10000) + 1);
};
function generateUserName(){
  return "User " + Math.floor((Math.random() * 10000) + 1);
}
function generateCommentID(){
  return Math.floor((Math.random() * 10000) + 1);
};

// view posts page navbar 
app.get("/posts", (req, res) =>{
  res.render(__dirname + "/views/posts.ejs", { messages: messages, comments: comments, userName: userName, randomTopic });
})

// view contact navbar
app.get("/contact", (req, res) =>{
  res.render(__dirname + "/views/contact.ejs");
})

// view message
app.get("/messages/:id", (req, res) => {
  const messageId = parseInt(req.params.id);
  const message = messages.find(msg => msg.id === messageId);
  const userNumberId = req.cookies.userNumberId;

  if (message) {
    res.render("message", { message, comments, userNumberId});
    
   
  } else {
    res.status(404).send("Message not found");
  }
});



// message post
app.post("/submit", imageUpload.single("imageFile"), (req, res) => {
  const imagePath = req.file ? `images/uploads/${req.file.filename}` : null;
  const id = generateID();
  let user = req.body.user || req.cookies.userId;
  let userId = req.cookies.userNumberId
  const message = {
      id,
      userId,
      user,
      subject: req.body.subject,
      image: imagePath,
      text: req.body.text,
    };
    messages.unshift(message);
    res.redirect("/");
  });

  // comment post
app.post("/comment/:id", (req, res) => {
  const messageId = parseInt(req.params.id);
  const messageExists = messages.some(message => message.id === messageId);
  let userId = req.cookies.userNumberId
  let user = req.body.userComment || req.cookies.userId;

  if (messageExists) {
    const commentId = generateCommentID();
    const comment = {
      userId: userId,
      messageId: messageId, 
      idComment: commentId,
      user,
      text: req.body.textComment,
    };
    comments.unshift(comment);
    res.redirect(`/messages/${messageId}`);

  }else{

    res.redirect("/");
    console.log("not found")
  }
});

// edit post
app.post("/edit/:id", (req, res) =>{
  const idToEdit = parseInt(req.params.id);
  const indexToEdit = messages.findIndex(message => message.id === idToEdit);
  const originalMessage = messages[indexToEdit];
  let user = originalMessage.user;


  if(originalMessage.userId === req.cookies.userNumberId ){
    const newMessage = {
      id : idToEdit,
      user: originalMessage.user,
      subject: req.body.subjectEdit || originalMessage.subject,
      text: req.body.textEdit || originalMessage.text,
      image: originalMessage.image
  };

  messages.splice(indexToEdit, 1, newMessage);
  };
  
  
  res.redirect("/");
});

// delete post
app.post("/delete/:id", (req, res) => {
  const idToRemove = parseInt(req.params.id);
  const messageToRemove = messages.find(message => message.id === idToRemove);

  if (messageToRemove && req.cookies.userNumberId === messageToRemove.userId) {
    const index = messages.indexOf(messageToRemove);
    if (index !== -1) {
      messages.splice(index, 1);
    }
  } else {
    console.log("no no no, that won't work");
  }

  res.redirect("/");
});

// comment delete
app.post("/commentDelete/:id", (req, res) =>{
  const idToRemove = parseInt(req.params.id);
  const commentToRemove = comments.find(comment => comment.messageId === idToRemove)
  
  if(commentToRemove.userId && req.cookies.userNumberId === commentToRemove.userId){
    const index = comments.indexOf(commentToRemove)
    if(index !== -1){
      comments.splice(index, 1)
    }
  }else{
    console.log("failed!")
  }

  res.redirect('back');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });