if (sessionStorage.getItem('userKey') == null || sessionStorage.getItem('userKey') == "null") {
    window.location.href = "login.html";
}

// The Browser API key obtained from the Google API Console.
// Replace with your own Browser API key, or your own key.
let developerKey = 'AIzaSyDhkJ2yT06tRwXIMEUp9xaj2-LxOnKyvGY';

// The Client ID obtained from the Google API Console. Replace with your own Client ID.
let clientId = "510632149212-b3nju2fd9omib1l67qal0ot1214rr75s.apps.googleusercontent.com"

// Replace with your own project number from console.developers.google.com.
// See "Project number" under "IAM & Admin" > "Settings"
let appId = "510632149212";

// Scope to use to access user's Drive items.
let scopes = ['https://www.googleapis.com/auth/drive.file'];

let pickerApiLoaded = false;
let oauthToken;

// Use the Google API Loader script to load the google.picker script.
function loadPicker() {
    gapi.load('auth', { 'callback': onAuthApiLoad });
    gapi.load('picker', { 'callback': onPickerApiLoad });
}

function onAuthApiLoad() {
    window.gapi.auth.authorize({
        'client_id': clientId,
        'scope': scopes,
        'immediate': false
    },
        handleAuthResult);
}

function onPickerApiLoad() {
    pickerApiLoaded = true;
    createPicker();
}

function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
    }
}

// Create and render a Picker object for searching images.
function createPicker() {
    if (pickerApiLoaded && oauthToken) {
        let view = new google.picker.View(google.picker.ViewId.PRESENTATIONS);
        let picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .setAppId(appId)
            .setOAuthToken(oauthToken)
            .addView(view)
            .addView(new google.picker.DocsUploadView())
            .setDeveloperKey(developerKey)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    }
}

// A simple callback implementation.
async function pickerCallback(data) {
    document.getElementById("popup").style.display = "none";
    if (data.action == google.picker.Action.PICKED) {
        let fileId = data.docs[0].id;
        let userID = sessionStorage.getItem('userKey');
        let accessToken = localStorage.getItem('access_token');
        let result;
        await axios({
            method: 'POST',
            url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/host',
            headers: {
                'Content-Type': 'application/json',
                'fileid': fileId,
                'userkey': userID,
                'accesstoken' : accessToken
            }
        })
            .then(data => result = data.data)
            .catch(err => console.log(err))
        sessionStorage.setItem('presentationID', fileId)
        sessionStorage.setItem('accessKey', result.accesskey);
        sessionStorage.setItem('currentSlide', "0")
        window.location.href = "slidesPresent.html"
    }
}