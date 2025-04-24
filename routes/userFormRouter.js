const formRouter = require("express").Router()
const {saveUserInputs,getAllUserInputs,FormCount,DeleteEnquiry} =  require("../controllers/userFormController")

formRouter.post("/submit",saveUserInputs);
formRouter.get("/getAllUserInputs",getAllUserInputs)
formRouter.get("/TotalForms",FormCount)
formRouter.delete("/delete",DeleteEnquiry)

module.exports = formRouter; 

