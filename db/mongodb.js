const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://soumen:k5Uu4iM5vBDdfvqv@cluster0.c5spa4r.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

exports= {mongoose}