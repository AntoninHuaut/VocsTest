const router = require("express").Router();

router.get("/", require("../controllers/base_c"));

module.exports = router;