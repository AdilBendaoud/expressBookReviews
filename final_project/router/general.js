const express = require('express');
let books = require("./booksdb.js");
let doesExist = require("./auth_users.js").doesExist;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password) {
    if (!doesExist(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }else{
    return res.status(404).json({message:"you should provide username and password"});
  }
});

// Get the book list available in the shop

const getBooks = ()=>{
  return new Promise((resolve,reject)=>{
    resolve(books);
  })
}

public_users.get('/',function (req, res) {
  getBooks().then(
    data=>res.send(JSON.stringify(data)),
    error => res.send('error : '+error)
  );  
});

// Get book details based on ISBN
const getBooksByIsbn = (isbn)=>{
  let book = books[isbn]; 
  return new Promise((resolve,reject)=>{
    if(book){
      resolve(book)
    }else{
      reject("Unable to find book!");
    }
  })
}

public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  getBooksByIsbn(isbn).then(
    data => res.send(JSON.stringify(data)),
    error => res.send('error : '+error)
  ); 
 });
  
// Get book details based on author
const booksFilter = (filerBy,value)=>{
  let output = [];
  return new Promise((resolve,reject)=>{
    for (var key in books) {
      let book = books[key];
      if(filerBy === "author"){
        if (book.author === value){
          output.push(book);
        }
      }else{
        if (book.title === value){
          output.push(book);
        }
      }
    }
    resolve(output);  
  })
}

public_users.get('/author/:author',function (req, res) {
  booksFilter("author",req.params.author).then(
    data =>res.send(JSON.stringify(data))
  );
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  booksFilter("title",req.params.title).then(
    data =>res.send(JSON.stringify(data))
  );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let reviews = books[isbn].reviews;
  return res.status(200).json({reviews: JSON.stringify(reviews)});  
});

module.exports.general = public_users;
