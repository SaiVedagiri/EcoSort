import 'package:ecosort/pages/home.dart';
import 'package:ecosort/pages/takePicture.dart';
import 'package:flutter/material.dart';
import 'dart:io';

class DisplayPicturePage extends StatefulWidget {
  final String imagePath;
  final bool recyclable;

  const DisplayPicturePage({Key? key, required this.imagePath, required this.recyclable})
      : super(key: key);

  @override
  DisplayPicturePageState createState() => DisplayPicturePageState();
}

// A widget that displays the picture taken by the user.
class DisplayPicturePageState extends State<DisplayPicturePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Review your Picture')),
      // The image is stored as a file on the device. Use the `Image.file`
      // constructor with the given path to display the image.
      body: Center(
        child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Image.file(File(widget.imagePath)),
              Text(widget.recyclable ? "Item can be recycled." : "Item cannot be recycled."),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  FloatingActionButton.extended(
                      icon: Icon(Icons.camera),
                      label: Text("Retake"),
                      onPressed: () async {
                        Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                            builder: (context) => TakePicturePage()));
                      }),
                  FloatingActionButton.extended(
                      icon: Icon(Icons.keyboard_return),
                      label: Text("Return"),
                      onPressed: () async {
                        Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                                builder: (context) => HomePage()));
                      }),
                ],
              )
            ]),
      ),
    );
  }
}
