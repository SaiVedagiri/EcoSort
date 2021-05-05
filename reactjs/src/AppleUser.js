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
    window.location = "landing";
  }

  render() {
    return( <div></div>);
  }
}

export default AppleUser;