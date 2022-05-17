const express = require("express");
const router = express.Router();
const warehouseList = "public/data/warehouses.json";
const inventoryList = "public/data/inventories.json";
const bodyParser = require("body-parser");
const fs = require("fs");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
router.use(bodyParser.json());

//Full warehouse JSON file helper function
const pullData = (jsonPath) => {
  const dataJSON = fs.readFileSync(jsonPath);
  const data = JSON.parse(dataJSON);
  return data;
};

// PSG4- 21 - GET REQ FOR ALL INVENTORY
router.get("/", (_, res) => {
  res.json(pullData(inventoryList));
});

router.get("/:id", (req, res) => {
  const fullInventoryData = pullData(inventoryList);
  const selected = fullInventoryData.find((item) => item.id === req.params.id);

  res.json({
    itemName: selected.itemName,
    id: selected.id,
    description: selected.description,
    category: selected.category,
    status: selected.status,
    quantity: selected.quantity,
    warehouse: selected.warehouseName,
    warehouseId: selected.warehouseID,
  });
});

router.delete("/:id", (req, res) => {
  let fullInventoryData = pullData(inventoryList);
  let id = req.params.id;
  let index = fullInventoryData.findIndex((inventory) => inventory.id === id);
  let deletedInventory = fullInventoryData[index];
  res.send(deletedInventory);

  fullInventoryData.splice(index, 1);
  let inventorySrc = JSON.stringify(fullInventoryData, null, 2);
  fs.writeFile(inventoryList, inventorySrc, "utf8", function (err) {
    if (err) throw err;
  });
});

router.post("/", (req, res) => {
  const fullWarehouseData = pullData(warehouseList);
  const fullInventoryData = pullData(inventoryList);
  const selectedWarehouse = fullWarehouseData.find(
    (warehouse) => warehouse.name === req.body.warehouseName
  );
  const selectedId = selectedWarehouse.id;

  let newInventory = {
    id: uuidv1(),
    warehouseID: selectedId,
    warehouseName: req.body.warehouseName,
    itemName: req.body.itemName,
    description: req.body.description,
    category: req.body.category,
    status: req.body.status,
    quantity: req.body.quantity,
  };

  fullInventoryData.push(newInventory);
  let inventorySrc = JSON.stringify(fullInventoryData, null, 2);
  fs.writeFile(inventoryList, inventorySrc, "utf8", function (err) {
    if (err) throw err;
  });

  res.status(200).send(req.body);
});

router.put("/:id/edit", (req, res) => {
  let fullInventoryData = pullData(inventoryList);
  let id = req.params.id;
  let index = fullInventoryData.findIndex((inventory) => inventory.id === id);
  let warehouseID = req.body.warehouse;

  let updatedInventory = {
    id: id,
    warehouseID: warehouseID,
    warehouseName: req.body.warehouseName,
    itemName: req.body.itemName,
    description: req.body.description,
    category: req.body.category,
    status: req.body.status,
    quantity: req.body.quantity,
  };
  fullInventoryData[index] = updatedInventory;

  let inventorySrc = JSON.stringify(fullInventoryData, null, 2);
  fs.writeFile(inventoryList, inventorySrc, "utf8", function (err) {
    if (err) throw err;
  });
  res.send(updatedInventory);
});

module.exports = router;
