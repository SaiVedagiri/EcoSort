import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:barcode_scan2/barcode_scan2.dart';
import 'package:shared_preferences/shared_preferences.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:http/http.dart';
import 'package:ecosort/pages/home.dart';
import 'package:ecosort/pages/launch.dart';
import 'package:ecosort/components/hex.dart';


var prefs;

class RegisterDevicePage extends StatefulWidget {
  RegisterDevicePage({Key? key}) : super(key: key);

  @override
  _RegisterDevicePageState createState() => _RegisterDevicePageState();
}

class _RegisterDevicePageState extends State<RegisterDevicePage> {
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

    return Scaffold(
      appBar: AppBar(
        title: Text("Register Device"),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: Text(
                "Scan the QR code attached to your EcoSort device.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 20),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 30.0),
              child: FloatingActionButton.extended(
                  icon: Icon(Icons.camera),
                  label: Text("Scan QR"),
                  onPressed: () async {
                    try {
                      ScanResult qrResult = await BarcodeScanner.scan();
                      var result = qrResult.rawContent;
                      Map<String, String> headers = {
                        "Content-type": "application/json",
                        "Origin": "*",
                        "userid": prefs.getString("userID"),
                        "deviceid": result,
                      };
                      await post(
                          Uri.parse(
                              'https://ecosort.saivedagiri.com/registerDevice'),
                          headers: headers);
                      prefs.setString('deviceID', result);
                      Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                              builder: (BuildContext context) => HomePage()));
                    } on PlatformException catch (ex) {
                      if (ex.code == BarcodeScanner.cameraAccessDenied) {
                        setState(() {
                          createAlertDialog(context, "Scan QR",
                              "Please enable camera permissions for Grove App.");
                        });
                      } else {
                        setState(() {
                          createAlertDialog(context, "Scan QR",
                              "Unknown Error Occurred: $ex");
                        });
                      }
                    } on FormatException {
                      setState(() {
                        createAlertDialog(
                            context, "Scan QR", "No QR Code was recognized.");
                      });
                    } catch (ex) {
                      setState(() {
                        createAlertDialog(
                            context, "Scan QR", "Unknown Error Occurred: $ex");
                      });
                    }
                  }),
            ),
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
                      prefs.setString('userID', "");
                      Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                              builder: (BuildContext context) => LaunchPage()));
                    },
                    child: Text(
                      "Sign Out",
                      style: TextStyle(color: Colors.black),
                    ))),
          ],
        ),
      ),
    );
  }
}
