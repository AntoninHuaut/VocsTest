const router = require("express").Router();

router.get("/", require("../controllers/qcm_c"));

module.exports = router;