import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ignore: must_be_immutable
class DetailsPage extends StatefulWidget {
  var detailsJSON;

  DetailsPage({Key? key, required this.detailsJSON}) : super(key: key);

  @override
  _DetailsPageState createState() => _DetailsPageState();
}

class _DetailsPageState extends State<DetailsPage> {
  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    return Scaffold(
      appBar: AppBar(
        title: Text("View Details"),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Image.network(widget.detailsJSON["imageurl"],
                height: MediaQuery.of(context).size.height * 0.5),
            Padding(
              padding: const EdgeInsets.only(
                  left: 30.0, right: 30.0, top: 2.0, bottom: 2.0),
              child: Text(
                "Time taken: ${widget.detailsJSON["time"]}",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 20),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                  left: 30.0, right: 30.0, top: 2.0, bottom: 2.0),
              child: widget.detailsJSON['result'] == "true"
                  ? Text(
                      "Recyclable (${widget.detailsJSON['label']})",
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 20),
                    )
                  : Text(
                      "Not Recyclable (${widget.detailsJSON['label']})",
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 20),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
