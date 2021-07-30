$cp = Convert-Path .
$sp = Split-Path -Qualifier $cp
$ENV:Path+=$sp + "\Node-Dev\node;"

license-checker --production --csv --unknown --excludePrivatePackages --out ./src/janho/resource/Licenses.csv
node ./licenselist-make.js
pause