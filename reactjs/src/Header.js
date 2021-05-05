import React from 'react';
import './assets/bootstrap/css/bootstrap.min.css?h=f5a1d9969d3ca654f018a59129eb51d7';
import './assets/css/fontawesome.css';
import './assets/css/material-icons.min.css';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css?h=3d9cd1f3d1dcb3b47af13da2a2ba5246';
import { Link } from "react-router-dom";
import Logo from './assets/img/logo.png';

function Header() {
    return (
        <nav className="navbar navbar-light navbar-expand bg-dark navigation-clean">
            <div className="container">
                <Link className="navbar-brand d-xl-flex justify-content-xl-center align-items-xl-center" to={"./"} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '52px', fontFamily: 'Lato, sans-serif' }}>
                    <img alt="EcoSort" src={Logo} style={{ width: '66px' }} /><span>&nbsp; &nbsp;</span>EcoSort</Link>
                </div>
        </nav>
    );
}

export default Header;