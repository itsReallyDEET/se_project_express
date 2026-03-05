const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 30 },
  avatar: {
    type: String,
    required: [true, "Avatar field is required."],
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "You must provide a valid URL for the avatar",
    },
  },
});

module.exports = mongoose.model("user", userSchema);
