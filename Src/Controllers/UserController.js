const User = require("../models/user");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const createUser = async (req, res, next) => {
    const { name, email, age, password } = req.body
    if (!name || !email || !age || !password
    ) {
        return res.status(400).json({
            message: "all fileds are required"
        })
    }
    if (!email.includes("@") || !email.includes(".")) {
        return res.status(400).json({
            message: "email is not valid"
        })
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "password length must be at least 8 character"
        })
    }
    if (age < 18 || age > 60) {
        return res.status(400).json({
            message: "age must be between 18 to 60"
        })
    }
    // const password = req.body.password;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);


        // throw new Error("Test centralized error handling");
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "created successfully"
        });

    } catch (err) {
        next(err)
        // console.log(err);
        // res.status(500).json({
        //     message: "something went wrong"
        // });
    }
}
const getUser = async (req, res) => {
    try {

        const user = await User.find();

        res.status(200).json({
            message: "read carefully",
            user: user
        });

    } catch (err) {
        next(err)
        // res.status(500).json({
        //     message: "something went wrong"
        // });

    }
}

const getUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        // throw new Error("Testing centralized error handling");
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "invalid id"
            })
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                message: "user not found"
            })
        }
        //  res.status(200).json({
        //         message: "this is the new id",
        //         users: user
        //     });
    } catch (err) {
        next(err)
    }
}


const patchUser = async (req, res) => {
    const id = req.params.id;

    const user = await User.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
    );

    res.status(200).json({
        message: "updated",
        users: user
    });
}
const deleteUser = async (req, res) => {
    const id = req.params.id;

    const user = await User.findByIdAndDelete(id);

    res.status(200).json({
        message: "delete this id",
        users: user
    });

}
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({
            message: "invalid email"
        })

    }
    const MatchPassword = await bcrypt.compare(password, user.password);
    if (MatchPassword) {
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET
        )
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        )
        res.status(200).json({
            message: "login sucessfull",
            token: token,
            refreshToken: refreshToken
        })
    } else {
        res.status(401).json({
            message: "password invalid"
        })
    }


}
const refreshToken = async (req, res) => {

    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({
            message: "refresh token missing"
        })
    }
    try {
        const newRefresh = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );


        const user = await User.findById(newRefresh.userId)
        if (!user) {
            return res.status(401).json({
                message: "user not find out"
            })
        }


        const refreshAcessToken = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET
        )
        res.status(200).json({
            message: "Refresh Token",

            refreshAcessToken: refreshAcessToken
        })

    }

    catch (error) {
        res.status(401).json({
            message: "invalid"
        })
    }
}
const forgetPassword = async (req, res) => {
    const { email, } = req.body

    const user = await User.findOne({ email })
    if (!user) {
        return res.status(401).json({
            message: "invalid Email"
        })
    }
    const resetToken = jwt.sign(
        { user: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    )
    user.resetToken = resetToken,
        user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    res.status(200).json({
        message: "Reset token generated",

    });

}

const resetPassword = async (req, res) => {
    try {
        const { resetToken, password } = req.body
        const decoded = jwt.verify(
            resetToken,
            process.env.JWT_SECRET
        )
        const user = await User.findById(decoded.user);
        if (!user) {
            return res.status(401).json({
                message: "invalid"
            })
        }
        if (!user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
            return res.status(401).json({
                message: "reset token expired"
            })
        }
        if (user.resetToken !== resetToken) {
            return res.status(401).json({
                message: "invalid token"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save()
        res.status(200).json({
            message: "password reset successfully"
        })

    }
    catch (error) {
        return res.status(401).json({
            message: "invalid"
        })

    }
}

module.exports = { createUser, getUser, getUserById, patchUser, deleteUser, loginUser, refreshToken, forgetPassword, resetPassword }