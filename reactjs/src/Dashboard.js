import React from 'react';
import './assets/fonts/fontawesome5-overrides.min.css';
import './assets/css/styles.min.css';
import Header from "./Header";
import Footer from "./Footer";


class Dashboard extends React.Component {
    componentDidMount() {
        if(sessionStorage.getItem("userKey") == null || sessionStorage.getItem("userKey") == ""){
            window.location = "login";
        }
    }
    render() {
        return (
            <div>
                <Header />
                <section className="features-icons bg-light text-center" style={{ paddingTop: '0px' }}>
                    <p style={{ fontSize: '24px', marginRight: '50px', marginLeft: '50px', paddingTop: '50px' }}><br /><br /></p>
                </section>

                <Footer />
            </div>
        );
    }

}

export default Dashboard;