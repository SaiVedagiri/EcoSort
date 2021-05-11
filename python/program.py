import time, os, requests
from gpiozero import AngularServo, DistanceSensor
from imgurpython import ImgurClient

if __name__ == "__main__":
    client_id = '20c527d1ac24c2f'
    client_secret = '4201a242a8a0b413fd6d508101c927b9ca9c9b9f'

    client = ImgurClient(client_id, client_secret)
    frontServo = AngularServo(2)
    backServo = AngularServo(3)
    ultrasonic = DistanceSensor(echo=24, trigger=18, max_distance=1, threshold_distance=0.3)
    deviceID = "OcfWUGKSdQ"

    frontServo.angle = 0
    backServo.angle = 0

    while True:
        ultrasonic.wait_for_in_range()
        print('in range: ', ultrasonic.distance)

        stream = os.popen('fswebcam --no-banner ../images/image.jpg')
        output = stream.read()

        myImage = client.upload_from_path('../images/image.jpg', config=None, anon=True)

        print(myImage['link'])

        # res1 = requests.post("https://ecosort.saivedagiri.com/analyzeImageClarifai", headers={"imageurl": myImage['link'], "deviceid": deviceID})
        res2 = requests.post("https://ecosort.saivedagiri.com/analyzeImageGoogle", headers={"imageurl": myImage['link'], "deviceid": deviceID})

        # print('clarifai: ', res1.text)
        print('google: ', res2.text)

        if 'true' in res2.text:
            print('Recycling now!')
            frontServo.angle = -90
            backServo.angle = 90
            time.sleep(1)
            frontServo.angle = 0
            backServo.angle = 0

        elif 'false' in res2.text:
            print('Trashing now!')
            frontServo.angle = 90
            backServo.angle = -90
            time.sleep(1)
            frontServo.angle = 0
            backServo.angle = 0

        else:
            print('Something went wrong with res2.text')