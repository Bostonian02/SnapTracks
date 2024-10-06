# SnapTracks
This is the main branch for SnapTracks. Do not modify this branch unless you know what you are doing!

## How to Run This Project
To run SnapTracks it requires to have a few things open at the same time. You will need:
1. An Ngrok tunnel session
2. The backend (app.py)
3. The frontend running on an iPhone (npx expo start --tunnel)

## Ngrok
Make sure you run an ngrok tunnel session with the command `ngrok http 5001` because the UCF wifi sucks. This will start a tunnel session that creates a URL that forwards requests to your localhost at the port you specify (5001 in this case). Copy the forwarding URL and paste it into the code

## Backend
Open a terminal, cd to the backend folder, and run the app.py file

## Frontend
Open a terminal, cd into the SnapTracks folder, and run `npx expo start --tunnel`. The --tunnel flag is important in this case because again, UCF wifi sucks and this is the only way to connect the app to the Metro bundler