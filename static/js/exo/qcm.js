var typeExo = 'qcm';

$('document').ready(function () {
    if (isOKDocReady(typeExo))
        start(typeExo);
});

function update(element, index) {
    let qcmInfosC = getCookie('qcmInfos');

    if (!qcmInfosC)
        redirectBase();

    let qcmInfos = parseObjectFromCookie(qcmInfosC);

    if (index == 0 || index == 1)
        ttsWord(json.data[idQuestion][0]);

    if (index == 0) {
        activeElement(false);
        let value = element.value;

        if (value == trads[1 - typeQuestion]) {
            qcmInfos.success += 1;
            showToast('Bonne réponse !', 1, 1000, null, typeExo, getNextIDQ(typeList, idQuestion));
        } else {
            qcmInfos.fail += 1;
            showToast('La réponse était:', 2, 2000, trads[1 - typeQuestion], typeExo, getNextIDQ(typeList, idQuestion));
        }

        createCookie("qcmInfos", qcmInfos);
        updateStats(typeExo);
    } else if (index == 1) {
        changeMot(getNextIDQ(typeList, idQuestion), typeExo);
    } else if (index == 2) {
        qcmInfos.success = 0;
        qcmInfos.fail = 0;
        createCookie("qcmInfos", qcmInfos);
        updateStats(typeExo);

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