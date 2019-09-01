const mysql = require('mysql2/promise');
const CronJob = require('cron').CronJob;
const apps = require('../apps');
const config = require('../config.json');

new CronJob('0 0 */1 * * *', reloadWords, null, false, 'Europe/Paris');
reloadWords();

async function reloadWords() {
    console.log("[" + new Date().toLocaleString() + "] Updating words");

    let con = await mysql.createPool({
        host: config.sql.host,
        database: config.sql.database,
        user: config.sql.user,
        password: config.sql.password,
        waitForConnections: true
    });

    let tempWords = {};

    let resultExtra = (await con.query("select * from words_type"))[0];
    let result = (await con.query("(select '.1A' as data_type, min(id) as value1, max(id) as value2 from words where type = 3 or type = 4 group by '1A') union " +
        "(select '.2A', min(id), max(id) from words where type = 5 or type = 6 group by '2A') union " +
        "(select type, lettres, nom from type where type < 3) union " +
        "(select type, id, null from words_type group by type) order by data_type asc"))[0];

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

    apps.setWords(tempWords);
}

function initSub(tempWords, index) {
    tempWords[index] = {};
    tempWords[index].infos = {};
    tempWords[index].data = {};
    tempWords[index].infos.idList = index;
    tempWords[index].infos.min = -1;
    tempWords[index].infos.max = -1;
}