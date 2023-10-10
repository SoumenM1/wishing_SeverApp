const mongoose = require("mongoose");

const userInformationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  image: {
    type: String, // Store the image path or URL
  },
});

module.exports = mongoose.model("UserInformation", userInformationSchema);

