function showToast(title, type, timeout, text, callFunction, idQuestion) {
    toastr.options = {
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "hideDuration": "500",
        "timeOut": timeout,
        "onHidden": function () {
            if (callFunction)
                changeMot(idQuestion);
        }
    }

    if (type == 1)
        toastr.success(title);
    else if (type == 2)
        toastr.error(text, title);
}

function getNextIDQ(typeList, idQuestion) {
    return typeList == 0 ? null : idQuestion + 1;
}

function activeElement(b) {
    [$("#list"), $(".w3-btn"), $("#inputText")].forEach(function (get) {
        if (b)
            get.removeAttr('disabled');
        else
            get.attr('disabled', 'disabled');
    })
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

// https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely

function isSimilar(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
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