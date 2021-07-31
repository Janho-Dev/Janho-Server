$ENV:Path+="G:\Node-Dev\node;"
$txt = Read-Host "Do tsc compile?(Y/n)"
If($txt -ne "n" -and $txt -ne "N"){
	npm run tsc
	pause
}
node ./build.js
pause