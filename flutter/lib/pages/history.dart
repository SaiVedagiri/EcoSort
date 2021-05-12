import 'takePicture.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/io.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:http/http.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'detailDisplay.dart';

// ignore: must_be_immutable
class HistoryPage extends StatefulWidget {
  HistoryPage({Key? key}) : super(key: key);

  @override
  _HistoryPageState createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  var historyList = [];
  var prefs;

  @override
  void initState() {
    super.initState();
    initStateFunction();
  }

  void initStateFunction() async {
    prefs = await SharedPreferences.getInstance();
    Map<String, String> headers = {
      "Content-type": "application/json",
      "Origin": "*",
      "deviceid": prefs.getString("deviceID")
    };
    Response response = await post(
        Uri.parse('https://ecosort.saivedagiri.com/getDeviceStats'),
        headers: headers);
    var resultJson = jsonDecode(response.body);
    historyList = resultJson['data'];
    setState(() {});
  }

  Future<dynamic> confirmDelete(BuildContext context) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text("Delete History"),
              content: Text(
                  "Are you sure you want to clear all of the recorded entries?"),
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () async {
                    Navigator.of(context).pop();
                    Map<String, String> headers = {
                      "Content-type": "application/json",
                      "Origin": "*",
                      "deviceid": prefs.getString("deviceID")
                    };
                    await post(
                        Uri.parse(
                            'https://ecosort.saivedagiri.com/clearDeviceStats'),
                        headers: headers);
                    historyList = [];
                    setState(() {});
                  },
                  child: Text("Yes"),
                ),
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("No"),
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

    var channel =
    IOWebSocketChannel.connect("wss://ecosort.saivedagiri.com:4211");
    channel.stream.listen((message) async {
      if (message == prefs.getString("deviceID")) {
        Map<String, String> headers = {
          "Content-type": "application/json",
          "Origin": "*",
          "deviceid": prefs.getString("deviceID")
        };
        Response response = await post(
            Uri.parse('https://ecosort.saivedagiri.com/getDeviceStats'),
            headers: headers);
        var resultJson = jsonDecode(response.body);
        historyList = resultJson['data'];
        setState(() {});
      }
    });

    return Scaffold(
        appBar: AppBar(title: Text("Device History"), actions: <Widget>[
          IconButton(
              icon: Icon(Icons.refresh),
              onPressed: () async {
                Map<String, String> headers = {
                  "Content-type": "application/json",
                  "Origin": "*",
                  "deviceid": prefs.getString("deviceID")
                };
                Response response = await post(
                    Uri.parse('https://ecosort.saivedagiri.com/getDeviceStats'),
                    headers: headers);
                var resultJson = jsonDecode(response.body);
                historyList = resultJson['data'];
                setState(() {});
              }),
          IconButton(
              icon: Icon(Icons.delete_forever),
              onPressed: () {
                confirmDelete(context);
              }),
        ]),
        bottomNavigationBar: BottomAppBar(
          child: new Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: <Widget>[
                IconButton(
                  icon: Icon(Icons.history),
                  onPressed: () {},
                ),
                IconButton(
                  icon: Icon(Icons.camera_alt),
                  color: Colors.grey,
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      PageRouteBuilder(
                        pageBuilder: (context, animation1, animation2) =>
                            TakePicturePage(),
                        transitionDuration: Duration(seconds: 0),
                      ),
                    );
                  },
                ),
              ]),
        ),
        body: ListView.builder(
            itemCount: historyList.length,
            itemBuilder: (context, index) {
              return Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: 1.0, horizontal: 4.0),
                child: Card(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      ListTile(
                        leading: CircleAvatar(
                          backgroundImage:
                              NetworkImage(historyList[index]['imageurl']),
                        ),
                        title: Text(historyList[index]['time']),
                        subtitle: historyList[index]['result'] == "true"
                            ? Text(
                                "Recyclable (${historyList[index]['label']})")
                            : Text(
                                "Not Recyclable (${historyList[index]['label']})"),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: <Widget>[
                          TextButton(
                            child: const Text('VIEW DETAILS'),
                            onPressed: () {
                              Navigator.push(
                                  context,
                                  new MaterialPageRoute(
                                      builder: (context) => new DetailsPage(
                                          detailsJSON: historyList[index])));
                            },
                          ),
                          const SizedBox(width: 8),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }));
  }
}
