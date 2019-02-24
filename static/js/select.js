var data = [
    "Tous les mots (A-Z)",
    "Année 1 (A-M)",
    "Année 2 (N-Z)",
    "Semestre 1 (A-F)",
    "Semestre 2 (G-M)",
    "Semestre 3 (N-S)",
    "Semestre 4 (T-Z)"
];

var color = ["red", "orange", "amber", "khaki", "lime", "light-green", "green"];
var typeExo = 0;
var typeList = 0;
var typeTrad = 2;
var activeSound = true;

$('document').ready(function () {
    let btnList = $('#btnList');

    for (let i = 0; i < data.length; i++)
        btnList.append("<div class='alphabetCheck'><btn onclick='startMots(" + i + ")' class='w3-btn w3-" + color[i] + " " + (i == 2 ? "separateur" : "") + "'>" + data[i] + "</btn></div >");

    let baseInfosC = getCookie('baseInfos');

    if (basicCookieIsValid(baseInfosC)) {
        let baseInfos = parseObjectFromCookie(baseInfosC)
        typeTrad = baseInfos.typeTrad;
        typeList = baseInfos.typeList;
        activeSound = baseInfos.activeSound;
        updateType(0, baseInfos.typeExo);
    }

    $('.radioTypeTrad')[typeTrad].checked = true;
    $('.radioTypeList')[typeList].checked = true;
    $('.radioTypeExo')[typeExo].checked = true;
});

function updateType(type, index) {
    if (type == 0)
        typeExo = index;
    else if (type == 1)
        typeList = index;
    else if (type == 2)
        typeTrad = index;
}

function startMots(idList) {
    let baseJson = JSON.parse('{"idList": ' + idList + ', "typeTrad": ' + typeTrad + ', "typeList": ' + typeList + ', "typeExo": ' + typeExo + ', "activeSound": ' + activeSound + '}');
    createCookie("baseInfos", baseJson);

    let taInfosC = getCookie('taInfos');
    let jsonTaInfos = JSON.parse('{"record": 0, "success": 0, "fail": 0}');

    if (taInfosC) {
        jsonTaInfos = parseObjectFromCookie(getCookie('taInfos'));
        jsonTaInfos.success = 0;
        jsonTaInfos.fail = 0;
    }

    if (typeExo == 0) {
        createCookie("qcmInfos", JSON.parse('{"success": 0, "fail": 0}'));
        window.location.assign(window.location.origin + "/qcm");
    } else if (typeExo == 1) {
        createCookie("taInfos", jsonTaInfos);
        window.location.assign(window.location.origin + "/ta");
    }
}