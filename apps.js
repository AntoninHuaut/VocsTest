const express = require('express');
const mysql = require('mysql');
const CronJob = require('cron').CronJob;
const bodyParser = require('body-parser');

const config = require('./config.json');

/* typeTrad
    0 FR ==> EN
    1 FR <== EN
    2 FR <=> EN
*/

const con = mysql.createConnection({
    host: config.sql.host,
    database: config.sql.database,
    user: config.sql.user,
    password: config.sql.password
});

const app = express();

var words;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function reloadWords() {
    console.log("[" + new Date().toLocaleString() + "] Updating words");

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected successfully to the SQL database");

        let tempWords = {};

        let resultExtra;
        con.query("select * from words_type", function (err, result, fields) {
            if (err) throw err;
            resultExtra = result;
        });

        con.query("(select '.1A' as data_type, min(id) as value1, max(id) as value2 from words where type = 3 or type = 4 group by '1A') union " +
            "(select '.2A', min(id), max(id) from words where type = 5 or type = 6 group by '2A') union " +
            "(select type, lettres, nom from type where type < 3) union " +
            "(select type, id, null from words_type group by type) order by data_type asc",
            function (err, result, fields) {
                if (err) throw err;

                let limits = {
                    '0': [result[0].value1, result[1].value2],
                    '1': [result[0].value1, result[0].value2],
                    '2': [result[1].value1, result[1].value2]
                }

                for (let type = 0; type < 7; type++) {
                    if (type > 2) {
                        limits[type] = [];
                        let max = type == 6 ? result[1].value2 : result[type + 3].value1 - 1;
                        limits[type].push(result[type + 2].value1, max);
                    }

                    for (let motGet = 0; motGet < resultExtra.length; motGet++) {
                        if (motGet + 1 < limits[type][0] || motGet + 1 > limits[type][1])
                            continue;

                        else {
                            if (!tempWords[type]) {
                                initSub(tempWords, type);
                                tempWords[type].infos.lettres = type < 3 ? result[type + 2].value1 : resultExtra[motGet].lettres;
                                tempWords[type].infos.nom = type < 3 ? result[type + 2].value2 : resultExtra[motGet].nom;
                            }

                            tempWords[type].data[motGet] = [];
                            tempWords[type].data[motGet].push(resultExtra[motGet].en, resultExtra[motGet].fr);
                        }
                    }
                }

                for (let i = 0; i < 7; i++) {
                    tempWords[i].infos.min = parseInt(Object.keys(tempWords[i].data).find(function (element) {
                        return element;
                    }));

                    tempWords[i].infos.max = tempWords[i].infos.min + Object.keys(tempWords[i].data).length - 1;
                }
            });

        words = tempWords;
    });
}

function initSub(tempWords, index) {
    tempWords[index] = {};
    tempWords[index].infos = {};
    tempWords[index].data = {};
    tempWords[index].infos.idList = index;
    tempWords[index].infos.min = -1;
    tempWords[index].infos.max = -1;
}

new CronJob('0 0 */1 * * *', reloadWords, null, false, 'Europe/Paris');
reloadWords();

app.use('/data/:idList?', function (req, res, next) {
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
});

app.use('/qcm', function (req, res, next) {
    res.sendFile(__dirname + '/static/qcm.html');
});

app.use('/ta', function (req, res, next) {
    res.sendFile(__dirname + '/static/ta.html');
});

app.use('/', function (req, res) {
    res.sendFile(__dirname + '/static/select.html');
});

app.listen(config.port);