const express = require("express");
const projectRouter = express.Router(); 
const {verifyAdminToken} = require("../utils/AccessToken");


const { AddProjects,getProjects,updateProjectStatus,DeleteProjects,EditProject,TotalProjects } = require("../controllers/projectController");
const upload = require("../middlewares/upload");


projectRouter.post("/AddProjects", upload.single("projectImage"),verifyAdminToken, AddProjects);
projectRouter.get("/getProjects",getProjects);
projectRouter.patch("/updateStatus",updateProjectStatus);
projectRouter.delete("/deleteProject",DeleteProjects);
projectRouter.put("/editProject", upload.single("projectImage"),verifyAdminToken,EditProject)
projectRouter.get("/TotalProjects",TotalProjects)

module.exports = projectRouter;
