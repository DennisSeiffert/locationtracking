from pymongo import MongoClient

def importDataFromCentralMongoDb() :
    client = MongoClient('192.168.1.101', 3017)
    db = client.parse
    posts = db.Posts
    for post in posts.find().sort("timestamputc", -1):
        yield post
