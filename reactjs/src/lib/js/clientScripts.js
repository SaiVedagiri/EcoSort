document.querySelector("#submit").addEventListener("click", onClick);
let myError = document.createElement("p");
document.querySelector("#error").append(myError);
let myVal;
let imageElement;
let imageElement2;
let accessCode;
let params = new URLSearchParams(document.location.search.substring(1));
let myKey = params.get("accessKey");
let firebasePresentationKey;
let presentationTitle;
let slideUrl;
let currentSlideNum;
let maxSlideNum;
let currentPresSlideNum;
document.querySelector(".buttons").style.display = "none";

if (myKey) {
    accessCode = myKey;
    submitKey();
}

let socket = new WebSocket("wss://syncfastserver.macrotechsolutions.us:4211");
let lockState;

socket.onopen = function (e) {
    console.log("Connection Established");
};

socket.onmessage = function (event) {
    let socketData = event.data;
    if (socketData == firebasePresentationKey) {
        updatePage();
    } else if (socketData == `lock${firebasePresentationKey}`) {
        lockScreen();
    } else if (socketData == `unlock${firebasePresentationKey}`) {
        unlockScreen();
    }

};

async function onClick() {
    event.preventDefault();
    accessCode = document.querySelector("#accessKeyInput").value;
    let result = "";
    await axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/clientJoin',
        headers: {
            'Content-Type': 'application/json',
            'accesscode': accessCode
        }
    })
        .then(data => result = data.data)
        .catch(err => console.log(err))
    if (result.data == "Incorrect Access Code") {
        alert("Invalid Access Code");
    } else {
        myError.innerText = "";
        firebasePresentationKey = result.firebasepresentationkey;
        slideUrl = result.slideurl;
        if (result.lockstate == 'false') {
            unlockScreen();
        } else{
            lockScreen();
        }
        currentPresSlideNum = result.slidenum;
        maxSlideNum = result.slidenum;
        currentSlideNum = result.slidenum;
        sessionStorage.setItem('imageUrl', result.imageurl);
        presentationTitle = result.presentationtitle;
        document.querySelector("#accessKeyInput").style.display = "none";
        document.querySelector("#submit").style.display = "none";
        document.querySelector("#accessKeyText").style.display = "none";
        imageElement = document.createElement("img");
        imageElement.id = "presImg";
        imageElement.title = presentationTitle;
        imageElement.src = slideUrl;
        imageElement.style.width = "80vw";
        imageElement.style.height = "auto";
        imageElement2 = document.createElement("img");
        imageElement2.id = "presImg2";
        imageElement2.title = 'myImg';
        imageElement2.src = sessionStorage.getItem('imageUrl');
        imageElement2.style.width = "30vw";
        imageElement2.style.height = "auto";
        imageElement2.style.position = "absolute";
        imageElement2.style.right = "10vw";
        imageElement2.style.top = "40vh";
        if (sessionStorage.getItem('imageUrl') == "undefined" || sessionStorage.getItem('imageUrl') == "null") {
            imageElement2.style.display = "none";
        } else {
            imageElement2.style.display = "inline";
        }
        document.querySelector(".img").appendChild(imageElement);
        document.querySelector(".img").appendChild(imageElement2);
    }
}



async function updatePage() {
    let result = "";
    await axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/clientJoin',
        headers: {
            'Content-Type': 'application/json',
            'accesscode': accessCode
        }
    })
        .then(data => result = data.data)
        .catch(err => console.log(err))
    if (parseInt(result.slidenum) > parseInt(maxSlideNum)) {
        maxSlideNum = result.slidenum;
    }
    if (result.lockstate == 'false') {
        unlockScreen();
        if (currentPresSlideNum == currentSlideNum) {
            currentSlideNum = result.slidenum;
            slideUrl = result.slideurl;
            sessionStorage.setItem('imageUrl', result.imageurl);
            imageElement.src = slideUrl;
        }
    } else {
        lockScreen();
        slideUrl = result.slideurl;
        currentSlideNum = result.slidenum;
        sessionStorage.setItem('imageUrl', result.imageurl);
        imageElement.src = slideUrl;
    }
    currentPresSlideNum = result.slidenum;
}

function lockScreen() {
    lockState = true;
    document.querySelector(".buttons").style.display = "none";
}

function unlockScreen() {
    lockState = false;
    document.querySelector(".buttons").style.display = "inline";
}

async function previousSlide() {
    if (parseInt(currentSlideNum) > 0) {
        currentSlideNum = (parseInt(currentSlideNum) - 1).toString();
        await axios({
            method: 'POST',
            url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/clientGetSlide',
            headers: {
                'Content-Type': 'application/json',
                'accesscode': accessCode,
                'slidenum': currentSlideNum
            }
        })
            .then(data => result = data.data)
            .catch(err => console.log(err))
        slideUrl = result.slideurl;
        imageElement.src = slideUrl;
    } else {
        alert("You are currently viewing the first slide.");
    }
}

async function nextSlide() {
    if (parseInt(currentSlideNum) < parseInt(maxSlideNum)) {
        currentSlideNum = (parseInt(currentSlideNum) + 1).toString();
        await axios({
            method: 'POST',
            url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/clientGetSlide',
            headers: {
                'Content-Type': 'application/json',
                'accesscode': accessCode,
                'slidenum': currentSlideNum
            }
        })
            .then(data => result = data.data)
            .catch(err => console.log(err))
        slideUrl = result.slideurl;
        imageElement.src = slideUrl;
    } else {
        alert("You are currently viewing the last available slide.");
    }
}

async function submitKey() {
    let result = "";
    await axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/clientJoin',
        headers: {
            'Content-Type': 'application/json',
            'accesscode': accessCode
        }
    })
        .then(data => result = data.data)
        .catch(err => console.log(err))
    if (result.data == "Incorrect Access Code") {
        alert("Invalid Access Code");
    } else {
        myError.innerText = "";
        firebasePresentationKey = result.firebasepresentationkey;
        slideUrl = result.slideurl;
        sessionStorage.setItem('imageUrl', result.imageurl);
        presentationTitle = result.presentationtitle;
        document.querySelector("#accessKeyInput").style.display = "none";
        document.querySelector("#submit").style.display = "none";
        document.querySelector("#accessKeyText").style.display = "none";
        imageElement = document.createElement("img");
        imageElement.id = "presImg";
        imageElement.title = presentationTitle;
        imageElement.src = slideUrl;
        imageElement.style.width = "80vw";
        imageElement.style.height = "auto";
        imageElement2 = document.createElement("img");
        imageElement2.id = "presImg2";
        imageElement2.title = 'myImg';
        imageElement2.src = sessionStorage.getItem('imageUrl');
        imageElement2.style.width = "30vw";
        imageElement2.style.height = "auto";
        imageElement2.style.position = "absolute";
        imageElement2.style.right = "10vw";
        imageElement2.style.top = "40vh";
        if (sessionStorage.getItem('imageUrl') == "undefined" || sessionStorage.getItem('imageUrl') == "null") {
            imageElement2.style.display = "none";
        } else {
            imageElement2.style.display = "inline";
        }
        document.querySelector(".img").appendChild(imageElement);
        document.querySelector(".img").appendChild(imageElement2);
    }
}