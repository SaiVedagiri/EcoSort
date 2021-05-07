import React from "react";

class AppleUser extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let params = new URLSearchParams(document.location.search.substring(1));
    let user = params.get("user");
    console.log(JSON.parse(user));
    sessionStorage.setItem("userKey", params.get("userkey"));
    sessionStorage.setItem("profilePic", params.get("imageurl"));
    if(params.get("deviceid") != null && params.get("deviceid") != ""){
      window.location = "dashboard";
    } else{
      window.location = "registerDevice"
    }
  }

  render() {
    return( <div></div>);
  }
}

export default AppleUser;