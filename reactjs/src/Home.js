import React from 'react';
import './assets/bootstrap/css/bootstrap.min.css?h=f5a1d9969d3ca654f018a59129eb51d7';
import './assets/css/fontawesome.css';
import './assets/css/material-icons.min.css';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css?h=3d9cd1f3d1dcb3b47af13da2a2ba5246';
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function Home() {
  return (
    <div className="App">
      <div>
        <Header />
        <section className="features-icons bg-light text-center" style={{ paddingTop: '0px', paddingBottom: '10px' }}>
          <p style={{ fontSize: '24px', marginRight: '50px', marginLeft: '50px', paddingTop: '50px' }}><br />EcoSort is a device to automatically sort waste items, using the Clarifai API, into trash and recycling to make it easier for users to help the environment. Our design for promoting recycling involves using a Raspberry Pi 4 to power the functionality of the apparatus. With a webcam (represented with a box of floss in the mock-up), we will implement the Clarifai computer vision API to categorize individual trash items as “garbage” or “recyclable” and relay that information through a Node.js server to our user website and mobile application built with React.js and Flutter respectively.<br /></p>
          <div className="container">
            <div className="row">
              <div className="col-lg-4 offset-lg-2 offset-xl-2">
                <div className="mx-auto features-icons-item mb-5 mb-lg-0 mb-lg-3">
                  <div className="d-flex features-icons-icon"><Link className="m-auto" to={'./login'}><i className="fas fa-user-lock m-auto text-primary" style={{ cursor: 'pointer' }}></i></Link></div>
                  <h3>Login</h3>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="mx-auto features-icons-item mb-5 mb-lg-0 mb-lg-3">
                  <div className="d-flex features-icons-icon"><Link className="m-auto" to={'./signup'}><i className="fas fa-user-plus m-auto text-primary" style={{ cursor: 'pointer' }}></i></Link></div>
                  <h3>Sign Up</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export default Home;