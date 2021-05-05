if (sessionStorage.getItem('userKey') == null || sessionStorage.getItem('userKey') == "null") {
  window.location.href = "login.html";
}

let SpeechRecognition = window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
let textDiv = document.getElementById('bullets');
let final_transcript = '';
let interim_transcript = '';
let lastInput;
let currentSlideTitle;
recognition.continuous = true;
recognition.interimResults = true;
let bulletNum = 0;
let firstSentence = true;
let secondStop = false;
let state = false;
let var1;
let myCanvas;

let chart;

recognition.lang = "en-us";

setup();

async function setup() {
  let result;
  await axios({
    method: 'POST',
    url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/createSetup',
    headers: {
      'Content-Type': 'application/json',
      'userkey': sessionStorage.getItem('userKey'),
      'accesstoken': localStorage.getItem('access_token')
    }
  })
    .then(data => result = data.data)
    .catch(err => console.log(err))
  sessionStorage.setItem('accessKey', result.accesskey);
  sessionStorage.setItem('firebasePresentationKey', result.firebasepresentationkey)
  sessionStorage.setItem('currentSlide', result.currentslide);
}

recognition.start();
let myBullet = document.createElement('li');
myBullet.innerText = interim_transcript;
myBullet.id = `bullet${bulletNum}`;
myBullet.style.display = "none";
myBullet.style.fontSize = "30px";
document.getElementById('bullets').appendChild(myBullet);

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function (m) { return m.toUpperCase(); });
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

recognition.onstart = function () {
  console.log('Voice recognition is ON.');
}

recognition.onspeechend = function () {
  console.log('No activity.');
}

recognition.onerror = function (event) {
  if (event.error == 'no-speech') {
    console.log('Try again.');
  }
}

recognition.onresult = async function (event) {
  interim_transcript = '';

  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      final_transcript += event.results[i][0].transcript;
    } else {
      interim_transcript += event.results[i][0].transcript;
    }
  }
  final_transcript = capitalize(final_transcript);
  console.log(linebreak(final_transcript));
  console.log(linebreak(interim_transcript));
  if (firstSentence && interim_transcript != '') {
    lastInput = interim_transcript;
    firstSentence = false;
    secondStop = true;
    document.getElementById('accessKey').innerText = `Access Key: ${sessionStorage.getItem('accessKey')}`;
    document.getElementById('accessKey').style.position = 'absolute';
    document.getElementById('accessKey').style.left = '10px';
    document.getElementById('accessKey').style.top = '10px';
  } else if (secondStop && interim_transcript != '') {
    lastInput = interim_transcript;
  } else if (secondStop && interim_transcript == '') {
    secondStop = false;
    words = lastInput.split(" ");
    currentSlideTitle = capitalizeFirstLetter(words[words.length - 1]);
    axios({
      method: 'POST',
      url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/createTitle',
      headers: {
        'Content-Type': 'application/json',
        'slidetitle': currentSlideTitle,
        'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey')
      }
    });
    document.getElementById('heading').innerText = randomBeginning() + capitalizeFirstLetter(words[words.length - 1]);
    document.getElementById('heading').style.backgroundColor = `rgb(${Math.random() * 101 + 50},${Math.random() * 101 + 50},${Math.random() * 101 + 50})`;
  } else if (!firstSentence && !secondStop) {
    if (interim_transcript == '') {
      await checkInput(lastInput);
      if (state == false) {
        bulletNum++;
        let myBullet = document.createElement('li');
        myBullet.innerText = interim_transcript;
        myBullet.id = `bullet${bulletNum}`;
        myBullet.style.display = "none";
        myBullet.style.fontSize = "30px";
        document.getElementById('bullets').appendChild(myBullet);
        final_transcript = '';
      }
      html2canvas(document.getElementById("fullPage")).then(canvas => {
        myCanvas = canvas;
      });
      var1 = myCanvas.toDataURL("image/png");
      console.log(var1);
      axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/slideUrl',
        headers: {
          'Content-Type': 'application/json',
          'slideurl': var1,
          'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey')
        }
      });
      let imageUrl = document.getElementById("image").src;

      axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/imageUrl',
        headers: {
          'Content-Type': 'application/json',
          'imageurl': imageUrl,
          'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey')
        }
      });
    } else {
      if (state == false) {
        document.getElementById(`bullet${bulletNum}`).style.display = "block";
        document.getElementById(`bullet${bulletNum}`).innerText = "• " + interim_transcript;
      }
      let myCanvas;
      lastInput = interim_transcript;
    }
  }
};

