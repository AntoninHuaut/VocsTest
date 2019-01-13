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

const tableName = ["words", "type"];
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

        con.query("SELECT * FROM ?? JOIN ?? using(type)", [tableName[0], tableName[1]], function (err, result, fields) {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
                let convertId = parseInt(result[i].id - 1).toString();
                if (!tempWords[result[i].type]) {
                    initSub(tempWords, result[i].type);
                    tempWords[result[i].type].infos.lettres = result[i].lettres;
                    tempWords[result[i].type].infos.nom = result[i].nom;
                }

                tempWords[result[i].type].data[convertId] = [];
                tempWords[result[i].type].data[convertId].push(result[i].en, result[i].fr);
            }

            // Creating 0-1-2 lists from others
            for (let idList = 0; idList < 3; idList++) {
                initSub(tempWords, idList);

                let idsList = Object.keys(tempWords);
                idsList.splice(0, idList + 1);

                if (idList == 1)
                    idsList.splice(2, 3);
                else if (idList == 2)
                    idsList.splice(0, 2);

                for (let i = 0; i < idsList.length; i++) {
                    if (i == 0)
                        tempWords[idList].data = JSON.parse(JSON.stringify(tempWords[idsList[i]].data));
                    else {
                        let idSemestre = idsList[i];
                        let keys = Object.keys(tempWords[idSemestre].data);

                        let index = parseInt(keys.find(function (element) {
                            return element;
                        }));

                        for (let j = index; j < (index + keys.length); j++)
                            tempWords[idList].data[j] = tempWords[idSemestre].data[j];
                    }
                }
            }

            for (let i = 0; i < 7; i++) {
                tempWords[i].infos.min = parseInt(Object.keys(tempWords[i].data).find(function (element) {
                    return element;
                }));

                tempWords[i].infos.max = tempWords[i].infos.min + Object.keys(tempWords[i].data).length - 1;
            }

            con.query("SELECT * FROM ?? where type < 3", [tableName[1]], function (err, result, fields) {
                if (err) throw err;

                for (let i = 0; i < result.length; i++) {
                    tempWords[result[i].type].infos.lettres = result[i].lettres;
                    tempWords[result[i].type].infos.nom = result[i].nom;
                }
            });

            words = tempWords;
        });
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