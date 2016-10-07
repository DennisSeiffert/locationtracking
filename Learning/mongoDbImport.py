from pymongo import MongoClient

def importDataFromCentralMongoDb(fromBegin, tillEnd) :
    client = MongoClient('192.168.1.101', 3017)
    db = client.parse
    posts = db.Posts
    for post in posts.find({"$and" : [{ "timestamputc" : { "$gt" : fromBegin }},
                                      { "timestamputc" : { "$lt" : tillEnd }}] }).sort("timestamputc", -1):
        yield post
