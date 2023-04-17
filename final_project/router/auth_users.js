const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}
const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  console.log(users)
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "There's an Error in loging in!"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User has been successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login Credentials. Check  the username and password"});
  }
});
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
      let review= req.query.review;
      let isbn = req.params.isbn;

      // get the username
      let session= req.session;
      let username= session && session.authorization['username'] ? session.authorization['username'] : null;
      if (isbn in books) {
        if (username in books[isbn].reviews) {
          books[isbn].reviews[username] = review;
        } else {
          console.log("before ",books[isbn].reviews[username])
          books[isbn].reviews[username] = review;
          console.log("after ",books[isbn])
        }
        return res.status(300).json({message: "Successfully updated the database."});
      }
      else {
        res.status(404).json({message: 'Book is not found'});
      }
    }
);

regd_users.delete("/auth/review/:isbn", (req, res) => {
      let isbn = req.params.isbn;

      // get the username
      let session= req.session;
      let username= session && session.authorization['username'] ? session.authorization['username'] : null;
      if (isbn in books) {
        if (username in books[isbn].reviews) {
          delete books[isbn].reviews[username] ;
          res.status(200).json({ message: "Review has been deleted." });
        } else {
          res.status(404).json({ message: "Review not found" });
        }

      }
      else {
        res.status(404).json({message: 'Book is not found. Please check again.'});
      }
    }
);

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
