const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  registerDevice,
  unregisterDevice,
  getAllDevices,
} = require("../controllers/deviceController");

router.use(auth);
router.post("/register", registerDevice);
router.post("/unregister", unregisterDevice);
router.get("/all", getAllDevices);

module.exports = router;
