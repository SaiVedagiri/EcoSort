import time
from gpiozero import DistanceSensor

if __name__ == "__main__":
    ultrasonic = DistanceSensor(echo = 24, trigger = 18, max_distance = 1, threshold_distance = 0.3)
    
    for i in range(3):
        ultrasonic.wait_for_in_range()
        print("in range: ", ultrasonic.distance)
        ultrasonic.wait_for_out_of_range()
        print("out of range: ", ultrasonic.distance)
        