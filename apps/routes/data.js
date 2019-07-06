const router = require("express").Router();

router.get("/:idList?", require("../controllers/data_c"));

module.exports = router;