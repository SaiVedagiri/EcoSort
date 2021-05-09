import React from 'react';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css';
import Header from "./Header";
import Footer from "./Footer";


class RegisterDevice extends React.Component {

    componentDidMount() {
        if(sessionStorage.getItem("userKey") == null || sessionStorage.getItem("userKey") == ""){
            window.location = "login";
        }
    }

    async verifyRegistration(e) {
        e.preventDefault();
        let response = await fetch(
          "https://ecosort.saivedagiri.com/verifyRegistration",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              userid: sessionStorage.getItem("userKey"),
            },
          }
        ).catch((err) => console.log(err));
        let json = await response.json();
        if (json.data === "Valid") {
          window.location = "dashboard";
        } else {
            alert("Please complete your device registration and try again.");
        }
      }

    render() {
        return (
            <div>
                <Header />
                <section className="features-icons bg-light text-center" style={{ paddingTop: '0px' }}>
                    <p style={{ fontSize: '24px', marginRight: '50px', marginLeft: '50px', paddingTop: '20vh' }}><br /><br /></p>
                    <h1>Register your EcoSort Device</h1>
                    <p>Please log on to the EcoSort app, log in, and scan the QR code attached to your device.</p>
                    <button id="submit_button" style={{width: "auto"}} onClick={this.verifyRegistration.bind(this)}>I'm done!</button>
                </section>

                <Footer />
            </div>
        );
    }

}

export default RegisterDevice;