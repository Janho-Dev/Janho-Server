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

const fs = require("fs");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");
let cache = ["", " "];
let new_data = [];
//[{"module name": string, license: string, repository: string}]

let rfs = fs.readFileSync("./src/janho/resource/Licenses.csv");
let data = parse(rfs, {columns: true});
for(let d of data){
    if(!("module name" in d)) continue;
    const m_name = d["module name"].substring(0, d["module name"].indexOf("@", 1));
    if(cache.includes(m_name)) continue;
    cache.push(m_name);
    new_data.push({"module name": m_name, license: d.license, repository: d.repository});
}
const new_csv = stringify(new_data, {header: true});
fs.writeFile('./src/janho/resource/Licenses.csv', new_csv, function (err) {
    if (err) { throw err; }
});