/**
 *      _             _           
 *     | | __ _ _ __ | |__   ___  
 *  _  | |/ _` | '_ \| '_ \ / _ \ 
 * | |_| | (_| | | | | | | | (_) |
 *  \___/ \__,_|_| |_|_| |_|\___/ 
 *
 * This program is free software: you can redistribute it and/or modify 
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * @author Saisana299
 * @link https://github.com/Janho-Dev/Janho-Server
 * 
 */

const nexe = require('nexe');
const rcedit = require('rcedit');
const fs = require('fs');
const {execSync} = require('child_process');
const {resolve} = require('path');
const platform = process.argv[2];
let version = 0;

try{
    const stdout = execSync("git log --oneline --no-merges");
    const log = stdout.toString();
    version = log.split("\n").length + 63;
    fs.writeFile('CURRENT_VERSION', version.toString(), function (err) {
        if (err) { throw err; }
    });
}catch(error){
    console.error(error);
};

const __version = `dev-${version}`
const __number_ver = version / 10**version.toString().length
const rc = {
    'CompanyName': "Janho",
    'ProductName': "Janho Server",
    'FileDescription': "Janho Server Software",
    'FileVersion': __number_ver,
    'ProductVersion': __number_ver,
    'OriginalFilename': "JanhoServer_"+ __version +".exe",
    'InternalName': "JanhoServer_" + __version,
    'LegalCopyright': "Copyright (c) Saisana299. Licensed under the AGPL-3.0"
};

const assets = 
{
    windows: './build/asset/windows-x64-14.15.3',
    linux: './build/asset/linux-x64-14.15.3',
    mac: './build/asset/mac-x64-14.15.3'
};

async function exists(filename) {
    try {
        return (await fs.promises.stat(filename)).size > 0
    } catch{ }
    return false;
}

(async function () {
    if(platform === "linux"){
        await nexe.compile({
            input: './build/tsc/Janho.js',
            output: "./build/JanhoServer_" + __version + "_linux-x64",
            asset: assets.linux,
            target: "linux-x64"
        }, function (err) {
            if (err) console.log(err);
        });
    }else if(platform === "mac"){
        await nexe.compile({
            input: './build/tsc/Janho.js',
            output: "./build/JanhoServer_" + __version + "_mac-x64",
            asset: assets.mac,
            target: "mac-x64"
        }, function (err) {
            if (err) console.log(err);
        });
    }else if(platform === "windows"){
        await nexe.compile({
            input: './build/tsc/Janho.js',
            output: "./build/JanhoServer_" + __version + "_win-x64",
            asset: assets.windows,
            target: "win-x64",
            rc: Object.assign({
                'PRODUCTVERSION': __number_ver,
                'FILEVERSION': __number_ver
            }, rc),
            patches: [
                async(compiler, next) => {
                    const exePath = compiler.getNodeExecutableLocation();
                    if(await exists(exePath)){
                        await rcedit(exePath, {
                            'version-string': rc,
                            'file-version': __number_ver,
                            'product-version': __number_ver,
                            icon: resolve(__dirname, "./build/asset/janho.ico")
                        });
                    }
                    return next()
                }
            ]
        }, function (err) {
            if (err) console.log(err);
        });
    }
})().catch(console.error);