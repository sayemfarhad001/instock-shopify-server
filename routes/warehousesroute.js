const express = require("express");
const router = express.Router();
const warehouseList = "public/data/warehouses.json";
const inventoryList = "public/data/inventories.json";
const fs = require("fs");
const crypto = require("crypto");
const emailvalidator = require("email-validator");
const validatePhoneNumber = require('validate-phone-number-node-js');

//Full warehouse JSON file helper function
const pullData = (jsonPath) => {
  const dataJSON = fs.readFileSync(jsonPath);
  const data = JSON.parse(dataJSON);
  return data;
};

//Warehouse datahelper function
const warehouseData = () => {
  let warehousesInfo = [];
  let warehouses = pullData(warehouseList);
  warehouses.forEach((warehouse) => {
    let warehouseData = {
      id: warehouse.id,
      name: warehouse.name,
      address: warehouse.address,
      city: warehouse.city,
      country: warehouse.country,
      "contact.name": warehouse.contact.name,
      "contact.position": warehouse.contact.position,
      "contact.phone": warehouse.contact.phone,
      "contact.email": warehouse.contact.email,
    };
    warehousesInfo.push(warehouseData);
  });

  return warehousesInfo;
};

//Format phone number function
function formatPhoneNumber(phoneNumberString) {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    var intlCode = (match[1] ? '+1 ' : '');
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
  }
  return null;
}

//GET request for full warehouse data
router.get("/", (_, res) => {
  res.json(pullData(warehouseList));
});

router.get("/:id", (req, res) => {
  const fullWarehouseData = pullData(warehouseList);
  const selected = fullWarehouseData.find(
    (warehouse) => warehouse.id === req.params.id
  );
  res.json({
    id: selected.id,
    name: selected.contact.name,
    warehouse: selected.name,
    position: selected.contact.position,
    address: selected.address,
    city: selected.city,
    country: selected.country,
    email: selected.contact.email,
    phone: selected.contact.phone,
  });
});

// PSG4- 23 - GET REQUEST FOR A WAREHOUSE
router.get("/:id/inventory", (req, res) => {
  const fullInventoryData = pullData(inventoryList);
  const selectedWarehouse = fullInventoryData.filter(
    (item) => item.warehouseID === req.params.id
  );
  res.send({ selectedWarehouse });
});

router.put("/:id/edit", (req, res) => {
  let fullWarehouseData = pullData(warehouseList);
  let id = req.body.id;
  let index = fullWarehouseData.findIndex((warehouse) => warehouse.id === id);
  if(validatePhoneNumber.validate(req.body.contact.phone)) {
    let phoneNumber = formatPhoneNumber(req.body.contact.phone);
  if(emailvalidator.validate(req.body.contact.email)){
  const editedWarehouse = {
    id: id,
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    country: req.body.country,
    contact: {
      name: req.body.contact.name,
      position: req.body.contact.position,
      phone: phoneNumber,
      email: req.body.contact.email,
    },
  };
  fullWarehouseData[index] = editedWarehouse;
  res.send(fullWarehouseData);
  const allData = fs.writeFile(
    warehouseList,
    JSON.stringify(fullWarehouseData, null, 2),
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
  return allData;
} else {
    res.status(400).send('Invalid Email')
}
} else {
    res.status(400).send('Invalid Phone Number')
}
});

router.post("/", (req, res) => {
  const fullWarehouseData = pullData(warehouseList);
  const id = crypto.randomBytes(16).toString("hex");
  if(validatePhoneNumber.validate(req.body.contact.phone)) {
    let phoneNumber = formatPhoneNumber(req.body.contact.phone);
  if(emailvalidator.validate(req.body.contact.email))  {
  const newWarehouse = {
    id: id,
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    country: req.body.country,
    contact: {
      name: req.body.contact.name,
      position: req.body.contact.position,
      phone: `+1 ${phoneNumber}`,
      email: req.body.contact.email,
    }
    }
  fullWarehouseData.push(newWarehouse);
  res.send(fullWarehouseData);
  const allData = fs.writeFile(
    warehouseList,
    JSON.stringify(fullWarehouseData, null, 2),
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
  return allData;
} else {
    res.status(400).send('Invalid Email')
}
} else {
    res.status(400).send('Invalid Phone Number')
}
});

// Delete a single warehouse, and all the inventories in that warehouse
router.delete("/:id", (req, res) => {
  // Removing from warehouse list
  let id = req.params.id;
  let warehouses = pullData(warehouseList);
  let inventory = pullData(inventoryList);
  let index = warehouses.findIndex((warehouse) => warehouse.id === id);

    warehouses.splice(index, 1);
    res.json(warehouseData(warehouses));
    const newObject = JSON.stringify(warehouses, null, 2);
    fs.writeFileSync(warehouseList, newObject, (err) => {
      if (err) {
        res.status(403).json("error, not found");
      }
    });
    // Removing all inventories associated with that inventory
    const rawInv = inventory.filter((item) => item.warehouseID !== id);
    // JSON stringify these arrays back
    const newInv = JSON.stringify(rawInv, null, 2);
    // fs writefiles
    fs.writeFileSync(inventoryList, newInv, (err) => {
      console.log("write success!");
      if (err) {
        res.status(403).json("error, not found");
      }
    });

});

module.exports = router;
