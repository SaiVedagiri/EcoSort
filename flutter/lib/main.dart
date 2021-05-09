import 'package:flutter/material.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ecosort/pages/launch.dart';
import 'package:ecosort/pages/home.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  var prefs = await SharedPreferences.getInstance();
  String userID = prefs.getString('userID');
  if(userID != ""){
    runApp(EcoSortApp());
  } else{
    runApp(EcoSortAuthApp());
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

class EcoSortAuthApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: HomePage(),
    );
  }
}