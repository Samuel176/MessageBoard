import express from "express";
import {dirname} from "path";
import{fileURLToPath} from "url";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

const messages = [
  {
  id: 1795,
  user: 'UserName1 ',
  subject: 'test 1 ',
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
}
];
const comments = [];
const userName = [];
const topics = [
  "Criminals? Should They Be President?",
  "War in Ukraine?",
  "Abortion Up To 1095 Weeks?",
  "The Enviroment. Is it dying or just not trying hard enough",
  "Immigrants, Should They Just Go Home?",
  "The Church, A Force For Good Or A Bunch Of Nonces"
];
const randomIndex = Math.floor(Math.random() * topics.length);
const randomTopic = topics[randomIndex];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", (req, res) => {
  res.render(__dirname + "/views/index.ejs", { messages: messages, comments: comments, userName: userName, randomTopic });
});

// message ID generate
function generateID(){
  return Math.floor((Math.random() * 10000) + 1);
};
function generateUserName(){
  return "User " + Math.floor((Math.random() * 10000) + 1);
}
function generateCommentID(){
  return comments.length;
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

  if (message) {
    res.render("message", { message: message, comments: comments.filter(comment => comment.messageId === messageId) });
  } else {
    res.status(404).send("Message not found");
  }
});

// message post
app.post("/submit", (req, res) => {
  const id = generateID();
  let user = req.body.user || generateUserName();
  const message = {
      id,
      user,
      subject: req.body.subject,
      text: req.body.text,
    };
    messages.unshift(message);
    res.redirect("/");
    console.log(messages)
  });

  // comment post
app.post("/comment/:id", (req, res) => {
  const messageId = parseInt(req.params.id);
  const messageExists = messages.some(message => message.id === messageId);
  let user = req.body.userComment || generateUserName();
  if (messageExists) {
    const commentId = generateCommentID();
    const comment = {
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
  let user = req.body.userEdit || originalMessage.user;
  let subject = req.body.subjectEdit || originalMessage.subject;
  let text = req.body.textEdit || originalMessage.text;
  const newMessage = {
      id : idToEdit,
      user,
      subject,
      text,
  };
  messages.splice(indexToEdit, 1, newMessage);
  res.redirect("/");
});

// delete post
app.post("/delete/:id", (req, res) =>{
  const idToRemove = parseInt(req.params.id);
  const indexToRemove = messages.findIndex(message => message.id === idToRemove);
  messages.splice(indexToRemove, 1);
  res.redirect("/");
});
// comment delete. yet to be implamented
app.post("/commentDelete/:id", (req, res) =>{
  const idToRemove = parseInt(req.params.id);
  const indexToRemove = comments.findIndex(comment => comment.id === idToRemove);
  comments.splice(indexToRemove, 1);
  res.redirect("/");
});

app.post("/submit-contact", (req, res) =>{
  const{ name, email, comment} = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'adell4@ethereal.email',
        pass: 'uuQUK3W9ez4Wu6HRry'
    }
});
  let mailOptions = {
    from: email,
    to: 'adell4@ethereal.email',
    subject: 'New Contact Form Submission',
    text: `Name: ${name}\nEmail: ${email}\n\nComment: ${comment}`

  }

  transporter.sendMail(mailOptions, (err, info) =>{
    if(err){
      console.log(err)
      res.send('sending error');
    }else{
          console.log('Message sent: ' + info.response);
          res.json({ success: true, message: 'Form submitted successfully!' });
    }
  });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });