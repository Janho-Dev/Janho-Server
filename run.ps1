$cp = Convert-Path .
$sp = Split-Path -Qualifier $cp
$ENV:Path+=$sp + "\Node-Dev\node;"
while(1){
	cls
	./node_modules/.bin/ts-node ./src/janho/Janho.ts
	pause
}