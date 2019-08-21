const API = "http://ratebtn.ttatrnawski.usermd.net";
const DEFAULT_STAR_COUNT = 5;
const DEFAULT_STAR_SIZE = 30;
const FOREGROUND_COLOR = "#FFB900";
const SECONDARY_COLOR = "#D3D3D3";

const mock = 3.95;

const get = (uri) =>
    fetch(API + '/api/rating?uri=' + uri, {
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.text());

const send = (uri, rate) =>
    fetch(API + '/api/rating', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ uri: uri, rate: rate })
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

class HTMLCustomElement extends HTMLElement {
    constructor(_) {
        return (_ = super(_)).init(), _;
    }
    init() {}
}

class RateButton extends HTMLCustomElement {

    connectedCallback() {
        if (this._connected) {
            return;
        }

        this.appendChild(this.render(this.stars, this.width));
        this._connected = true;
    }

    render(starCount, starWidth) {
        let starRating = document.createElement('div');
        starRating.setAttribute('class', 'star-rating');

        for (let step = starCount; step > 0; step--) {
            let polygon = document.createElementNS('http://www.w3.org/2000/svg','polygon');
            let image = document .createElementNS("http://www.w3.org/2000/svg", "svg");

            polygon.setAttribute("points", points(starWidth));
            image.setAttribute("class", "star-svg");
            if (mock < step) {
                image.setAttribute("fill", SECONDARY_COLOR);
            } else {
                image.setAttribute("fill", FOREGROUND_COLOR);
            }
            image.setAttribute("width", starWidth);
            image.setAttribute("height", starWidth);
            image.appendChild(polygon);
            image.addEventListener("click", function () {
                send(document.location.href, step).then(response => console.log(response));
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