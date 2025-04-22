const formRouter = require("express").Router()
const {saveUserInputs,getAllUserInputs,deleteUserInput,FormCount,DeleteEnquiry} =  require("../controllers/userFormController")

formRouter.post("/submit",saveUserInputs);
formRouter.get("/getAllUserInputs",getAllUserInputs)
formRouter.delete("/deleteUserInputs",deleteUserInput)
formRouter.get("/TotalForms",FormCount)
formRouter.delete("/delete/:id",DeleteEnquiry)

module.exports = formRouter; 

