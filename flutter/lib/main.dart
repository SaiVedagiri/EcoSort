// @dart=2.9
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ecosort/pages/launch.dart';
import 'package:ecosort/pages/history.dart';
import 'package:ecosort/pages/registerDevice.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  var prefs = await SharedPreferences.getInstance();
  var userID = prefs.getString('userID');
  var deviceID = prefs.getString('deviceID');
  if (deviceID != null && deviceID != "") {
    runApp(EcoSortAuthApp());
  } else if (userID != null && userID != "") {
    runApp(EcoSortRegisterApp());
  } else {
    runApp(EcoSortApp());
  }
}

class EcoSortApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: LaunchPage(),
    );
  }
}

class EcoSortRegisterApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: RegisterDevicePage(),
    );
  }
}

class EcoSortAuthApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: HistoryPage(),
    );
  }
}
