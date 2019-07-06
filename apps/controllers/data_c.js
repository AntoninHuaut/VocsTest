module.exports = async function (req, res) {
    let words = require('../apps').getWords();
    
    if (!words) {
        res.send('{"error": "words not loaded"}');
        return;
    }

    let idList = req.params.idList;

    if (!idList) {
        res.send('{"error": "idList is undefined"}');
        return;
    } else if (!words[idList]) {
        res.send('{"error": "' + idList + ' does not exist"}');
        return;
    }

    res.send(words[idList]);
}