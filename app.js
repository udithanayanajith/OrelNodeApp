const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
const mDbConfig = require("./lib/mongoDB");
const router = require("./routes/routes");
const jwt = require("jsonwebtoken");
const DrugModel = require("./model/drugs");
const Drug = require("./model/drugs");

const userModel = require("./model/users");
app.use("/api", router);
mDbConfig();
//Check JWT

//////////////////////////Mongo DB
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(409).json({ message: "No token provided" });
  }

  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      return res.status(409).json({ message: "Failed to authenticate token" });
    }

    req.username = decoded.username;
    next();
  });
};

//view all mongo
app.get("/allDrugs", async (req, res) => {
  try {
    let allDrugs = await DrugModel.find({}, { _id: 1, gName: 1, dBrand: 1 });
    if (!allDrugs) {
      return res.status(422).json({ error: "Drugs list is empty" });
    }
    res.json(allDrugs);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

//add in mongo
app.post("/addDrugs", verifyToken, async (req, res) => {
  const data = {
    gName: req.body.d_name,
    dBrand: req.body.d_brand,
  };
  const tokenUsername = req.username;

  try {
    const check = await DrugModel.findOne({
      gName: req.body.d_name,
      dBrand: req.body.d_brand,
    });
    if (check) {
      return res.status(422).json({ error: "Drug already exists" });
    }
    await DrugModel.insertMany([data]);
    return res.status(201).json({
      message: "Drug inserted successfully fom user :" + tokenUsername,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error in server, Please check entered data" });
  }
});

//ViewAllOptions Mongo
app.get("/allOptions", async (req, res) => {
  try {
    const jsonResponse = { options: [] };
    const distinctNames = await DrugModel.distinct("gName");
    jsonResponse.options = jsonResponse.options.concat(distinctNames);
    const distinctBrands = await DrugModel.distinct("dBrand");
    jsonResponse.options = jsonResponse.options.concat(distinctBrands);
    res.json(jsonResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//SerarchAllDrugs InsideParams Mongo
app.get("/searchDrugs", async (req, res) => {
  try {
    let searchTerm = req.query.item;
    const serachDrug = await DrugModel.find({
      $or: [{ gName: searchTerm }, { dBrand: searchTerm }],
    });
    if (serachDrug && serachDrug.length > 0) {
      res.json(serachDrug);
    } else {
      return res
        .status(409)
        .json("There is no such kind of Drug name or brand");
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

//Update Drug Mongo
app.put("/updateDrug", async (req, res) => {
  // const id = req.query.id;
  const { id, d_name, d_brand } = req.body;
  try {
    const existingDrug = await Drug.findById(id);
    if (!existingDrug) {
      return res.status(409).json({ error: "Wrong ID " + id });
    }

    const duplicateDrug = await Drug.findOne({
      gName: d_name,
      dBrand: d_brand,
    });
    if (duplicateDrug) {
      return res.status(409).json({ error: "Drug already exists" });
    }

    existingDrug.gName = d_name;
    existingDrug.dBrand = d_brand;
    await existingDrug.save();

    return res.status(201).json({ message: "Drug updated successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Failed to update data into the database" });
  }
});

//Delete with Mongo
app.delete("/deleteDrug", verifyToken, async (req, res) => {
  const id = req.query.id;
  const tokenUsername = req.username;

  if (!id) {
    return res
      .status(400)
      .json({ error: "Drug ID is missing in the request query." });
  }

  try {
    const drug = await Drug.findById(id);

    if (!drug) {
      return res.status(404).json({ error: "Drug not found" });
    }

    await Drug.deleteOne({ _id: id });

    res.json({
      message: "Drug deleted successfully by user: " + tokenUsername,
    });
  } catch (error) {
    console.error("Error deleting drug:", error);
    res.status(500).json({ error: "Error deleting drug" });
  }
});

app.listen(port, () => {
  console.log("App is running on port :", port);
});
