import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Error from "./Error";
import Terms from "./Terms";
import Privacy from "./Privacy";
import AppleUser from "./AppleUser";
import RegisterDevice from "./RegisterDevice";
import Dashboard from "./Dashboard";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/privacy" component={Privacy} />
          <Route exact path="/terms" component={Terms} />
          <Route exact path="/appleUser" component={AppleUser} />
          <Route exact path="/registerDevice" component={RegisterDevice} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route component={Error} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;