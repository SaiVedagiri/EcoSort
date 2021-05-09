import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:ecosort/pages/login.dart';
import 'package:ecosort/pages/signup.dart';
import 'package:ecosort/components/hex.dart';
import 'package:ecosort/components/browser.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class LaunchPage extends StatefulWidget {
  LaunchPage({Key? key}) : super(key: key);

  final ChromeSafariBrowser browser =
      new MyChromeSafariBrowser(new InAppBrowser());

  @override
  _LaunchPageState createState() => _LaunchPageState();
}

class _LaunchPageState extends State<LaunchPage> {
  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    return Scaffold(
      appBar: AppBar(
        title: Text("EcoSort"),
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Invoke "debug painting" (press "p" in the console, choose the
          // "Toggle Debug Paint" action from the Flutter Inspector in Android
          // Studio, or the "Toggle Debug Paint" command in Visual Studio Code)
          // to see the wireframe for each widget.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Padding(
                padding: const EdgeInsets.all(30.0),
                child: Image(
                  image: AssetImage('assets/logo.png'),
                  height: 150,
                )),
            ListTile(
              title: ElevatedButton(
                style: ButtonStyle(
                  backgroundColor: MaterialStateProperty.resolveWith<Color>(
                        (Set<MaterialState> states) {
                          return HexColor("00b2d1");
                    },
                  ),
                ),
                onPressed: () {

                  Navigator.push(
                      context,
                      new MaterialPageRoute(
                          builder: (context) => new LogInPage()));
                },
                child: Text("Login"),
              ),
            ),
            ListTile(
                title: ElevatedButton(
                    style: ButtonStyle(
                      backgroundColor: MaterialStateProperty.resolveWith<Color>(
                            (Set<MaterialState> states) {
                          return HexColor("ff5ded");
                        },
                      ),
                    ),
                    onPressed: () {

                      Navigator.push(
                          context,
                          new MaterialPageRoute(
                              builder: (context) => new SignUpPage()));
                    },
                    child: Text("Signup"))),
            ListTile(
                title: ElevatedButton(
                    style: ButtonStyle(
                      backgroundColor: MaterialStateProperty.resolveWith<Color>(
                            (Set<MaterialState> states) {
                          return HexColor("c6c6c8");
                        },
                      ),
                    ),
                    onPressed: () async {
                      await widget.browser.open(
                          url: Uri.parse(
                              "https://ecosort.saivedagiri.com/privacy"),
                          options: ChromeSafariBrowserClassOptions(
                              android: AndroidChromeCustomTabsOptions(
                                  addDefaultShareMenuItem: true,
                                  keepAliveEnabled: true),
                              ios: IOSSafariOptions(
                                  dismissButtonStyle:
                                      IOSSafariDismissButtonStyle.CLOSE,
                                  presentationStyle: IOSUIModalPresentationStyle
                                      .OVER_FULL_SCREEN)));
                    },
                    child: Text("Privacy Policy"))),
          ],
        ),
      ),
    );
  }
}
