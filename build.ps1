$cp = Convert-Path .
$sp = Split-Path -Qualifier $cp
$ENV:Path+=$sp + "\Node-Dev\node;"
$txt = Read-Host "Do tsc compile?(Y/n)"
If($txt -ne "n" -and $txt -ne "N"){
	npm run tsc
	Copy-Item -Path ./src/janho/resource -Recurse ./build/src/janho -Force
	pause
}else{
	Write-Host("`n")
}
$platform = "windows"
$platform_rh = Read-Host "Platform?(WINDOWS/linux/mac)`nPlease use lowercase"
If($platform_rh -ne "windows"){
	If($platform_rh -eq "linux"){
		$platform = "linux"
	}elseif($platform_rh -eq "mac"){
		$platform = "mac"
	}
}
node ./build.js $platform
pause