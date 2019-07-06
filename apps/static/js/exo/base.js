var json;

var idList;
var idQuestion = -1;
var typeQuestion;

var typeList;
var typeTrad;
var trads;
var activeSound;

function isOKDocReady(typeExo) {
    let baseInfosC = getCookie('baseInfos');

    if (basicCookieIsValid(baseInfosC) && getCookie(typeExo + 'Infos')) {
        let baseInfos = parseObjectFromCookie(baseInfosC);
        idList = baseInfos.idList;
        typeList = baseInfos.typeList;
        typeTrad = baseInfos.typeTrad;
        activeSound = baseInfos.activeSound;

        updateStats(typeExo);
        changeSound($('#soundControl i')[0], true);

        return true;
    } else
        redirectBase();

    return false;
}

function start(typeExo) {
    if (!json)
        $.getJSON(window.location.origin + "/data/" + idList, function (data) {
            json = data;
            $('#listInfos').text(json.infos.nom + " (" + json.infos.lettres + ")");

            selectMot(typeExo);
        });
    else
        selectMot(typeExo);
}

function selectMot(typeExo) {
    if (typeExo == 'ta-first') {
        $("#inputText").focus();
        countDown(5);
        return;
    }

    if (idQuestion < json.infos.min || idQuestion > json.infos.max) {
        if (idQuestion != -1)
            showToast('Vous avez terminé la liste Retour au début', 1, 2500, null, false);

        changeMot(null, typeExo)
        return;
    }

    trads = json.data[idQuestion];
    typeQuestion = typeTrad == 2 ? getRandomInt(2) : typeTrad;
    $('#question').text(trads[typeQuestion]);

    if (typeExo == 'qcm')
        try {
            setValues(json.data);
        } catch (error) {
            console.log(error);

            setTimeout(function () {
                location.reload();
            }, 500);
        }
}

function changeMot(number, typeExo) {
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

    activeElement(true);
    start(typeExo);
}

function updateStats(typeExo) {
    let taInfos = parseObjectFromCookie(getCookie(typeExo + 'Infos'));
    $('#success').text(taInfos.success);
    $('#fail').text(taInfos.fail);
    $('#total').text(taInfos.success + taInfos.fail);

    if (typeExo == 'ta')
        $('#record').text(taInfos.record);
}

function ttsWord(word) {
    if (!activeSound)
        return;

    let synth = window.speechSynthesis;
    let voices = synth.getVoices();

    if (voices.length == 0) {
        setTimeout(() => {
            ttsWord(word);
        }, 10);

        return;
    }

    let voice;

    voices.forEach(get => {
        if (get.lang == "en-GB")
            voice = get;
    });

    let ss = new SpeechSynthesisUtterance(word.replace(/[\(\)]/g, ''));
    ss.voice = voice;
    ss.pitch = 1.0;
    ss.rate = 1.0;
    synth.speak(ss);
}

function showToast(title, type, timeout, text, typeExo, idQuestion) {
    toastr.options = {
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "hideDuration": "500",
        "timeOut": timeout,
        "onHidden": function () {
            if (!!typeExo)
                changeMot(idQuestion, typeExo);
        }
    }

    if (type == 1)
        toastr.success(title);
    else if (type == 2)
        toastr.error(text, title);
}

function activeElement(b) {
    [$("#list"), $(".w3-btn"), $("#inputText")].forEach(function (get) {
        if (b)
            get.removeAttr('disabled');
        else
            get.attr('disabled', 'disabled');
    })
}

function changeSound(el, init) {
    let baseInfosC = getCookie('baseInfos');
    if (!basicCookieIsValid(baseInfosC))
        return;

    let baseInfos = parseObjectFromCookie(baseInfosC);

    if (init) {
        el.classList.remove("fa-volume-up");
        el.classList.remove("fa-volume-mute");
        el.classList.add(baseInfos.activeSound ? "fa-volume-up" : "fa-volume-mute");

        return;
    }

    if (el.classList[1] == "fa-volume-up") {
        el.classList.remove("fa-volume-up");
        el.classList.add("fa-volume-mute");
    } else if (el.classList[1] == "fa-volume-mute") {
        el.classList.remove("fa-volume-mute");
        el.classList.add("fa-volume-up");
    }

    activeSound = !activeSound;
    baseInfos.activeSound = activeSound;
    createCookie("baseInfos", baseInfos);
}

function getNextIDQ(typeList, idQuestion) {
    return typeList == 0 ? null : idQuestion + 1;
}

function getRandomQID(json) {
    return Math.floor(Math.random() * (json.infos.max - json.infos.min + 1)) + json.infos.min;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function upFL(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function redirectBase() {
    window.location.assign(window.location.origin);
}