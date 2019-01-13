var json;

var idList;
var idQuestion = -1;
var typeQuestion;

var typeTrad;
var trads;

$('document').ready(function () {
    let baseInfosC = getCookie('baseInfos');

    if (baseInfosC && getCookie('qcmInfos')) {
        let baseInfos = parseObjectFromCookie(baseInfosC);
        idList = baseInfos.idList;
        typeTrad = baseInfos.typeTrad;

        updateStats();
        start();
    } else
        redirectBase();
});

function updateStats() {
    let qcmInfos = parseObjectFromCookie(getCookie('qcmInfos'));
    $('#success').text(qcmInfos.success);
    $('#fail').text(qcmInfos.fail);
    $('#total').text(qcmInfos.success + qcmInfos.fail);
}

function start() {
    if (!json)
        $.getJSON(window.location.origin + "/data/" + idList, function (data) {
            json = data;
            $('#listInfos').text(json.infos.nom + " (" + json.infos.lettres + ")");
            selectMot();
        });
    else
        selectMot();
}

function selectMot() {
    if (idQuestion < json.infos.min || idQuestion > json.infos.max) {
        changeMot(null)

        return;
    }

    trads = json.data[idQuestion];
    typeQuestion = typeTrad == 2 ? getRandomInt(1) : typeTrad;

    $('#question').text(trads[typeQuestion]);

    try {
        setValues(json.data);
    } catch (error) {
        console.log(error);

        setTimeout(function () {
            location.reload();
        }, 500);
    }
}

function update(element, index) {
    let qcmInfosC = getCookie('qcmInfos');

    if (!qcmInfosC)
        redirectBase();

    let qcmInfos = parseObjectFromCookie(qcmInfosC);

    if (index == 0) {
        activeElement(false);
        let value = element.value;

        if (value == trads[1 - typeQuestion]) {
            qcmInfos.success += 1;
            showToast('Bonne réponse !', 1, 1000, null, true);
        } else {
            qcmInfos.fail += 1;
            showToast('La réponse était:', 2, 2000, trads[1 - typeQuestion], true);
        }

        createCookie("qcmInfos", qcmInfos);
        updateStats();
    } else if (index == 1) {
        changeMot(null);
    } else if (index == 2) {
        qcmInfos.success = 0;
        qcmInfos.fail = 0;
        createCookie("qcmInfos", qcmInfos);
        updateStats();

        showToast('Stats réinitialisées', 1, 1500, null, false);
    } else if (index == 3)
        redirectBase();
}

function setValues(data) {
    var answers = [
        idQuestion
    ];

    for (let i = 1; i < 8; i++) {
        let valueID;

        do {
            valueID = getRandomQID(json);
        } while (valueID == idQuestion || answers.includes(valueID));

        answers[i] = valueID;
    }

    for (let i = 0; i < answers.length; i++)
        answers[i] = data[answers[i]][1 - typeQuestion];

    answers.sort();

    let doc = $("#list");
    $('select').children('option').remove();
    doc.append(new Option("Sélectionnez une réponse"), "default");
    let separateur = new Option("- - - Réponses: - - -", "separateur");
    separateur.disabled = true;
    doc.append(separateur);

    answers.forEach(function (ansValue) {
        doc.append(new Option(upFL(ansValue), ansValue));
    });
}

function changeMot(number) {
    if (number == null)
        do
            number = getRandomQID(json);
        while (number == idQuestion)

    idQuestion = number;

    console.log("idList", idList, " typeTrad", typeTrad, " idQuestion", idQuestion);

    activeElement(true);
    start();
}