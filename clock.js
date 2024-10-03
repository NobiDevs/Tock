// Imports audio
const tick = new Audio(Fetch());

function init() {
    checkMode();
    createBackground();
    createClock();
    createDate();
    updateClock();
}

// Setting global var
var mod = getBoolean('Dark Mode?');
var int = getBoolean('Show Numbers?');
var sm = getBoolean('Smooth Scrolling?')

if (!sm) {
    var fx = getBoolean('Sound?');
}

var dat = getBoolean('Show Date?')

let handElements = {};
let mode;
let handColors;
let color;
let lastSec;
let interval;
let seconds;
let date;

function getBoolean(prompt) {
    while (true) {
        let input = readLine(prompt).trim().toLowerCase();
        if (['y', 'yes', 'yeah', 'true', '1'].includes(input)) {
            return true;
        } else if (['n', 'no', 'nah', 'false', '0'].includes(input)) {
            return false;
        } else {
            console.log("Invalid input. Please enter yes or no.");
        }
    }
}

// Setting up clock
function checkMode() {
    if (mod) {
        mode = ['#1c1c1e', '#343436']
        color = '#f5f5f7'
        handColors = [color, color, '#f99c0b'];
    } else {
        mode = ['#dbdbdb', '#f0f0f0']
        color = '#666'
        handColors = [color, color, '#f99c0b'];
    }
}

function createBackground() {
    const rect = new Rectangle(getWidth(), getHeight());
    rect.setColor(mode[0]);
    add(rect);

    const rad = ((getWidth() / 3) + 5);
    const circ = new Circle(rad)
    circ.setPosition(getWidth() / 2, getHeight() / 2)
    circ.setColor(mode[1])
    add(circ)
}

function Fetch() {
    const aud = (`
        aHR0cHM6Ly93ZWIub3BlbmRyaXZl
        LmNvbS9hcGkvdjEvZG93bmxvYWQv
        ZmlsZS5qc29uL05qRmZPRGt5TmpN
        d056ZGY/dGVtcF9rZXk9JUI2JTI3
        JTI0JThBeCUxQyU5NiU4NyUyNCVG
        MyVDRSUzQyVEQWp3JmlubGluZT0x
    `)
    return atob(aud);
}

function createClock() {
    // Set up clock face
    const rad = getWidth() / 3;
    const hLength = 25;
    const hWidth = 4;
    const minLength = 15;
    const minWidth = 2;

    // Function to create a marker
    function createMarker(ang, isHourMarker, hourNumber) {
        const length = isHourMarker ? hLength : minLength;
        const width = isHourMarker ? hWidth : minWidth;

        const marker = new Rectangle(width, length);

        // Calculate position for marker
        const mX = getWidth() / 2 + Math.sin(ang) * (rad - length / 2);
        const mY = getHeight() / 2 - Math.cos(ang) * (rad - length / 2);

        marker.setPosition(mX - width / 2, mY - length / 2);
        marker.setColor(isHourMarker ? color : '#999');
        marker.setRotation(ang * (180 / Math.PI));
        add(marker);

        // Add hour numbers
        if (isHourMarker) {
            const nRad = rad - hLength - 15; // Adjust this value to position the numbers
            const nX = getWidth() / 2 + Math.sin(ang) * nRad;
            const nY = getHeight() / 2 - Math.cos(ang) * nRad;

            if (int) {
                const text = new Text(hourNumber.toString(), "18pt Arial Black");
                text.setPosition(nX - text.getWidth() / 2, nY + text.getHeight() / 3);
                text.setColor(color);
                add(text);
            }
        }
    }

    // Create markers and numbers
    for (let i = 0; i < 60; i++) {
        const ang = (i / 60) * 2 * Math.PI;
        if (i % 5 === 0) {
            // Hour marker and number
            const hNum = (i / 5 === 0) ? 12 : i / 5;
            createMarker(ang, true, hNum);
        } else {
            // Minute marker
            createMarker(ang, false);
        }
    }

    // Create clock hands
    const hands = ['hour', 'minute', 'second'];
    const handLengths = [rad * 0.55, rad * 0.85, rad * 0.9];
    const handWidths = [6, 4.5, 2];

    hands.forEach((hand, index) => {
        const element = new Line(getWidth() / 2, getHeight() / 2, getWidth() / 2, getHeight() / 2 - handLengths[index]);
        element.setLineWidth(handWidths[index]);
        element.setColor(handColors[index]);
        add(element);

        handElements[hand] = element;
    });
}

// Constants for clock hands
const rad = getWidth() / 3;
const hLength = rad * 0.55;
const minLength = rad * 0.85;
const secLength = rad * 0.9;

// Function to calculate hand endpoint
function calculateHandEndpoint(ang, length) {
    const rad = (ang - 90) * (Math.PI / 180);
    const endX = getWidth() / 2 + length * Math.cos(rad);
    const endY = getHeight() / 2 + length * Math.sin(rad);
    return {
        x: endX,
        y: endY
    };
}

function createDate() {
    date = new Text("", "14pt Courier New");
    date.setColor(color);
    add(date);
}

function updateClock() {
    const now = new Date();

    // Sets up smooth scrolling
    if (sm) {
        const milliseconds = now.getMilliseconds();
        seconds = now.getSeconds() + milliseconds / 1000;
        interval = 16
    } else {
        seconds = now.getSeconds();
        interval = 1000
    }

    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    const secAng = (seconds / 60) * 360;
    const minAng = ((minutes + seconds / 60) / 60) * 360;
    const hAng = ((hours + minutes / 60) / 12) * 360;

    const secEnd = calculateHandEndpoint(secAng, secLength);
    const minEnd = calculateHandEndpoint(minAng, minLength);
    const hEnd = calculateHandEndpoint(hAng, hLength);

    handElements['second'].setEndpoint(secEnd.x, secEnd.y);
    handElements['minute'].setEndpoint(minEnd.x, minEnd.y);
    handElements['hour'].setEndpoint(hEnd.x, hEnd.y);

    // Sets up date
    if (dat) {
        const opt = {
            weekday: 'long',
            // year: 'numeric', 
            month: 'short',
            day: 'numeric'
        };

        const dStr = now.toLocaleDateString(undefined, opt);
        date.setText(dStr);
        date.setPosition((getWidth() / 2) - (date.getWidth() / 2), (getHeight() / 2) + ((getHeight() / 3) + 10));
    }

    // Plays tick
    if (fx) {
        const sec = Math.floor(seconds);
        if (sec !== lastSec) {
            tick.currentTime = 0.16; // Reset the audio to the beginning
            tick.play();
            lastSec = sec;
        }
    }
}


// Set up the clock and start it
init();
setInterval(updateClock, interval);
