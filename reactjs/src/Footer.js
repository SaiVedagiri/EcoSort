import React from 'react';
import './assets/bootstrap/css/bootstrap.min.css?h=f5a1d9969d3ca654f018a59129eb51d7';
import './assets/css/fontawesome.css';
import './assets/css/material-icons.min.css';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css?h=3d9cd1f3d1dcb3b47af13da2a2ba5246';
import {Link} from "react-router-dom";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Footer(){
    return(
      <footer className="footer bg-light">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 my-auto h-100 text-center text-lg-left">
            <ul className="list-inline mb-2">
              <li className="list-inline-item"><Link to={"terms"}>Terms of &nbsp;Use</Link></li>
              <li className="list-inline-item">⋅<br /></li>
              <li className="list-inline-item"><Link to={"privacy"}>Privacy</Link></li>
            </ul>
            <p className="text-muted small mb-4 mb-lg-0">© Sai Vedagiri and Albert Zou. 2021. All Rights Reserved.</p>
          </div>
          <div className="col-lg-6 my-auto h-100 text-center text-lg-right">
            <ul className="list-inline mb-0">
              <li className="list-inline-item"><a href="https://github.com/SaiVedagiri/EcoSort"><FontAwesomeIcon className="fa fa-github fa-2x fa-fw" icon={faGithub} /></a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
    );
}

export default Footer;