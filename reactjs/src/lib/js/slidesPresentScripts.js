if (sessionStorage.getItem('presentationID') == null || sessionStorage.getItem('presentationID') == "null") {
    window.location.href = "index.html";
}

document.getElementById("linkBtn").addEventListener("click", openLink);
//document.getElementById("qrBtn").addEventListener("click", openQRCode);

let socket = new WebSocket("wss://syncfastserver.macrotechsolutions.us:4211");

socket.onopen = function(e) {
    console.log("Connection Established");
};

socket.onmessage = function(event) {
    let socketData = event.data;
    console.log(socketData);
    if (socketData == `next${sessionStorage.getItem('firebasePresentationKey')}`) {
        nextSlide();
    } else if (socketData == `previous${sessionStorage.getItem('firebasePresentationKey')}`) {
        previousSlide();
    } else if (socketData == `hostLock${sessionStorage.getItem('firebasePresentationKey')}`) {
        lockAccess();
    }
};

let myVal;
let length;
let slideUrl;
let imageElement;
let imageElement2;
let newCode;
let presentation;
let screenState = "standard";
let change = document.querySelector('#change');
let loadingElement = document.querySelector('#loading');
let lock = document.querySelector('#lock');
let lockState = true;
let changeKey = document.querySelector('#changeKey');
let notesSection = document.querySelector('.notes');
let notes = "No notes available.";
let notesState = false;
notesSection.style.display = "none";
let notesButton = document.querySelector('#notesButton');
change.addEventListener('click', changeAccess);
lock.addEventListener('click', lockAccess);
let p = document.createElement("h4");
p.id = "access";
let changeInput = document.createElement('input');
changeInput.id = "changeInput";
changeKey.appendChild(changeInput);
changeInput.style.display = "none";
let submit = document.createElement('button');
submit.id = "submitButton";
submit.innerText = "Submit";
changeKey.appendChild(submit);
submit.style.display = "none";
submit.addEventListener('click', accessKeySubmitted);
let openURL = "";
let openQR = ""
let connected = false;

// Client ID and API key from the Developer Console
let CLIENT_ID = "510632149212-b3nju2fd9omib1l67qal0ot1214rr75s.apps.googleusercontent.com";
let API_KEY = 'AIzaSyDhkJ2yT06tRwXIMEUp9xaj2-LxOnKyvGY';

