const express = require("express");

const app = express();

app.use(express.json());

const userRoutes = require("./routes/UserRoutes");
app.use(userRoutes);
app.use((req, res, next) => {
    console.log("Middleware 1 is running");
    next();
});
const TestUser = (req, res, next) => {
    const error = new Error("something went wrong");
    next(error);
};
app.get("/test-error", TestUser, (req, res) => {
    res.status(200).json({
        message: "handling error"
    });
});
const errorhandling = (err, req, res, next) => {
    res.status(500).json({
        message: "Server error",
        error: err.message
    });
};

app.use(errorhandling);
module.exports = app;