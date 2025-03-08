const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({username}, "access", { expiresIn: "1h" });
    req.session.accessToken = token;
    req.session.username = username;

    return res.status(200).json({ message: "Login successful", token: token });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    if (!req.session || !req.session.accessToken || !req.session.username) {
        return res.status(401).json({ message: "Unauthorized: Please login first" });
    }

    const username = req.session.username;  // 

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found!" });
    }

    books[isbn].reviews[username] = review;

    res.status(200).json({ message: "Review added/updated successfully!", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
