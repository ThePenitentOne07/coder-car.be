const { sendResponse, AppError } = require("../helpers/utils.js");

const car = require("../models/Car.js");

const carController = {};
//Create a car
carController.createCar = async (req, res, next) => {
  //in real project you will getting info from req

  try {
    const info = req.body;

    //always remember to control your inputs
    if (!info) throw new AppError(402, "Bad Request", "Create car Error");
    //mongoose query
    const created = await car.create(info);
    sendResponse(
      res,
      200,
      true,
      { car: created },
      null,
      "Create Car Successfully"
    );
  } catch (err) {
    next(err);
  }
};

//Get all car
carController.getCars = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query; // Get page and limit from query params, with defaults
  const filter = {}; // You can modify this filter based on conditions from req

  try {
    const count = await car.countDocuments(filter); // Get total count of cars matching the filter
    const listOfFound = await car
      .find(filter)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)); // Apply pagination

    const totalPages = Math.ceil(count / parseInt(limit));

    if (!listOfFound.length) {
      return sendResponse(res, 404, false, null, "No cars found", "No cars found with the specified criteria");
    }

    sendResponse(
      res,
      200,
      true,
      {
        car: listOfFound,
        message: "Get Car List Successfully!",
        page: page.toString(),
        total: totalPages,
      },
      null,
      null
    );
  } catch (err) {
    next(err);
  }
};

//Update a car
carController.editCar = async (req, res, next) => {
  // Get the ID of the car to update from the request parameters
  const targetId = req.params.id;

  // Get the update information from the request body
  const updateInfo = req.body;

  // Validate that targetId and updateInfo are provided
  if (!targetId || Object.keys(updateInfo).length === 0) {
    return next(new AppError("Invalid update information or target ID", 400));
  }

  // Options allow you to modify the query. 'new: true' returns the latest update of the data
  const options = { new: true };

  try {
    // Mongoose query to find the car by ID and update it with the provided information
    const updatedCar = await car.findByIdAndUpdate(targetId, updateInfo, options);

    if (!updatedCar) {
      return next(new AppError("Car not found", 404));
    }

    sendResponse(res, 200, true, { car: updatedCar }, null, "Update Car Successfully!");
  } catch (err) {
    next(err);
  }
};

//Delete car
carController.deleteCar = async (req, res, next) => {
  // Get the ID of the car to delete from the request parameters
  const targetId = req.params.id;

  // Validate that targetId is provided
  if (!targetId) {
    return next(new AppError("Invalid car ID", 400));
  }

  try {
    // Mongoose query to find the car by ID and delete it
    const deletedCar = await car.findByIdAndDelete(targetId);

    if (!deletedCar) {
      return next(new AppError("Car not found", 404));
    }

    sendResponse(res, 200, true, { car: deletedCar }, null, "Delete Car Successfully!");
  } catch (err) {
    next(err);
  }
};

//export
module.exports = carController;
