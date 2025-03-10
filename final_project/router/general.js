const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.send(books[isbn]);
    }

    return res.status(404).json({message: "Book doesn't exist"});
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    const output = Object.values(books).filter(book => book.author === author);

    if (output.length > 0) {
        res.send(output);
    }

    return res.status(404).json({message: "Book doesn't exist"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const author = req.params.title;

    const output = Object.values(books).filter(book => book.title === title);

    if (output.length > 0) {
        res.send(output);
    }

   return res.status(404).json({message: "Book doesn't exist"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        const book = books[isbn];
        const review = book.reviews;
        res.send(review);
    }

    return res.status(404).json({message: "Book doesn't exist"});
});


// Get the book list by Promises
public_users.get('/' , async (req,res) => {
    try {
        const library = await new Promise((resolve,reject)=>{
            if (books) {
                resolve(books);
            } else {
                reject(new Error('Error fetching books'));
            }
        });

        return res.status(200).json(library);
    } catch (error) {
        res.status(404).json({message:'Error fetching books', error: error.message});
    }
});

// Get book details by promises
 public_users.get('/isbn/:isbn', async (req,res) => {
    const isbn = req.params.isbn;
 
    new Promise((resolve,reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    })
    .then((book) => {
        res.status(200).json(book)
    })
    .catch((error)=>{
        res.status(404).json({message:"Book not found"})
    })
 
 });

// Get book details with Promises
public_users.get('/author/:author', function(req,res) {
    const author = req.params.author;
 
    new Promise((resolve,reject) => {
        const foundBooks = Object.values(books).filter(book => book.author === author);
        if (foundBooks.length > 0) {
            resolve(foundBooks)
        } else {
            reject("0 books found")
        }
    })
    .then((foundBooks)=>{
        res.status(200).json(foundBooks);
    })
    .catch((error)=>{
        res.status(404).json({message:"no books found"});
    })
});

// Get books with Promises
public_users.get('/title/:title', function(req,res){
    const title = req.params.title;
 
    new Promise((resolve,reject) => {
        const booksFound = Object.values(books).filter(book => book.title === title);
        if (booksFound.length > 0) {
            resolve(booksFound);
        } else {
            reject("0 books found");
        }
    })
    .then((booksFound)=>{
        return res.status(200).json(booksFound);
    })
    .catch((error)=>{
        return res.status(404).json({message:"No books found"});
    })
});


module.exports.general = public_users;