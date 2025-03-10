const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists!" });
    }
    users.push({ username, password });
    res.status(201).json({ message: "User registered successfully!" });
});

public_users.get('/', function (req, res) {
    return res.status(200).json({ books });
});

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.status(200).json(books[isbn]);
    } else {
        res.status(404).json({ message: "Book not found!" });
    }
});

public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const result = Object.values(books).filter(book => book.author.toLowerCase() === author);
    
    if (result.length > 0) {
        res.status(200).json(result);
    } else {
        res.status(404).json({ message: "No books found for this author." });
    }
});

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const result = Object.values(books).find(book => book.title.toLowerCase() === title);

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(404).json({ message: "Book not found by this title." });
    }
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.status(200).json({ reviews: books[isbn].reviews });
    } else {
        res.status(404).json({ message: "No reviews found for this ISBN." });
    }
});
public_users.get('/async/books', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:6000/');
      res.status(200).json(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
      const isbn = req.params.isbn;
      const response = await axios.get(`http://localhost:6000/isbn/${isbn}`);
      res.status(200).json(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

public_users.get('/async/author/:author', (req, res) => {
  const author = req.params.author;
  axios.get(`http://localhost:6000/author/${author}`)
      .then(response => res.status(200).json(response.data))
      .catch(error => res.status(500).json({ message: "Error fetching books by author", error: error.message }));
});

public_users.get('/async/title/:title', (req, res) => {
  const title = req.params.title;
  axios.get(`http://localhost:6000/title/${title}`)
      .then(response => res.status(200).json(response.data))
      .catch(error => res.status(500).json({ message: "Error fetching books by title", error: error.message }));
});

module.exports.general = public_users;