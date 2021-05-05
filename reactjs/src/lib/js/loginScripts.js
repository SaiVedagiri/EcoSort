if (sessionStorage.getItem('userKey') != null &&
    sessionStorage.getItem('userKey') != "null") {
    window.location.href = "host.html";
}

async function onSuccess(googleUser) {
    let profile = googleUser.getBasicProfile();
    let userData;
    for (key in googleUser) {
        if (googleUser[key].access_token != undefined) {
            localStorage.setItem('access_token', googleUser[key].access_token);
        }
    }
    await axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/googleSignIn',
        headers: {
            'Content-Type': 'application/json',
            'email': profile.getEmail(),
            'name': profile.getName(),
            'imageurl': profile.getImageUrl()
        }
    })
        .then(data => userData = data.data)
        .catch(err => console.log(err))
    sessionStorage.setItem('googleID', userData.googleid);
    sessionStorage.setItem('userKey', userData.userkey);
    sessionStorage.setItem('profilePic', profile.getImageUrl());
    window.location.href = "host.html";
}

function onFailure(error) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log(error);
}

function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email https://www.googleapis.com/auth/drive.file',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'light',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

document.querySelector("#submit_button").addEventListener("click", signInEmail);

let notSameError = document.getElementById('error');

async function signInEmail(event) {
    event.preventDefault();
    let email = document.querySelector("#emailInput").value.toLowerCase();
    let inputPassword = document.querySelector("#passwordInput").value;
    let result;
    await axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/signIn',
        headers: {
            'Content-Type': 'application/json',
            'email': email,
            'password': inputPassword
        }
    })
        .then(data => result = data.data)
        .catch(err => console.log(err))
    if (result.data == "Incorrect Password") {
        notSame("Incorrect Password");
    } else if (result.data == "Incorrect email address.") {
        notSame("Incorrect email address.");
    } else {
        sessionStorage.setItem('userKey', result.data);
        sessionStorage.setItem('profilePic', result.imageurl);
        window.location.href = "host.html";
    }
}

function notSame(p) {
    notSameError.innerText = `${p}`;
    notSameError.class = "error";
}