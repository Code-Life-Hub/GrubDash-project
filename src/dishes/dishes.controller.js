const { useParams } = require("express");
const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");
const { use } = require("./dishes.router");
// Use the existing dishes data
// Use this function to assign ID's when necessary
// TODO: Implement the /dishes handlers needed to make the tests pass
// add handlers and middleware functions to create, read, update, and list dishes. Note that dishes cannot be deleted.


function create (req, res, next) {
    const { data: { name, description, price, image_url } = {} }
    = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });

}

function read (req, res, next) {
    res.json({ data: res.locals.dish });
}

function update(req, res, next) {
    const dish = res.locals.dish;
    const {
      data: { id, name, description, price, image_url } = {},
    } = req.body;
  
    if (id && id !== dish.id) {
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${req.params.dishId}`,
      });
    }
  
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
  
    res.json({ data: dish });
  }

function list (req, res, next) {
    res.json({ data: dishes });
}

function dishExists (req, res, next) {
    const { dishId } = req.params
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found: ${dishId}`,
    });
}

function isValidDish (req, res, next) {
    const { data: { name, description, price, image_url } = {} }
    = req.body;
    if (!name || name === "") {
        return next({
            status: 400,
            message: "Dish must include a name",
        });
    }
    if (!description || description === "") {
        return next({
            status: 400,
            message: "Dish must include a description",
        });
    }
    if (!price || price === "") {
        return next({
            status: 400,
            message: "Dish must include a price",
        });
    }
    if (price <= 0 || typeof price !== "number") {
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        });
    }
    if (!image_url || image_url === "") {
        return next({
            status: 400,
            message: "Dish must include a image_url",
        });
    }
    next();
}

module.exports =  {
    create: [isValidDish, create],
    read: [dishExists, read],
    update: [dishExists, isValidDish, update],
    list,
};






