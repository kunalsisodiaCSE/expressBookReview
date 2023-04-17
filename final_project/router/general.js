const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const user_name = req.body.username;
  const pass_word = req.body.password;

  if (user_name && pass_word) {
    if (!isValid(user_name)) {
      users.push({"username":user_name,"password":pass_word});
      return res.status(200).json({message: "User registered without any problem. Proceed to login"});
    } else {
      return res.status(404).json({message: "User is already there bro!"});
    }
  }
  return res.status(404).json({message: "Registration attempt un-successful- unable to get username/password."});
});

// Wrap the asynchronous operation in a Promise
const getallBooks = new Promise((resolve, reject) => {
  if (Object.keys(books).length > 0) {
    resolve(books);
  } else {
    reject(new Error("Database: 'books' is empty."));
  }
});

// Get the book list available using promises
public_users.get('/', function(req, res) {
  getallBooks.then(function(books) {
    return res.status(300).json({message: JSON.stringify(books, null, 4)});
  }).catch(function(err) {
    return res.status(500).json({error: err.message});
  });
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

  getallBooks.then(function (books) {
    let isbn = req.params.isbn;
    if (isbn in books) {
      return res.status(300).json(books[isbn]);
    } else {
      return res.status(404).send('There is no book with the given ISBN number. Try again!');
    }

  }).catch(function (err) {
    return res.status(500).json({error: err.message});
  });
});

// Get book details based on author
public_users.get('/author/:author', function(req, res) {
  const author = req.params.author;
  const authorSignedBooks = [];
  const getBooks_author = new Promise(function(resolve, reject) {
    for (const isbn in books) {
      const book = books[isbn];
      if (book.author === author) {
        authorSignedBooks.push(book);
      }
    }
    if (authorSignedBooks.length > 0) {
      resolve(authorSignedBooks);
    } else {
      reject(`No books found for author '${author}'`);
    }
  });

  // Handle the promise result
  getBooks_author
      .then(function(result) {
        return res.status(200).json({message: result});
      })
      .catch(function(error) {
        return res.status(404).json({error: error});
      });
});


// Get all books based on title
public_users.get("/title/:title",function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  const getBooksByTitle = new Promise(function(resolve, reject) {

    for (const isbn in books) {
      const book = books[isbn];
      if (book.title === title) {
        booksByTitle.push(book);
      }
    }
    if (booksByTitle.length > 0) {

      resolve(booksByTitle);
    } else {
      reject(`No books found with Title '${title}'`);
    }
  });

  // Handle the promise result
  getBooksByTitle
      .then(function(result) {
        return res.status(200).json({message: result});
      })
      .catch(function(error) {
        return res.status(404).json({error: error});
      });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn= req.params.isbn
  // Check if the book exist in the database = books as per isbn number
  if (isbn in books) {
    const bookreview = books[isbn].reviews;
    return res.status(300).json(bookreview);
  } else {
    // agar book nhi h to error 404 dega
    return res.status(404).send('Book is not found!');
  }
});


module.exports.general = public_users;
