const router = require('express').Router();
const adminRouter = require('./adminRouter');
const projectRouter = require("./projectRouter")
const clientRouter = require("./clientRouter")
const formRouter = require("./userFormRouter")

router.use('/admin', adminRouter);
router.use("/projects",projectRouter)
router.use("/clients",clientRouter)
router.use("/userForm",formRouter)

module.exports = router;
