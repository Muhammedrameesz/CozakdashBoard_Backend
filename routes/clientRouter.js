const clientRouter = require("express").Router();
const {AddClients,getClients,EditClient,DeleteClients,TotalClients} = require("../controllers/clientControler");
const {verifyAdminToken} = require("../utils/AccessToken");
const upload = require("../middlewares/upload");

clientRouter.post("/addClients",verifyAdminToken,upload.single("clientLogo"),AddClients);
clientRouter.get("/getClients",getClients);
clientRouter.put("/editClients",upload.single("clientLogo"),verifyAdminToken,EditClient);
clientRouter.delete("/deleteClients",DeleteClients);
clientRouter.get("/TotalClients",TotalClients)

module.exports = clientRouter; 