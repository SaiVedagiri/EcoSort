import React from 'react';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css';
import Header from "./Header";
import Footer from "./Footer";


class Error extends React.Component {

    render() {
        return (
            <div>
                <Header />
                <section className="features-icons bg-light text-center" style={{ paddingTop: '0px' }}>
                    <p style={{ fontSize: '24px', marginRight: '50px', marginLeft: '50px', paddingTop: '50px' }}><br /><br /></p>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-16  offset-lg-4 offset-xl-4">
                                <div className="mx-auto features-icons-item">
                                    <div className="d-flex features-icons-icon">
                                        <div className="material-icons m-auto"><i className="fas fa-exclamation-triangle m-auto text-primary"></i></div>
                                    </div>
                                    <h3>Error</h3>
                                    <p className="lead mb-0">The requested URL does not exist.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        );
    }

}

export default Error;