from gpiozero import AngularServo
import time

servo1 = AngularServo(2)
servo2 = AngularServo(3)
while True:
    servo1.angle = 0
    servo2.angle = 0
    time.sleep(3)
