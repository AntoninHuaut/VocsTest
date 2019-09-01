module.exports = async function (req, res) {
    let words = require('../apps').getWords();

    if (!words) return res.send({
        "error": "words not loaded"
    });

    let idList = req.params.idList;

    if (!idList) return res.send({
        "error": "idList is undefined"
    });
    else if (!words[idList]) return res.send({
        "error": "' + idList + ' does not exist"
    });

    res.send(words[idList]);
}