async function checkInput(input) {

  if ((input.includes("resume") || input.includes("continue"))) {
    state = false;
  }
  if (state == false) {
    if (input.toLowerCase().includes("slide")) {
      type = "newSlide";
      console.log("slide");
      let words = input.split(" ");
      currentSlideTitle = words[words.length - 1];
      document.getElementById('bullets').innerHTML = "";
      document.getElementById('images').innerHTML = "";
      document.getElementById('heading').innerText = randomBeginning() + capitalizeFirstLetter(words[words.length - 1]);
      document.getElementById('heading').style.backgroundColor = `rgb(${Math.random() * 101 + 50},${Math.random() * 101 + 50},${Math.random() * 101 + 50})`;
    }
    else if (input.includes("image") || input.includes("picture")) {
      console.log("image");
      let list = await document.getElementById(`bullet${bulletNum}`);
      if (list.hasChildNodes()) {
        list.removeChild(list.childNodes[0]);
      }
      displayImage();

      //search bing for image and put it on right side
    }
    else if (input.includes("graph") || input.includes("figure") || input.includes("chart")) {
      console.log("graph")
      let list = await document.getElementById(`bullet${bulletNum}`);
      if (list.hasChildNodes()) {
        list.removeChild(list.childNodes[0]);
      }
      bulletNum--;
      displayGraph();
      //generate random graph
    }
    else if (input.includes("second") || input.includes("info")) {
      let list = await document.getElementById(`bullet${bulletNum}`);
      if (list.hasChildNodes()) {
        list.removeChild(list.childNodes[0]);
      }
      getWiki(currentSlideTitle);
    }
    else if (input.includes("pause") || input.includes("halt")) {
      state = true;
      let list = await document.getElementById(`bullet${bulletNum}`);
      if (list.hasChildNodes()) {
        list.removeChild(list.childNodes[0]);
      }
      bulletNum--;
    }

    else if (input.includes("remove") && input.includes("point")
      || input.includes("remove") && input.includes("bullet")
      || input.includes("bullet") && input.includes("point")
      || input.includes("remove") && input.includes("last")
      || input.includes("last") && input.includes("bullet")
    ) {
      let list = await document.getElementById(`bullet${bulletNum}`);
      if (list.hasChildNodes()) {
        list.removeChild(list.childNodes[0]);
      }
      bulletNum--;
      let list2 = await document.getElementById(`bullet${bulletNum}`);
      if (list2.hasChildNodes()) {
        list2.removeChild(list.childNodes[0]);
      }
      bulletNum--;
    }
    else if (input.includes("end") && input.includes("slideshow") || input.includes("end") && input.includes("presentation") || input.includes("finish") && input.includes("presentation") || input.includes("finish") && input.includes("slideshow")) {
      axios({
        method: 'POST',
        url: 'https://syncfastserver.macrotechsolutions.us:9146/http://localhost/endScreen',
        headers: {
          'Content-Type': 'application/json',
          'firebasepresentationkey': sessionStorage.getItem('firebasePresentationKey')
        }
      });
      //send endscreen.png to all viewers
      window.location.href = "index.html";
    }
  }
}
function randomBeginning() {
  let possibilities = [
    "All About ",
    "What to Know About ",
    "The Facts on ",
    "Info on ",
    "Info About ",
    "Facts About ",
    "Learn About ",
    "Get to Know ",
    "Have You Heard About ",
    "Learn More About "
  ];

  let i = parseInt(Math.random() * (possibilities.length));
  return possibilities[i];
}

function capitalizeFirstLetter(string) {
  if (typeof string == undefined) return;
  var firstLetter = string[0] || string.charAt(0);
  return firstLetter ? firstLetter.toUpperCase() + string.substr(1) : '';
}

