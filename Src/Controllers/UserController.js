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
const getUser = async (req, res, next) => {
    const { page, limit, age, minAge, maxAge, role, sortBy, order, search } = req.query;
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    if (
        pageNumber < 1 ||
        limitNumber < 1 ||
        !Number.isInteger(pageNumber) ||
        !Number.isInteger(limitNumber)
    ) {
        return res.status(400).json({
            message: "Invalid page or limit value"
        });
    }
    const skip = (pageNumber - 1) * limitNumber;
    // const filter = age ? { age: Number(age) } : {};
    const filter = {}
    if (search !== undefined && (
        typeof search !== "string" ||
        search.trim().length === 0 ||
        search.trim().length > 50
    )) {
        return res.status(400).json({
            message: "Invalid search query"
        });
    }
    const searchText = typeof search === "string" ? search.trim() : "";

    const safeSearch = searchText.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
    if (safeSearch) {
        filter.$or = [
            { name: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } }
        ];
    }
    if (minAge || maxAge) {
        filter.age = {};

        if (minAge) {
            filter.age.$gte = Number(minAge);
        }

        if (maxAge) {
            filter.age.$lte = Number(maxAge);
        }
        if (age && !minAge && !maxAge) {
            filter.age = Number(age);
        }
    }
    if (
        (minAge && (!Number.isInteger(Number(minAge)) || Number(minAge) < 0)) ||
        (maxAge && (!Number.isInteger(Number(maxAge)) || Number(maxAge) < 0)) ||
        (minAge && maxAge && Number(minAge) > Number(maxAge))
    ) {
        return res.status(400).json({
            message: "Invalid age range"
        });
    }
    if (role && !["user", "admin"].includes(role)) {
        return res.status(400).json({
            message: "invalid role"
        })
    }
    if (role) {
        filter.role = role;
    }
    if (order && !["asc", "desc"].includes(order)) {
        return res.status(400).json({
            message: "invalid sorting order"
        })
    }
    const sortOrder = order === "asc" ? 1 : -1;
    const allowedSortFields = ["age", "name"];
    const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : "age";

    try {
        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limitNumber);
        const user = await User.find(filter)

            .skip(skip)
            .limit(limitNumber)
            .select("-password   -resetToken")
            // .sort({ age: -1 });
            .sort({ [sortField]: sortOrder })

        res.status(200).json({
            message: "read carefully",
            totalUsers: totalUsers,
            totalPages: totalPages,
            currentPage: pageNumber,
            users: user
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
const getUserStats = async (req, res, next) => {
    try {
        const result = await User.aggregate([
            {
                $match: {
                    status: "active"
                }
            },
            {
                $group: {
                    _id: "$role",
                    totalUser: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    role: "$_id",
                    totalUsers: 1
                }
            }

        ])
        res.status(200).json({
            message: "fetched succesfully",
            stats: result
        })
    }
    catch (err) {
        next(err)
    }
}

module.exports = { createUser, getUser, getUserById, patchUser, deleteUser, loginUser, refreshToken, forgetPassword, resetPassword, getUserStats } 