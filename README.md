# toodly
Website for toodly.co

for server
- firebase serve 
- firebase emulators:start --export-on-exit=./saved-data --import=./saved-data
- firebase deploy --only functions,hosting

for client
- ng serve
- ng serve -host <ip>
- ng build --prod

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
