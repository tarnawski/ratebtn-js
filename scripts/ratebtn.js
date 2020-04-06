const API = "https://api.ratebtn.ttarnawski.usermd.net";
const DEFAULT_STAR_COUNT = 5;
const DEFAULT_STAR_SIZE = 30;
const FOREGROUND_COLOR = "#FFB900";
const SECONDARY_COLOR = "#D3D3D3";

const get = (uri) =>
    fetch(API + '/votes?url=' + uri, {
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.text());

const send = (uri, rate, fingerprint) =>
    fetch(API + '/votes', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: uri, value: rate, fingerprint: fingerprint})
    }).then(response => response.text());

const points = (size) => {
    let innerCirclePoints = 5;
    let innerRadius = size / innerCirclePoints;
    let innerOuterRadiusRatio = 2;
    let outerRadius = innerRadius * innerOuterRadiusRatio;
    let angle = (Math.PI / innerCirclePoints);
    let angleOffsetToCenterStar = 0;
    let totalPoints = innerCirclePoints * 2;
    let points = '';

    for (let i = 0; i < totalPoints; i++) {
        let isEvenIndex = i % 2 === 0;
        let r = isEvenIndex ? outerRadius : innerRadius;
        let currX = size/2 + Math.cos(i * angle + angleOffsetToCenterStar ) * r;
        let currY = size/2 + Math.sin(i * angle + angleOffsetToCenterStar) * r;
        points += currX + ',' + currY + ' ';
    }

    return points;
};

const fingerprint = (function(window, screen, navigator) {

    function checksum(str) {
        let hash = 5381,
            i = str.length;

        while (i--) hash = (hash * 33) ^ str.charCodeAt(i);

        return hash >>> 0;
    }

    function map(arr, fn){
        let i = 0, len = arr.length, ret = [];
        while(i < len){
            ret[i] = fn(arr[i++]);
        }
        return ret;
    }

    return checksum([
        navigator.userAgent,
        [screen.height, screen.width, screen.colorDepth].join('x'),
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
        map(navigator.plugins, function (plugin) {
            return [
                plugin.name,
                plugin.description,
                map(plugin, function (mime) {
                    return [mime.type, mime.suffixes].join('~');
                }).join(',')
            ].join("::");
        }).join(';')
    ].join('###'));

}(this, screen, navigator));

class HTMLCustomElement extends HTMLElement {
    constructor(_) {
        return (_ = super()).init(), _;
    }
    init() {}
}

class RateButton extends HTMLCustomElement {

    connectedCallback() {
        if (this._connected) {
            return;
        }

        get(encodeURI(document.location.href)).then(response => {
            this.appendChild(this.render(this.stars, this.width, JSON.parse(response).average))
        });
        this._connected = true;
    }

    render(starCount, starWidth, rating) {
        let starRating = document.createElement('div');
        starRating.setAttribute('class', 'star-rating');

        for (let step = starCount; step > 0; step--) {
            let polygon = document.createElementNS('http://www.w3.org/2000/svg','polygon');
            let image = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            polygon.setAttribute("points", points(starWidth));
            image.setAttribute("class", "star-svg");
            if (rating < step) {
                image.setAttribute("fill", SECONDARY_COLOR);
            } else {
                image.setAttribute("fill", FOREGROUND_COLOR);
            }
            image.setAttribute("width", starWidth);
            image.setAttribute("height", starWidth);
            image.appendChild(polygon);
            image.addEventListener("click", function () {
                send(encodeURI(document.location.href), step, fingerprint).then(response => console.log(response));
            }, false);
            starRating.appendChild(image);
        }

        return starRating;
    }

    get stars() {
        return this.getAttribute("stars") || DEFAULT_STAR_COUNT;
    }

    set stars(stars) {
        if (stars) {
            this.setAttribute("stars", stars);
        } else {
            this.removeAttribute("stars");
        }
    }

    get width() {
        return this.getAttribute("width") || DEFAULT_STAR_SIZE;
    }

    set width(width) {
        if (width) {
            this.setAttribute("width", width);
        } else {
            this.removeAttribute("width");
        }
    }
}

customElements.define('rate-button', RateButton);