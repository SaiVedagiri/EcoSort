import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:io';
import 'dart:async';
import 'dart:convert';

// ignore: import_of_legacy_library_into_null_safe
import 'package:http/http.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'history.dart';
import 'registerDevice.dart';

String username = "";
String password = "";
var prefs;

GoogleSignIn googleSignIn = GoogleSignIn(
  scopes: [
    'email',
  ],
);

class LogInPage extends StatefulWidget {
  LogInPage({Key? key}) : super(key: key);

  @override
  _LogInPageState createState() => _LogInPageState();
}

class _LogInPageState extends State<LogInPage> {
  @override
  initState() {
    super.initState();
    initStateFunction();
  }

  initStateFunction() async {
    prefs = await SharedPreferences.getInstance();
  }

  Future<dynamic> createAlertDialog(
      BuildContext context, String title, String body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: Text(body),
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  Future<dynamic> helpContext(BuildContext context, String title, Widget body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: body,
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    googleSignIn.signOut();
    return Scaffold(
      appBar: AppBar(
        title: Text("Sign In"),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "Email Address"),
                onChanged: (String str) {
                  setState(() {
                    username = str;
                  });
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "Password"),
                obscureText: true,
                onChanged: (String str) {
                  setState(() {
                    password = str;
                  });
                },
              ),
            ),
            ListTile(
                title: ElevatedButton(
                    onPressed: () async {
                      Map<String, String> headers = {
                        "Content-type": "application/json",
                        "Origin": "*",
                        "email": username,
                        "password": password
                      };
                      Response response = await post(
                          Uri.parse('https://ecosort.saivedagiri.com/signIn'),
                          headers: headers);
                      var resultJson = jsonDecode(response.body);
                      if (resultJson["data"] == "Valid") {
                        resultJson = jsonDecode(response.body);
                        prefs.setString('userID', resultJson["id"]);

                        if (resultJson["deviceid"] != null &&
                            resultJson["deviceid"] != "") {
                          prefs.setString('deviceID', resultJson["deviceid"]);
                          Navigator.of(context).pushAndRemoveUntil(
                              MaterialPageRoute(
                                  builder: (BuildContext context) =>
                                      HistoryPage()),
                              (Route<dynamic> route) => false);
                        } else {
                          Navigator.of(context).pushAndRemoveUntil(
                              MaterialPageRoute(
                                  builder: (BuildContext context) =>
                                      RegisterDevicePage()),
                              (Route<dynamic> route) => false);
                        }
                      } else {
                        createAlertDialog(context, "Error", resultJson["data"]);
                      }
                    },
                    child: Text("Submit"))),
            Padding(
              padding: const EdgeInsets.only(top: 30.0),
              child: Text(
                "OR",
                style: TextStyle(
                  fontSize: 20.0,
                ),
              ),
            ),
            SizedBox(height: 50),
            ElevatedButton(
              style: ButtonStyle(
                backgroundColor: MaterialStateProperty.resolveWith<Color>(
                  (Set<MaterialState> states) {
                    return Colors.white;
                  },
                ),
              ),
              onPressed: () async {
                final GoogleSignInAccount? googleSignInAccount =
                    await googleSignIn.signIn();
                Map<String, String> headers = {
                  "Content-type": "application/json",
                  "Origin": "*",
                  "email": googleSignInAccount!.email
                };
                Response response = await post(
                    Uri.parse('https://ecosort.saivedagiri.com/googleSignIn'),
                    headers: headers);
                var resultJson = jsonDecode(response.body);
                prefs.setString('userID', resultJson["userkey"]);

                if (resultJson["deviceid"] != null &&
                    resultJson["deviceid"] != "") {
                  prefs.setString('deviceID', resultJson["deviceid"]);
                  Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(
                          builder: (BuildContext context) => HistoryPage()),
                      (Route<dynamic> route) => false);
                } else {
                  Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(
                          builder: (BuildContext context) =>
                              RegisterDevicePage()),
                      (Route<dynamic> route) => false);
                }
              },
              child: Padding(
                padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Image(
                        image: AssetImage("assets/google_logo.png"),
                        height: 35.0),
                    Padding(
                      padding: const EdgeInsets.only(left: 10),
                      child: Text(
                        'Sign in with Google',
                        style: TextStyle(
                          fontSize: 20,
                          color: Colors.black,
                        ),
                      ),
                    )
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(50, 20, 50, 10),
              child: SignInWithAppleButton(
                onPressed: () async {
                  final credential = await SignInWithApple.getAppleIDCredential(
                    scopes: [
                      AppleIDAuthorizationScopes.email,
                      AppleIDAuthorizationScopes.fullName,
                    ],
                    webAuthenticationOptions: WebAuthenticationOptions(
                      clientId: 'com.saivedagiri.ecosortlogin',
                      redirectUri: Uri.parse(
                        'https://ecosort.saivedagiri.com/callbacks/sign_in_with_apple',
                      ),
                    ),
                    // TODO: Remove these if you have no need for them
                    nonce: 'example-nonce',
                    state: 'example-state',
                  );

                  // This is the endpoint that will convert an authorization code obtained
                  // via Sign in with Apple into a session in your system
                  final signInWithAppleEndpoint = Uri(
                    scheme: 'https',
                    host: 'ecosort.saivedagiri.com',
                    path: '/sign_in_with_apple',
                    queryParameters: <String, String?>{
                      'code': credential.authorizationCode,
                      'firstName': credential.givenName,
                      'lastName': credential.familyName,
                      'useBundleId': Platform.isIOS ? 'true' : 'false',
                      if (credential.state != null) 'state': credential.state,
                    },
                  );

                  final response = await Client().post(
                    signInWithAppleEndpoint,
                  );

                  var resultJson = jsonDecode(response.body);
                  prefs.setString('userID', resultJson["userkey"]);

                  if (resultJson["deviceid"] != null &&
                      resultJson["deviceid"] != "") {
                    prefs.setString('deviceID', resultJson["deviceid"]);
                    Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(
                            builder: (BuildContext context) => HistoryPage()),
                        (Route<dynamic> route) => false);
                  } else {
                    Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(
                            builder: (BuildContext context) =>
                                RegisterDevicePage()),
                        (Route<dynamic> route) => false);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
