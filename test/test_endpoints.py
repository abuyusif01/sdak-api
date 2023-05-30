import requests
import json

# set up variables for testing
base_url = "https://localhost:8081/api"
headers = {"Content-Type": "application/json", "x-access-token": "{{token}}"}


# test registration
def test_register(url, headers):
    data = {"email": "test@gmail.com", "password": "test", "role": "user"}
    response = requests.post(f"{url}/register", headers=headers, json=data)
    assert response.status_code == 200


# test login
def test_login(url, headers):
    data = {"email": "test@gmail.com", "password": "test"}
    response = requests.post(f"{url}/login", headers=headers, json=data)
    assert response.status_code == 200
    assert "token" in response.json()


# test user permission
def test_user_permission(url, headers, mod_token):
    response = requests.get(f"{url}/test/user", headers={"x-access-token": mod_token})
    assert response.status_code == 200


# test mod permission
def test_mod_permission(url, headers, mod_token):
    response = requests.get(f"{url}/test/mod", headers={"x-access-token": mod_token})
    assert response.status_code == 200
    

# test admin permission
def test_admin_permission(url, headers, user_token):
    response = requests.get(f"{url}/test/admin", headers={"x-access-token": user_token})
    assert response.status_code == 401


# test get all users
def test_get_all_doors(url, headers, token):
    response = requests.get(f"{url}/getAllDoors", headers={"x-access-token": token})
    assert response.status_code == 200


# test create door
def test_create_door(url, headers, token):
    data = {"doorName": "MULT-LAB-003", "doorLocation": "KICT-LV05"}
    response = requests.post(
        f"{url}/addDoor", headers={"x-access-token": token}, json=data
    )
    assert response.status_code == 200


# test revoke user permission
def test_revoke_access():
    url = base_url + "/revokeAccess"
    data = {"doorId": "8", "userId": "1"}
    response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200


# Define the test function for removing a door
def test_remove_door():
    url = base_url + "/removeDoor"
    data = {"doorId": "8"}
    response = requests.post(url, headers=headers, json=data)
    assert response.status_code == 200


# Define the test function for giving access to a user
def test_give_access():
    url = base_url + "/giveAccess"
    data = {"doorId": "4", "userId": "3"}
    response = requests.post(url, headers=headers, json=data)
    assert response.status_code == 200


# Define the test function for revoking a user's access
def test_revoke_access():
    url = base_url + "/revokeAccess"
    data = {"doorId": "8", "userId": "1"}
    response = requests.post(url, headers=headers, json=data)
    assert response.status_code == 200


# Define the test function for opening a door
def test_open_door():
    url = base_url + "/openDoor"
    data = {"userId": "2", "doorId": "100"}
    response = requests.post(url, headers=headers, json=data)
    assert response.status_code == 200


# test open door
def test_open_door():
    url = base_url + "/openDoor"
    data = {"userId": "2", "doorId": "100"}
    response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200


# test close door
def test_close_door():
    url = base_url + "/closeDoor"
    data = {"userId": 3, "doorId": "1"}
    response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200


# test update userinfo
def test_update_user_info():
    url = base_url + "/updateUserInfo"
    data = {
        "userId": 1,
        "email": "admin@gmail.com",
        "password": "test",
        "role": "admin",
    }
    response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200


# test get all doors with access
def test_get_all_doors_with_access():
    url = base_url + "/getAllDoorsWithAccess"
    data = {"userId": 1}
    response = requests.get(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200


# test get all user doors with access
def test_get_all_user_doors_with_access():
    url = base_url + "/getAllUserDoorsWithAccess"
    data = {"userId": 3}
    response = requests.get(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200


# test update info
def test_update_info():
    url = base_url + "/updateInfo"
    data = {
        "userId": 3,
        "email": "update@gmail.com",
        "password": "1234",
        "role": "admin",
    }
    response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200


# test add door passcode
def test_add_door_passcode():
    url = base_url + "/addDoorPasscode"
    data = {"doorId": 1, "doorPasscode": "1234"}
    response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200


# test remove door passcode
def test_revoke_door_passcode():
    url = base_url + "/revokeDoorPasscode"
    data = {"doorId": 1}
    response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200


# test add door with passcode
def test_add_door_with_passcode():
    url = base_url + "/addDoorWithPass"
    data = {
        "userId": "1",
        "doorId": "1",
        "doorPasscode": "1234",
    }
    response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)
    assert response.status_code == 200
