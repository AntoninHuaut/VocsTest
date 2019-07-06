const router = require("express").Router();

router.get("/", require("../controllers/ta_c"));

module.exports = router;