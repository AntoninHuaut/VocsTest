module.exports = async function (req, res) {
    res.sendFile(__basedir + '/static/ta.html');
}