// Array of API discovery doc URLs for APIs used by the quickstart
let DISCOVERY_DOCS = ["https://slides.googleapis.com/$discovery/rest?version=v1"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
let SCOPES = 'https://www.googleapis.com/auth/drive.file';


/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function(error) {
        console.log(JSON.stringify(error, null, 2));
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        listSlides();
    } else {
        handleAuthClick();
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 * Prints the number of slides and elements in a sample presentation:
 * https://docs.google.com/presentation/d/1EAYk18WDjIG-zp_0vLm3CsfQh_i8eXc67Jo2O9C6Vuc/edit
 */
async function listSlides() {
    gapi.client.slides.presentations.get({
        presentationId: sessionStorage.getItem('presentationID')
    }).then(async function(response) {
        await firebaseCommands();
        presentation = response.result;
        length = presentation.slides.length;
        await gapi.client.slides.presentations.pages.get({
            presentationId: sessionStorage.getItem('presentationID'),
            pageObjectId: presentation.slides[sessionStorage.getItem('currentSlide')].objectId,
        }).then(async function(response) {
            const res = JSON.parse(response.body);
            try {
                notes = await res.slideProperties.notesPage.pageElements[1].shape.text.textElements.pop().textRun.content;
                notesSection.innerText = notes;
            } catch (e) {
                console.log(e);
                notes = "No notes available.";
                notesSection.innerText = notes;
            }
        });
        gapi.client.slides.presentations.pages.getThumbnail({
            presentationId: sessionStorage.getItem('presentationID'),
            pageObjectId: presentation.slides[sessionStorage.getItem('currentSlide')].objectId,
        }).then(async function(response) {
            const res = JSON.parse(response.body);
            slideUrl = res.contentUrl;
            await axios({
                method: 'POST',
                url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/slideUrl',
                headers: {
                    'Content-Type': 'application/json',
                    'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                    'slideurl': slideUrl,
                    'slidenum': sessionStorage.getItem('currentSlide'),
                    'notes': notes
                }
            });
            await axios({
                method: 'POST',
                url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/presentationTitle',
                headers: {
                    'Content-Type': 'application/json',
                    'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                    'presentationtitle': presentation.title
                }
            });
            await axios({
                method: 'POST',
                url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/presentationLength',
                headers: {
                    'Content-Type': 'application/json',
                    'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                    'length': length,
                    'presentationtitle': presentation.title
                }
            });
            loadingElement.style.display = "none";
            imageElement = document.createElement("img");
            imageElement.id = "presImg";
            imageElement.title = presentation.title;
            imageElement.src = slideUrl;
            imageElement2 = document.createElement("img");
            imageElement2.id = "presImg2";
            imageElement2.title = presentation.title;
            imageElement2.src = slideUrl;
            document.querySelector(".img").appendChild(imageElement);
            document.querySelector(".img2").appendChild(imageElement2);
            p.innerText = `Access Code: ${sessionStorage.getItem('accessKey')}`;
            document.querySelector(".center").prepend(p);
        }, function(response) {
            console.log('Error: ' + response.result.error.message);
        });
    }, function(response) {
        console.log('Error: ' + response.result.error.message);
    });
}

function openQRCodePres() {
    window.open('https://api.qrserver.com/v1/create-qr-code/?data=https://syncfast.macrotechsolutions.us/client.html?accessKey=' + sessionStorage.getItem('accessKey') + '&size=600x600', 'QR Code', "height=600,width=600");
}

async function firebaseCommands() {
    let result = "";
    await axios({
            method: 'POST',
            url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/hostCommands',
            headers: {
                'Content-Type': 'application/json',
                'accesskey': sessionStorage.getItem('accessKey')
            }
        })
        .then(data => result = data.data)
        .catch(err => console.log(err))
    sessionStorage.setItem('firebasePresentationKey', result.firebasepresentationkey);
    if (!connected) {
        establishConnection();
        connected = true;
    }
    sessionStorage.setItem('currentSlide', result.currentslidenum);
}

async function previousSlide() {
    if (sessionStorage.getItem('currentSlide') > 0) {
        slideNum = (parseInt(sessionStorage.getItem('currentSlide')) - 1).toString();
        sessionStorage.setItem('currentSlide', ((parseInt(sessionStorage.getItem('currentSlide')) - 1).toString()));
    } else {
        alert("You are currently viewing the first slide.");
    }
    updatePage();
}

async function nextSlide() {
    if (sessionStorage.getItem('currentSlide') < length - 1) {
        await sessionStorage.setItem('currentSlide', ((parseInt(sessionStorage.getItem('currentSlide')) + 1).toString()));
    } else {
        alert("You are currently viewing the last slide.");
    }
    updatePage();
}

async function establishConnection() {
    await axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/createListener',
        headers: {
            'Content-Type': 'application/json',
            'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey')
        }
    });
}

async function updatePage() {
    await gapi.client.slides.presentations.pages.get({
        presentationId: sessionStorage.getItem('presentationID'),
        pageObjectId: presentation.slides[sessionStorage.getItem('currentSlide')].objectId,
    }).then(async function(response) {
        const res = JSON.parse(response.body);
        try {
            notes = await res.slideProperties.notesPage.pageElements[1].shape.text.textElements.pop().textRun.content;
            notesSection.innerText = notes;
        } catch (e) {
            console.log(e);
            notes = "No notes available.";
            notesSection.innerText = notes;
        }
    });
    gapi.client.slides.presentations.pages.getThumbnail({
        presentationId: sessionStorage.getItem('presentationID'),
        pageObjectId: presentation.slides[sessionStorage.getItem('currentSlide')].objectId,
    }).then(async function(response) {
        const res = JSON.parse(response.body);
        slideUrl = res.contentUrl;
        findImage(slideUrl);
        findQR(slideUrl);
        imageElement.src = slideUrl;
        imageElement2.src = slideUrl;
        await axios({
            method: 'POST',
            url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/updatePage',
            headers: {
                'Content-Type': 'application/json',
                'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                'slidenum': sessionStorage.getItem('currentSlide'),
                'slideurl': slideUrl,
                'notes': notes
            }
        });
    }, function(response) {
        console.log('Error: ' + response.result.error.message);
    });
}

async function findImage(imageUrl) {
    await axios({
            method: 'GET',
            url: 'https://api.ocr.space/parse/imageurl?apikey=9fccee195588957&url=' + imageUrl,
        })
        .then(data => result = data.data.ParsedResults[0].ParsedText)
        .catch(err => console.log(err))
    var splitArray = result.split("\n");
    var url = "";
    for (var x = 0; x < splitArray.length; x++) {
        testString = splitArray[x].replace(" ", "");
        if ((/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/).test(testString)) {
            url = testString;
            break;
        }
    }

    openURL = url;
    if (screenState = "standard" && url != "") {
        document.getElementById("linkBtn").style.display = "inline";
    } else if (url == "") {
        document.getElementById("linkBtn").style.display = "none";
    }
}

