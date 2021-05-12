import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'dart:async';
import 'dart:convert';
import 'displayPicture.dart';

// ignore: import_of_legacy_library_into_null_safe
import 'package:imgur/imgur.dart' as imgur;

// ignore: import_of_legacy_library_into_null_safe
import 'package:http/http.dart';

import 'history.dart';

// A screen that allows users to take a picture using a given camera.
class TakePicturePage extends StatefulWidget {
  const TakePicturePage({Key? key}) : super(key: key);

  @override
  TakePicturePageState createState() => TakePicturePageState();
}

class TakePicturePageState extends State<TakePicturePage> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;
  late var client;
  bool initialized = false;

  @override
  void initState() {
    super.initState();
    initStateFunction();
  }

  void initStateFunction() async {
    final cameras = await availableCameras();

    // Get a specific camera from the list of available cameras.
    var firstCamera = cameras.first;

    _controller = CameraController(
      // Get a specific camera from the list of available cameras.
      firstCamera,
      // Define the resolution to use.
      ResolutionPreset.medium,
    );

    // Next, initialize the controller. This returns a Future.
    _initializeControllerFuture = _controller.initialize();

    client = imgur.Imgur(imgur.Authentication.fromClientId('20c527d1ac24c2f'));

    initialized = true;
    setState(() {});
  }

  @override
  void dispose() {
    // Dispose of the controller when the widget is disposed.
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Take a picture')),
      // Wait until the controller is initialized before displaying the
      // camera preview. Use a FutureBuilder to display a loading spinner
      // until the controller has finished initializing.
      body: initialized
          ? FutureBuilder<void>(
              future: _initializeControllerFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.done) {
                  // If the Future is complete, display the preview.
                  return CameraPreview(_controller);
                } else {
                  // Otherwise, display a loading indicator.
                  return Center(child: CircularProgressIndicator());
                }
              },
            )
          : Center(child: CircularProgressIndicator()),
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
      floatingActionButton: initialized
          ? FloatingActionButton(
        child: Icon(Icons.camera_alt),
        // Provide an onPressed callback.
        onPressed: () async {
          // Take the Picture in a try / catch block. If anything goes wrong,
          // catch the error.
          try {
            // Ensure that the camera is initialized.
            await _initializeControllerFuture;

            // Construct the path where the image should be saved using the
            // pattern package.
            // final path = join(
            //   // Store the picture in the temp directory.
            //   // Find the temp directory using the `path_provider` plugin.
            //   (await getTemporaryDirectory()).path,
            //   '${DateTime.now()}.png',
            // );

            // Attempt to take a picture and log where it's been saved.
            XFile file = await _controller.takePicture();

            bool recyclable = true;
            initialized = false;

            setState(() {});

            await client.image
                .uploadImage(imagePath: file.path)
                .then((image) async {
              Map<String, String> headers = {
                "Content-type": "application/json",
                "Origin": "*",
                "imageurl": image.link,
              };

              Response response = await post(
                  Uri.parse(
                      'https://ecosort.saivedagiri.com/analyzeImageGoogle'),
                  headers: headers);
              var resultJson = jsonDecode(response.body);
              if (resultJson["data"] == "false") {
                recyclable = false;
              }
            });

            // If the picture was taken, display it on a new screen.
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => DisplayPicturePage(
                    imagePath: file.path, recyclable: recyclable),
              ),
            );
          } catch (e) {
            // If an error occurs, log the error to the console.
            print(e);
          }
        },
      ) : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}
