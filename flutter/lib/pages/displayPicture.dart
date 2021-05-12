import 'takePicture.dart';
import 'history.dart';
import 'package:flutter/material.dart';
import 'dart:io';

class DisplayPicturePage extends StatefulWidget {
  final String imagePath;
  final bool recyclable;

  const DisplayPicturePage(
      {Key? key, required this.imagePath, required this.recyclable})
      : super(key: key);

  @override
  DisplayPicturePageState createState() => DisplayPicturePageState();
}

// A widget that displays the picture taken by the user.
class DisplayPicturePageState extends State<DisplayPicturePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Review your Result')),
      bottomNavigationBar: BottomAppBar(
        child: new Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: <Widget>[
              IconButton(
                icon: Icon(Icons.history),
                color: Colors.grey,
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation1, animation2) =>
                          HistoryPage(),
                      transitionDuration: Duration(seconds: 0),
                    ),
                  );
                },
              ),
              IconButton(
                icon: Icon(Icons.camera_alt),
                onPressed: () {

                },
              ),
            ]),
      ),
      body: Center(
        child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Image.file(File(widget.imagePath), height: MediaQuery.of(context).size.height * 0.5),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4.0),
              ),
              Text(widget.recyclable
                  ? "Item can be recycled."
                  : "Item cannot be recycled.", style: TextStyle(fontSize: 20),),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4.0),
              ),
              FloatingActionButton.extended(
                  icon: Icon(Icons.camera),
                  label: Text("Retake"),
                  onPressed: () async {
                    Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(
                            builder: (BuildContext context) =>
                                TakePicturePage()),
                            (Route<dynamic> route) => false);
                  }),
            ]),
      ),
    );
  }
}
