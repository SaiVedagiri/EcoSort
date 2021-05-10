import os


if __name__ == "__main__":
    stream = os.popen('fswebcam --no-banner ../images/image.jpg')
    output = stream.read()