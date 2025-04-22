const adminRouter = require('express').Router();
const {
  adminSignUp,
  adminLogin,
  verifyAdmin,
  adminLogout,
  updateAdmin
} = require("../controllers/adminController");
const { verifyAdminToken } = require("../utils/AccessToken"); 

adminRouter.post("/signup", adminSignUp);
adminRouter.post("/login", adminLogin);
adminRouter.get("/verify", verifyAdminToken, verifyAdmin);
adminRouter.post("/logout", adminLogout);
adminRouter.put("/update",updateAdmin)

module.exports = adminRouter;