async function findQR(imageUrl) {
    await axios({
            method: 'GET',
            url: 'https://api.qrserver.com/v1/read-qr-code/?fileurl=' + imageUrl,
        })
        .then(data => result = data.data[0].symbol[0].data)
        .catch(err => console.log(err))
    var url = "";
    if ((/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/).test(result)) {
        url = result;
    }

    openQR = url;
    if (screenState = "standard" && url != "") {
        document.getElementById("qrBtn").style.display = "inline";
    } else if (url == "") {
        document.getElementById("qrBtn").style.display = "none";
    }
}

function openLink() {
    window.open(openURL);
}

function openQRCode() {
    window.open(openQR);
}

function signOut() {
    gapi.auth2.getAuthInstance().signOut();
    sessionStorage.setItem('presentationID', null);
    sessionStorage.setItem('currentSlide', null);
    sessionStorage.setItem('firebasePresentationKey', null);
    sessionStorage.setItem('accessKey', null);
    sessionStorage.setItem('userKey', null);
    sessionStorage.setItem('profilePic', null);
    localStorage.setItem('access_token', null);
    localStorage.setItem('userKey', null);
    window.location.href = "index.html";
}

let userPic = document.querySelector("#userPic");
userPic.src = sessionStorage.getItem("profilePic");

function newPres() {
    window.location.href = "host.html";
}



function changeAccess() {
    change.style.display = "none";
    changeInput.style.display = "inline";
    submit.style.display = "inline";
}

async function lockAccess() {
    lockState = !lockState;
    if (lockState) {
        await axios({
            method: 'POST',
            url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/lockPresentation',
            headers: {
                'Content-Type': 'application/json',
                'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                'lockstate': 'true'
            }
        })
        lock.innerText = "Unlock Presentation";
    } else {
        await axios({
            method: 'POST',
            url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/lockPresentation',
            headers: {
                'Content-Type': 'application/json',
                'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                'lockstate': 'false'
            }
        })
        lock.innerText = "Lock Presentation";
    }
}

function toggleNotes() {
    if (notesState) {
        notesSection.style.display = "none";
        notesButton.innerText = "Show Speaker Notes";
    } else {
        notesSection.style.display = "";
        notesButton.innerText = "Hide Speaker Notes";
    }
    notesState = !notesState;
}

async function accessKeySubmitted() {
    event.preventDefault();
    newCode = changeInput.value;
    let result = "";
    await axios({
            method: 'POST',
            url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/changeAccessKey',
            headers: {
                'Content-Type': 'application/json',
                'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey'),
                'newcode': newCode
            }
        })
        .then(data => result = data.data)
        .catch(err => console.log(err))
    if (result.data == "Success") {
        await sessionStorage.setItem('accessKey', newCode);
    } else {
        alert("This key has already been reserved.");
    }
    submit.style.display = "none";
    changeInput.style.display = "none";
    change.style.display = "inline";
    p.innerText = `Access Code: ${sessionStorage.getItem('accessKey')}`;
}

function fullScreen() {
    screenState = "full";
    document.getElementById("standardView").style.display = "none";
    document.getElementById("fullView").style.display = "block";
    if (document.getElementById("fullView").requestFullscreen)
        document.getElementById("fullView").requestFullscreen();
    else if (document.getElementById("fullView").mozRequestFullScreen)
        document.getElementById("fullView").mozRequestFullScreen();
    else if (document.getElementById("fullView").webkitRequestFullscreen)
        document.getElementById("fullView").webkitRequestFullscreen();
    else if (document.getElementById("fullView").msRequestFullscreen)
        document.getElementById("fullView").msRequestFullscreen();
}

function standardScreen() {
    screenState = "standard";
    document.getElementById("standardView").style.display = "block";
    document.getElementById("fullView").style.display = "none";
    if (document.exitFullscreen)
        document.exitFullscreen();
    else if (document.mozCancelFullScreen)
        document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen)
        document.webkitExitFullscreen();
    else if (document.msExitFullscreen)
        document.msExitFullscreen();
}

function showDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function setup() {

}

function draw() {

}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        previousSlide();
    } else if (keyCode === RIGHT_ARROW) {
        nextSlide();
    }
}