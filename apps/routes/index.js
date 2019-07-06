const express = require("express");
const router = express.Router();

router.use("/data", require("./data"));
router.use("/qcm", require("./qcm"));
router.use("/ta", require("./ta"));
router.use("/", require("./base"));
router.use(express.static('apps/static'));

module.exports = router;