import os
from imgurpython import ImgurClient
import requests

if __name__ == "__main__":
    client_id = '20c527d1ac24c2f'
    client_secret = '4201a242a8a0b413fd6d508101c927b9ca9c9b9f'

    client = ImgurClient(client_id, client_secret)

    stream = os.popen('fswebcam --no-banner ../images/image.jpg')
    output = stream.read()

    myImage = client.upload_from_path('../images/image.jpg', config=None, anon=True)

    print(myImage['link'])

    res1 = requests.post("https://ecosort.saivedagiri.com/analyzeImageClarifai", headers={"imageurl": myImage['link']})
    res2 = requests.post("https://ecosort.saivedagiri.com/analyzeImageGoogle", headers={"imageurl": myImage['link']})

    print(res1.text)
    print(res2.text)