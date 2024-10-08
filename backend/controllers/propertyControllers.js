const Property = require("../models/propertyModel.js");
const asyncHandler = require("express-async-handler");
const express = require("express");
const Router = express.Router;
const router = Router();
const AppError = require("./../utils/AppError");
const multer = require("multer");
const sharp = require("sharp");

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image"))
    cb(new AppError(404, "The file is not type image"), false);
  else cb(null, true);
};
const upload = multer({ memoryStorage, fileFilter });
exports.uploadPropertyImage = upload.single("image");

const APImethods = require("../utils/APImethods.js");

exports.addProperty = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "agent") {
    return next(new AppError(403, "Only agents can add properties"));
  }

  const { title, propertyType, price, description, area, saleType } = req.body;
  if (!title || !propertyType || !price || !description || !area || !saleType) {
    return next(new AppError(400, "Please provide all the required fields"));
  }
  req.body.agent = req.user._id;
  const newProperty = await Property.create(req.body);

  req.user.managedProperties.push(newProperty._id);
  await req.user.save({ validateBeforeSave: false });

  if (req.file) {
    const fileName = `property-${Date.now()}-${newProperty._id}.jpg`;
    await sharp(req.file.buffer)
      .resize(500, 300)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(`public/img/properties/${fileName}`);
    newProperty.images = `img/properties/${fileName}`;
    await newProperty.save();
  }
  res.status(201).json({
    status: "success",
    property: newProperty,
  });
});

exports.editPropertyById = asyncHandler(async (req, res, next) => {
  const { id: property_Id } = req.params;
  if (!property_Id) {
    return next(new AppError(400, "No property ID provided"));
  }
  const managesProperty = req.user.managedProperties.some(
    (propertyId) => propertyId.toString() === property_Id
  );
  if (!managesProperty) {
    return next(new AppError(403, "You are not allowed to edit this property"));
  }

  const property = await Property.findById(property_Id);
  if (!property) {
    return next(new AppError(404, "Property not found"));
  }
  console.log(req);

  const {
    title,
    propertyType,
    price,
    description,
    location,
    bedrooms,
    bathrooms,
    area,
    status,
    virtualTour
  } = req.body;

  if (title) property.title = title;
  if (propertyType) property.propertyType = propertyType;
  if (price) property.price = price;
  if (description) property.description = description;
  if (location) property.location = location;
  if (bedrooms) property.bedrooms = bedrooms;
  if (bathrooms) property.bathrooms = bathrooms;
  if (area) property.area = area;
  if (status) property.status = status;
  if (req.file) {
    const fileName = `property-${Date.now()}-${property._id}.jpg`;
    await sharp(req.file.buffer)
      .resize(500, 300)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(`public/img/properties/${fileName}`);
    property.images = `img/properties/${fileName}`;
  }
  if (
    !title &&
    !propertyType &&
    !price &&
    !description &&
    !location &&
    !bedrooms &&
    !bathrooms &&
    !area &&
    !status &&
    !virtualTour &&
    !req.file
  ) {
    return next(
      new AppError(400, "Please provide at least one field to update")
    );
  }
  await property.save();
  res.status(200).json({
    status: "success",
    property,
  });
});

exports.getProperties = asyncHandler(async (req, res, next) => {
  const apimethods = new APImethods(Property.find(), req.query);
  apimethods.filter().sort().selectFields();

  const totalProperties = await apimethods.query.clone().countDocuments();
  apimethods.makePagination();

  const properties = await apimethods.query;
  if (!properties || properties.length === 0) {
    return next(new AppError(404, "No properties found"));
  }
  res.status(200).json({
    status: "success",
    totalProperties,
    properties,
  });
});

exports.getPropertyById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError(400, "No property ID provided"));
  }
  const property = await Property.findById(id).populate({
    path: "agent",
    select: "username email phone image",
  });
  if (!property) {
    return next(new AppError(404, "Property not found"));
  }
  res.status(200).json({
    status: "success",
    property,
  });
});


exports.deletePropertyById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError(400, "No property ID provided"));
  }
  const managesProperty = req.user.managedProperties.some(
    (propertyId) => propertyId.toString() === id
  );
  if (!managesProperty) {
    return next(
      new AppError(403, "You are not allowed to delete this property")
    );
  }
  const property = await Property.findByIdAndDelete(id);
  if (!property) {
    return next(new AppError(404, "Property not found"));
  }
  req.user.managedProperties.pull(property._id);
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message:
      "Property has been deleted and removed from your managed properties",
  });
});
