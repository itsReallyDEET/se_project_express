const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const User = require("../models/user");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} = require("../errors/error");

// GET /users
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

// CREATE /users
const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;
  if (!password || !email) {
    return next(new BadRequestError("Email and password are required"));
  }

  return bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        avatar,
        email,
        password: hash,
      })
    )
    .then((user) => {
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      return res.status(201).send(userWithoutPassword);
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 11000) {
        next(new ConflictError("Email already exists"));
      } else if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid data"));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  return User.findById(_id)
    .orFail(() => {
      throw new NotFoundError("User not found");
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid user ID"));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        next(new UnauthorizedError("Incorrect email or password"));
      } else {
        next(err);
      }
    });
};

const updateProfile = (req, res, next) => {
  const { name, avatar } = req.body;
  const { _id } = req.user;

  return User.findByIdAndUpdate(
    _id,
    { name, avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(() => {
      throw new NotFoundError("User not found");
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid data"));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  login,
  updateProfile,
};
