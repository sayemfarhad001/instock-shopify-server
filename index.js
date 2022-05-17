const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
require("dotenv").config();

const port = process.env.PORT || process.argv[2] || 2000;
const warehouseRoutes = require("./routes/warehousesroute");
const inventoryRoute = require("./routes/inventoryroute");
const data = require('./public/data/inventories.json');

//Server test to see what methods are being called at which endpoints
app.use((req, _, next) => {
  console.log(`${req.method}: ${req.url}`);
  next();
});

//Node libraries to ensure pages load properly
app.use(express.json());
app.use(express.static("public"));

app.use(cors());
app.use(
  express.urlencoded({
    extended: true
  })
)
app.use("/warehouses", warehouseRoutes);
app.use("/inventories", inventoryRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})
