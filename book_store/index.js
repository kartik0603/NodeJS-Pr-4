const express = require("express");

const Book = require("./book.schema");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

const connectDB = async () => {
    await mongoose.connect("mongodb://localhost:27017/book_store");
    console.log("connect to database");
};

// Middleware
const MissedFields = (req, res, next) => {
    const {
        title,
        author,
        category,
        publicationYear,
        price,
        quantity,
        description,
        imageUrl,
    } = req.body;
    if (
        !title ||
        !author ||
        !category ||
        !publicationYear ||
        !price ||
        !quantity ||
        !description ||
        !imageUrl
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }
    next();
};

app.get("/", (req, res) => {
    res.send("welcome to the book store");
});

// Getting Book
app.get("/books/book/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send("Book not found");
        }
        res.json(book);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete Book
app.delete("/book/delete/:id", (req, res) => {
    let { id } = req.params;
    Book.findByIdAndDelete(id, (err, data) => {
        if (err) {
            res.status(500).send(err.message);
        } else if (!data) {
            res.status(404).send("Book not found");
        } else {
            res.status(200).send(data);
        }
    });
});

// All Books
app.get("/books", (req, res) => {
    Book.find((err, books) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(books);
        }
    });
});

// Add New Book
app.post("/books/addbooks", MissedFields, (req, res) => {
    const newBook = new Book(req.body);
    newBook.save((err, book) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(201).json(book);
        }
    });
});

// Update Book
app.patch("/books/update/:id", (req, res) => {
    Book.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
        (err, updatedBook) => {
            if (err) {
                res.status(500).send(err.message);
            } else if (!updatedBook) {
                res.status(404).send("Book not found");
            } else {
                Book.find((err, books) => {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(books);
                    }
                });
            }
        }
    );
});

//   filter
app.get("/books/filter", async (req, res) => {
    try {
        const { author, category, title, price } = req.query;
        let filter = {};

        if (author) filter.author = author;
        if (category) filter.category = category;
        if (title) filter.title = title;

        let books = await Book.find(filter);

        if (price) {
            if (price === "lth") {
                books.sort((a, b) => a.price - b.price);
            } else if (price === "htl") {
                books.sort((a, b) => b.price - a.price);
            }
        }

        res.json(books);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(8090, () => {
    console.log("Server On 8090 ");
    connectDB();
});
