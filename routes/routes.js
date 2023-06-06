const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const userModel = require("../model/users.js");

router.post("/signup", async (req, res) => {
  try {
    const data = {
      username: req.body.username,
      password: req.body.password,
    };
    //finds if already user
    const existingUname = await userModel.findOne({
      username: req.body.username,
    });
    if (existingUname) {
      return res.status(400).json({ message: "This user already registered" });
    }

    await userModel.insertMany([data]);
    return res.status(201).json({ message: "User registred successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Error" });
  }
});

//Login

router.get("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!password) {
      return res
        .status(401)
        .json({ message: "Authentication failed: Invalid password" });
    } else {
      const token = jwt.sign(
        { username: user.username },
        "secret", // Replace with your own secret key
        { expiresIn: "1h" }
      );

      return res.json({ token });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error" });
  }
});

module.exports = router;
