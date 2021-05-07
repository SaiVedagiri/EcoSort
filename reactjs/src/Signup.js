import React from 'react';
import scriptjs from "scriptjs";
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css';
import './assets/css/fontawesome.css';
import './assets/css/material-icons.min.css';
import './assets/css/signUpStyles.css';
import Header from "./Header";
import Footer from "./Footer";
import GoogleLogin from 'react-google-login';
import { Link } from "react-router-dom";


class Signup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            errorText: ""
        }
    }

    componentDidMount() {
        scriptjs.get(
          "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
          () => {
            const params = {
              clientId: "com.saivedagiri.ecosortlogin",
              redirectURI: "https://ecosort.saivedagiri.com/appleAuth",
              scope: "name email",
            };
            window.AppleID.auth.init(params);
          }
        );
      }

    async onSuccess(googleUser) {
        let profile = googleUser.getBasicProfile();
        for (var key in googleUser) {
            if (googleUser[key].access_token !== undefined) {
                localStorage.setItem('access_token', googleUser[key].access_token);
            }
        }
        console.log(profile.getName());
        let response = await fetch('https://ecosort.saivedagiri.com/googleSignIn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'email': profile.getEmail(),
                'name': profile.getName(),
                'imageurl': profile.getImageUrl()
            }
        })
            .catch(err => console.log(err))
        let json = await response.json();
        sessionStorage.setItem('userKey', json.userkey);
        sessionStorage.setItem('profilePic', profile.getImageUrl());
        if(json.deviceid != null && json.deviceid != ""){
            window.location = "dashboard";
          } else{
            window.location = "registerDevice"
          }
    }

    onFailure(error) {
        console.log(error);
    }

    // let notSameError = document.getElementById('error');
    notSame(p) {
        this.setState({ errorText: p });
    }

    async signInEmail(e) {
        e.preventDefault();
        let email = this.state.email.toLowerCase();
        let response = await fetch('https://ecosort.saivedagiri.com/signUp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'email': email,
                'firstname': this.state.firstName,
                'lastname': this.state.lastName,
                'password': this.state.password,
                'passwordconfirm': this.state.confirmPassword
            }
        })
            .catch(err => console.log(err))
        let json = await response.json();
        if (json.data != "Valid") {
            this.notSame(json.data);
        } else {
            sessionStorage.setItem('userKey', json.id);
            sessionStorage.setItem('profilePic', json.imageurl);
            window.location.href = "registerDevice";
        }
    }

    changeFirstName(event) {
        this.setState({ firstName: event.target.value });
    }

    changeLastName(event) {
        this.setState({ lastName: event.target.value });
    }

    changeEmail(event) {
        this.setState({ email: event.target.value });
    }

    changePassword(event) {
        this.setState({ password: event.target.value });
    }

    changeConfirmPassword(event) {
        this.setState({ confirmPassword: event.target.value });
    }

    render() {
        return (
            <div>
                <Header />
                <div className="page">
                    <div className="box">
                        <div id="error">
                        </div>
                        <div className="title">
                            <h1 id="title" style={{ color: 'white' }}>Sign Up</h1>
                        </div>
                        <p id="error" style={{ color: 'white' }}>{this.state.errorText}</p>
                        <form>
                            <div className="firstname">
                                <input id="firstName" className="input" onChange={this.changeFirstName.bind(this)} placeholder="First name" />
                            </div>
                            <div className="break"></div>
                            <div className="lastname">
                                <input id="lastName" className="input" onChange={this.changeLastName.bind(this)} placeholder="Last name" />
                            </div>
                            <div className="break"></div>
                            <div className="email">
                                <input id="emailInput" className="input" onChange={this.changeEmail.bind(this)} placeholder="email@example.com" />
                            </div>
                            <div className="break" />
                            <div className="password">
                                <input type="password" id="passwordInput" className="input" onChange={this.changePassword.bind(this)} placeholder="New Password" />
                            </div>
                            <div className="break"></div>
                            <div className="passwordCon">
                                <input type="password" className="input" id="passwordConfirm" onChange={this.changeConfirmPassword.bind(this)} placeholder="Confirm password" />
                            </div>
                            <div className="break" />

                            <div className="submit">
                                <button id="submit_button" className="input" onClick={this.signInEmail.bind(this)}>Submit</button>
                            </div>
                        </form>
                        <div className="or">
                            <h1 id="or" style={{ color: 'white' }}>OR</h1>
                        </div>
                        <GoogleLogin
                            clientId="116903243723-vppqbjhvsabo0a9jkujgpaumjb8q5g7r.apps.googleusercontent.com"
                            scope="profile email"
                            buttonText="Sign in with Google"
                            onSuccess={this.onSuccess}
                            onFailure={this.onFailure}
                            cookiePolicy={'single_host_origin'}
                        />
                        <div style={{width: "210px",  height: "40px", marginTop: "10px"}} id="appleid-signin" className="signin-button" data-color="black" data-border="true" data-type="sign in"><button onClick={() => window.AppleID.auth.signIn()}/></div>
            
                        <div className="break" />
                        <div className="signUp">
                            <Link to={"./login"} style={{ color: 'white' }}><u>Log In Here</u></Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
}



export default Signup;