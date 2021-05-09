import time
from gpiozero import AngularServo

if __name__ == "__main__":
    servo = AngularServo(2)
    servo2 = AngularServo(3)
    servo.angle = -90
    servo2.angle = 90

    for i in range(15):
        time.sleep(2)
        if i % 5 == 0:
            servo.angle = -90
            servo2.angle = 90
        elif i % 5 == 1:
            servo.angle = -45
            servo2.angle = 45
        elif i % 5 == 2:
            servo.angle = 0
            servo2.angle = 0
        elif i % 5 == 3:
            servo.angle = 45
            servo2.angle = -45
        else:
            servo.angle = 90
            servo2.angle = -90
    