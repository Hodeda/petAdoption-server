const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 8080;
const MongoUserName = process.env.DATABASE_USERNAME;
const MongoPass = process.env.DATABASE_PASS;

const userRouter = require("./routes/userRoutes");
const petsRouter = require("./routes/petRoutes");
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://pet-adoption-client-pearl.vercel.app",
    ],
  })
);
app.use(express.json());

const db = mongoose
  .connect(
    `mongodb+srv://${MongoUserName}:${MongoPass}@petapp.hc1r1hj.mongodb.net/PetAdoption`,
    { useNewUrlParser: true }
  )
  .then((d) => console.log("Connected to Database successfully."))
  .catch((err) => console.log("Couldn't connect to database."));

app.use("/users", userRouter);
app.use("/pets", petsRouter);

app.use("*", (req, res) =>
  res.status(404).json({ message: "Page not found." })
);

app.listen(PORT, () => {
  console.log("Server is listening on port 8080.");
});
