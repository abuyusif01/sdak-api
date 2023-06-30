import requests
import json


def registerUsers():
    url = "https://localhost:8081/api/register"
    headers = {"Content-Type": "application/json"}

    # Define the user data
    users = [
        {"email": "admin@gmail.com", "password": "password1", "role": "admin"},
        {"email": "user2@user.com", "password": "password2", "role": "user"},
        {"email": "user3@user.com", "password": "password3", "role": "user"},
        {"email": "user4@user.com", "password": "password4", "role": "user"},
    ]

    # Send the POST request
    for user in users:
        response = requests.post(url, headers=headers, data=json.dumps(user))
        print(f'Response for {user["email"]}: {response.status_code}')


def getXaccessToken():
    url = "https://localhost:8081/api/login"
    headers = {"Content-Type": "application/json"}

    # Define the user data

    data = {"email": "admin@gmail.com", "password": "password1", "role": "admin"}

    # Send the POST request

    response = requests.post(url, headers=headers, data=data)
    return response.json()["x-access-token"]


def addDoors():
    url = "https://localhost:8081/api/addDoor"
