window.onbeforeunload = function (e) {
    gapi.auth2.getAuthInstance().signOut();
};

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
            'password': "",
            'name': profile.getName(),
            'imageurl': profile.getImageUrl()
        }
    })
        .then(data => userData = data.data)
        .catch(err => console.log(err))
    sessionStorage.setItem('userKey', userData.userKey);
    sessionStorage.setItem('profilePic', profile.getImageUrl());
    window.location.href = "landing.html";
}

function onFailure(error) {
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

document.querySelector("#submit_button").addEventListener("click", signUpEmail);
let box;
let notSameError = document.createElement('p');

async function signUpEmail(event) {
    event.preventDefault();
    let email = document.querySelector("#emailInput").value.toLowerCase();
    let firstName = document.querySelector("#firstName").value;
    let lastName = document.querySelector("#lastName").value;
    let password = document.querySelector("#passwordInput").value;
    let passwordConfirm = document.querySelector("#passwordConfirm").value;
    box = document.querySelector('#wrong');
    let result;
    await axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/signUp',
        headers: {
            'Content-Type': 'application/json',
            'email': email,
            'firstname': firstName,
            'lastname': lastName,
            'password': password,
            'passwordconfirm': passwordConfirm
        }
    })
        .then(data => result = data.data)
        .catch(err => console.log(err))
    if (result.data == "Email already exists.") {
        notSame('Email already exists.');
    } else if (result.data == "Please enter an email address.") {
        notSame('Please enter an email address.');
    } else if (result.data =='Invalid Name') {
        notSame('Invalid Name');
    } else if (result.data == 'Invalid email address.') {
        notSame('Invalid email address.');
    } else if (result.data == 'Your password needs to be at least 6 characters.') {
        notSame('Your password needs to be at least 6 characters.');
    } else if (result.data == 'Your passwords don\'t match.') {
        notSame('Your passwords don\'t match.');
    } else {
        sessionStorage.setItem('userKey', result.data);
        sessionStorage.setItem('profilePic', result.imageurl);
        window.location.href = "landing.html";
    }
}

function notSame(p) {
    notSameError.innerText = `${p}`;
    notSameError.class = "error";
    box.prepend(notSameError);
}