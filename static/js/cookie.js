var farFuture = new Date(new Date().getTime() + (1000*60*60*24*365*10)); // ~10y

const getCookie = (name) => {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
};

const parseObjectFromCookie = (cookie) => {
    const decodedCookie = decodeURIComponent(cookie);
    return JSON.parse(decodedCookie);
};

function createCookie(name, value) {
    document.cookie = name + "=" +  JSON.stringify(value) + ";path=/;expires=" + farFuture;
}