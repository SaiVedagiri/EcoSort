from imgurpython import ImgurClient

client_id = '20c527d1ac24c2f'
client_secret = '4201a242a8a0b413fd6d508101c927b9ca9c9b9f'

client = ImgurClient(client_id, client_secret)
myImage = client.upload_from_path('logo.png', config=None, anon=True)

print(myImage['link'])