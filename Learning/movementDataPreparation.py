from geopy.distance import vincenty


def calculateDistance(lat1, lon1, lat2, lon2):
    return vincenty((lat1, lon1), (lat2, lon2)).meters