function displayImage() {
  searchWord = currentSlideTitle;

  $(document).ready(function () {
    var API_KEY = '5bdbd1129f9e6f3584db4a8e0f3b1bb2';
    let url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&format=json&nojsoncallback=1&text=${searchWord}&extras=url_o&sort=interestingness-desc&safe_search=1`
    return axios.get(url).then(res => {
      var validPhotos = res.data.photos.photo.filter(function (photo) {
        if (photo.url_o != undefined) {
          return photo;
        }
      });
      randomNumber = parseInt(Math.random() * 25);
      var displayPic = validPhotos[randomNumber].url_o;
      let imageDiv = document.getElementById('images');
      imageDiv.innerHTML = "";
      let imageElement = document.createElement('img');
      imageElement.style.height = "70vh";
      imageElement.style.width = "auto";
      imageElement.style.marginLeft = "-350px";
      imageElement.id = "image";
      imageElement.src = displayPic;
      imageDiv.appendChild(imageElement);
    });
    // $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
    //   {
    //     tags: searchWord,
    //     tagmode: "any",
    //     format: "json"
    //   },
    //   function (data) {
    //     var rnd = Math.floor(Math.random() * data.items.length);

    //     var image_src = data.items[rnd]['media']['m'].replace("_m", "_b");

    //     let imageDiv = document.getElementById('images');
    //     imageDiv.innerHTML = "";
    //     let imageElement = document.createElement('img');
    //     imageElement.style.height = "70vh";
    //     imageElement.style.width = "auto";
    //     imageElement.style.marginLeft = "-350px";
    //     imageElement.src = image_src;
    //     imageDiv.appendChild(imageElement);

    //   });

  });
}

async function displayGraph() {

  let choice = Math.floor(Math.random() * 3);
  let name = capitalizeFirstLetter(currentSlideTitle);
  if (choice == 1) {
    let one = Math.floor(Math.random() * 500);
    let two = Math.floor(Math.random() * 500);
    let three = Math.floor(Math.random() * 500);
    let four = Math.floor(Math.random() * 500);
    let total = one + two + three + four;
    one = one / total * 100;
    two = two / total * 100;
    three = three / total * 100;
    four = four / total * 100;

    chart = await new CanvasJS.Chart("images", {
      animationEnabled: true,
      title: {
        text: name
      },
      data: [{
        type: "pie",
        startAngle: 240,
        yValueFormatString: "##0.00\"%\"",
        indexLabel: "{label} {y}",
        dataPoints: [
          { y: one, label: "" },
          { y: two, label: "" },
          { y: three, label: "" },
          { y: four, label: "" },
        ]
      }]
    });
    console.log(chart);
    chart.render();
  } else if (choice == 2) {
    chart = await new CanvasJS.Chart("images", {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: name
      },
      axisY: {
        includeZero: false
      },
      data: [{
        type: "line",
        dataPoints: [
          { y: Math.floor(Math.random() * 7) },
          { y: Math.floor(Math.random() * 7) },
          { y: Math.floor(Math.random() * 7) },
          { y: Math.floor(Math.random() * 7) },
          { y: Math.floor(Math.random() * 7) },
          { y: Math.floor(Math.random() * 7) },
          { y: Math.floor(Math.random() * 7) },
          { y: Math.floor(Math.random() * 7) }
        ]
      }]
    });
    chart.render();
  } else {

    chart = await new CanvasJS.Chart("images", {
      animationEnabled: true,

      title: {
        text: name
      },
      axisX: {
        interval: 1
      },
      axisY2: {
        interlacedColor: "rgba(1,77,101,.2)",
        gridColor: "rgba(1,77,101,.1)",
      },
      data: [{
        type: "bar",
        axisYType: "secondary",
        color: "#014D65",
        dataPoints: [
          { y: Math.floor(Math.random() * 4), label: "" },
          { y: Math.floor(Math.random() * 4) + 4, label: "" },
          { y: Math.floor(Math.random() * 4) + 8, label: "" },
          { y: Math.floor(Math.random() * 4) + 12, label: "" }
        ]
      }]
    });
    chart.render();
  }
  chart.id = "image";

}
/*let imageDiv = document.getElementById('images');
imageDiv.innerHTML = "";
let imageElement = document.createElement('img');
imageElement.style.height = "70vh";
imageElement.style.width = "auto";
imageElement.style.marginLeft = "-350px";
imageElement.src = displayPic;
imageDiv.appendChild(imageElement);*/

function getWiki(place) {
  var URL = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=';

  URL += "&titles=" + place;
  URL += "&rvprop=content";
  URL += "&callback=?";
  $.getJSON(URL, function (data) {
    var obj = data.query.pages;
    var obj = data.query.pages;
    var ob = Object.keys(obj)[0];
    console.log(obj[ob]["extract"]);
    try {
      console.log(obj[ob]["extract"]);
      let sentences = obj[ob]["extract"].split(".");
      console.log(obj[ob]["extract"]);
      if (sentences[1] == undefined) {
        getWiki(place.substring(0, place.length - 1));
        return;
      }
      bulletNum++;
      let myBullet = document.createElement('li');
      myBullet.style.display = "none";
      myBullet.innerText = "• " + sentences[0];
      myBullet.id = `bullet${bulletNum}`;
      myBullet.style.fontSize = "30px";
      document.getElementById('bullets').appendChild(myBullet);
      document.getElementById(`bullet${bulletNum}`).style.display = "block";
      bulletNum++;
      let myBullet2 = document.createElement('li');
      myBullet2.style.display = "none";
      myBullet2.innerText = "• " + sentences[1];
      myBullet2.id = `bullet${bulletNum}`;
      myBullet2.style.fontSize = "30px";
      document.getElementById('bullets').appendChild(myBullet2);
      document.getElementById(`bullet${bulletNum}`).style.display = "block";
    }
    catch (err) {
      console.log(err.message);
    }

  });
}