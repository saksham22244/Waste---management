const Location = require("../models/location");
const multer = require("multer");
const path = require("path");


// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
      cb(null, `location-${Date.now()}${path.extname(file.originalname)}`);
    }
  });

  const upload = multer({ storage: storage });

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Error fetching locations" });
  }
};

exports.createLocation = async (req, res) => {
    try {
      const { name, description, coordinates } = req.body;
      const imageFilename = req.file.filename;
  
      const location = new Location({
        name,
        imageFilename,
        description,
        coordinates
      });
  
      await location.save();
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating location:", error);
      res.status(500).json({ message: "Error creating location" });
    }
  };