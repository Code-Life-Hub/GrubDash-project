const path = require("path");
const express = require("express");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
// Add middleware and handlers for orders to this file, then export the functions for use by the router.
// add handlers and middleware functions to create, read, update, delete, and list orders. orders may be deleted.

function destroy(req, res, next) {
  const { orderId } = req.params;
  const orderIndex = orders.findIndex((order) => order.id === orderId);

  if (orderIndex === -1) {
    return next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
  }

  const order = orders[orderIndex];

  if (order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }

  orders.splice(orderIndex, 1);

  res.sendStatus(204);
}

function create (req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} }
    = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function read (req, res, next) {
    res.json({ data: res.locals.order });
}

function update(req, res, next) {
  const { orderId } = req.params;
  const order = orders.find((order) => order.id === orderId);

  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }

  if (!order) {
    return next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
  }

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}


function list (req, res, next) {
    res.json({ data: orders });
}

function orderExists (req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order id not found: ${orderId}`,
    });
}

function isValidOrder (req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} }
    = req.body;
    if (!deliverTo || deliverTo === "") {
        next({
            status: 400,
            message: "Order must include a deliverTo",
        });
    }
    if (!mobileNumber || mobileNumber === "") {
        next({
            status: 400,
            message: "Order must include a mobileNumber",
        });
    }
    if (!dishes) {
        next({
            status: 400,
            message: "Order must include a dish",
        });
    }
    if (!Array.isArray(dishes) || dishes.length === 0) {
        next({
            status: 400,
            message: "Order must include at least one dish",
        });
    }
    dishes.forEach((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity !== "number") {
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`,
            });
        }
    }
    );
    res.locals.order = {
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    next();
}

function isValidStatus (req, res, next) {
    const { data: { status } = {} }
    = req.body;
    if (!status || status === "" || status === "invalid") {
        next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
        });
    }
    if (status === "delivered") {
        next({
            status: 400,
            message: "A delivered order cannot be changed",
        });
    }
    res.locals.order.status = status;
    next();
}

function isPending(req, res, next) {
  const order = res.locals.order;
  if (order.status === "pending") {
    next();
  } else {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
}

module.exports = {
    create: [isValidOrder, create],
    read: [orderExists, read],
    update: [orderExists, isValidOrder, isValidStatus, update],
    destroy: [orderExists, isPending, destroy],
    list,
};

