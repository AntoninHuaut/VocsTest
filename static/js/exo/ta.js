var typeExo = 'ta';

var timer = new easytimer.Timer();
var hasStart = false;

$('document').ready(function () {
    if (isOKDocReady(typeExo)) {
        timer.addEventListener('secondsUpdated', function (e) {
            $('#timer').html(timer.getTimeValues().toString());
        });
        start(typeExo + '-first');
    }
});

function countDown(countVal) {
    $('#timer').html('Début dans : <br /><span style="color:red;">' + countVal + '</span>');

    setTimeout(function () {
        if (countVal == 0) {
            start(typeExo);
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
    }, countVal == 0 ? 0 : 400);
}

function update(element, index, e) {
    let taInfosC = getCookie('taInfos');

    if (!taInfosC)
        redirectBase();

    let taInfos = parseObjectFromCookie(taInfosC);

    if (index == 0 && hasStart) {
        if (e.keyCode != 13)
            return;

        ttsWord(json.data[idQuestion][0]);

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
        updateStats(typeExo);
        changeMot(getNextIDQ(typeList, idQuestion), typeExo);
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

timer.addEventListener('targetAchieved', function (e) {
    activeElement(false);
    $('#retour').removeAttr('disabled');
    $('#timer').html("<span style='color:red;'>Temps écoulés !</span>");

    let taInfos = parseObjectFromCookie(getCookie('taInfos'));
    if (taInfos.success > taInfos.record) {
        taInfos.record = taInfos.success;
        createCookie("taInfos", taInfos);
        updateStats(typeExo);
    }

    taInfos.success = 0;
    taInfos.fail = 0;
    createCookie("taInfos", taInfos);
});

// https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely

function isSimilar(s1, s2) {
    let longer = s1;
    let shorter = s2;

    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }

    let longerLength = longer.length;

    if (longerLength == 0)
        return 1.0;

    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    let costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}