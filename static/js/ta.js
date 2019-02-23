var json;

var idList;
var idQuestion = -1;
var typeQuestion;

var typeList;
var typeTrad;
var trads;

var timer = new Timer();
var hasStart = false;

$('document').ready(function () {
    let baseInfosC = getCookie('baseInfos');

    if (basicCookieIsValid(baseInfosC) && getCookie('taInfos')) {
        let baseInfos = parseObjectFromCookie(baseInfosC);
        idList = baseInfos.idList;
        typeList = baseInfos.typeList;
        typeTrad = baseInfos.typeTrad;

        timer.addEventListener('secondsUpdated', function (e) {
            $('#timer').html(timer.getTimeValues().toString());
        });

        updateStats();
        start();
    } else
        redirectBase();
});

function countDown(countVal) {
    $('#timer').html('Début dans : <br /><span style="color:red;">' + countVal + '</span>');

    setTimeout(function () {
        if (countVal == 0) {
            start();
            timer.start({
                countdown: true,
                startValues: {
                    seconds: 90
                }
            });
            $('#timer').html(timer.getTimeValues().toString());
            hasStart = true;
        } else
            countDown(countVal - 1);
    }, countVal == 0 ? 0 : 1000);
}

function updateStats() {
    let taInfos = parseObjectFromCookie(getCookie('taInfos'));
    $('#success').text(taInfos.success);
    $('#fail').text(taInfos.fail);
    $('#total').text(taInfos.success + taInfos.fail);
    $('#record').text(taInfos.record);
}

function start() {
    if (!json)
        $.getJSON(window.location.origin + "/data/" + idList, function (data) {
            json = data;
            $('#listInfos').text(json.infos.nom + " (" + json.infos.lettres + ")");

            countDown(3);
        });
    else
        selectMot();

    $("#inputText").focus();
}

function selectMot() {
    if (idQuestion < json.infos.min || idQuestion > json.infos.max) {
        if (idQuestion != -1)
            showToast('Vous avez terminé la liste Retour au début', 1, 2500, null, false);

        changeMot(null);
        return;
    }

    trads = json.data[idQuestion];
    typeQuestion = typeTrad == 2 ? getRandomInt(1) : typeTrad;
    $('#question').text(trads[typeQuestion]);
}

function update(element, index, e) {
    let taInfosC = getCookie('taInfos');

    if (!taInfosC)
        redirectBase();

    let taInfos = parseObjectFromCookie(taInfosC);

    if (index == 0 && hasStart) {
        if (e.keyCode != 13)
            return;

        let value = element.value;

        if (value.length == 0)
            return;

        if (verifMot(value)) {
            taInfos.success += 1;
            showToast('Bonne réponse !', 1, 1000, null, false);
        } else {
            taInfos.fail += 1;
            showToast('La réponse était:', 2, 2000, trads[1 - typeQuestion], false);
        }

        element.value = '';
        createCookie("taInfos", taInfos);
        updateStats();
        changeMot(getNextIDQ(typeList, idQuestion));
        element.focus();
    } else if (index == 3)
        redirectBase();
}

function verifMot(value) {
    let answers = trads[1 - typeQuestion].replace(/ *\([^)]*\) */g, '').split(/\/|,/g);
    answers = answers.concat(trads[1 - typeQuestion].split(/\/|,/g));
    // Regex: Retrait de ce qui est entre parenthèse + split sur ',' et sur le '/'
    let result = false;

    answers.forEach(element => {
        console.log('Value: ' + value, ' comparaison à : ' + element, ' Ressemblance: ' + isSimilar(value, element));

        if (isSimilar(value, element) >= 0.75)
            result = true;
    });

    return result;
}

function changeMot(number) {
    if (number == null) {
        if (typeList == 0)
            do
                number = getRandomQID(json);
            while (number == idQuestion)
        else if (typeList == 1)
            number = json.infos.min;
    }

    idQuestion = number;

    console.log("idList", idList, " typeTrad", typeTrad, " idQuestion", idQuestion);

    start();
}

timer.addEventListener('targetAchieved', function (e) {
    activeElement(false);
    $('#retour').removeAttr('disabled');
    $('#timer').html("<span style='color:red;'>Temps écoulés !</span>");

    let taInfos = parseObjectFromCookie(getCookie('taInfos'));
    if (taInfos.success > taInfos.record) {
        taInfos.record = taInfos.success;
        createCookie("taInfos", taInfos);
        updateStats();
    }

    taInfos.success = 0;
    taInfos.fail = 0;
    createCookie("taInfos", taInfos);
});