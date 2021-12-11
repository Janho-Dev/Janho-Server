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

import * as janho from "../../Server"
import csvParse from "csv-parse/lib/sync"
import fs from "fs"
import path from "path"
import {DefaultCommand} from "./DefaultCommand"
import {Color} from "../../utils/Color"

export class LicenseCommand implements DefaultCommand {
    private readonly server: janho.Server
    readonly description: string
    readonly usage: string
    readonly csv_path: string

    constructor(server: janho.Server){
        this.server = server
        this.description = "Show license."
        this.usage = "license [list]"
        this.csv_path = path.resolve(__dirname, "..", "..", "resource", "Licenses.csv")
    }

    public execute(args: string[]){
        if(args.length === 0){
            const license = "\"Janho Server\" " +  "License.\n"+
            Color.reset + Color.gray +
            "\n"+
            "This program is free software: you can redistribute it and/or modify\n"+
            "it under the terms of the GNU Affero General Public License as published by\n"+
            "the Free Software Foundation, either version 3 of the License, or\n"+
            "(at your option) any later version.\n"+
            "\n"+
            "This program is distributed in the hope that it will be useful,\n"+
            "but WITHOUT ANY WARRANTY; without even the implied warranty of\n"+
            "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n"+
            "GNU Affero General Public License for more details.\n"+
            "\n"+
            "You should have received a copy of the GNU Affero General Public License\n"+
            "along with this program.  If not, see <https://www.gnu.org/licenses/>.\n"+
            "\n"+
            "@author Saisana299\n"+
            "@link https://github.com/Janho-Dev/Janho-Server\n"+
            Color.reset + Color.white +
            "\n--END--"
            
            this.server.getLogger().log("info", license)
            this.server.getLogger().log("info", " You can see more detailed usage with \"license list\".")
        }else if(args[0] === "list"){
            let rfs = fs.readFileSync(this.csv_path)
            let data = csvParse(rfs, {columns: true})
            const listIt = require("list-it")
            const buf = new listIt({"autoAlign": true})
            let licenses = [["[Module name]", "[License]", "[Repository]"]]
            for(let d of data){
                licenses.push([d["module name"], d["license"], d["repository"]])
            }
            this.server.getLogger().log(
                "info",
                "License list\n\n" + Color.reset + Color.gray + buf.d(licenses).toString() + Color.reset + Color.white + "\n\n--END--"
            )
        }else{
            this.server.getLogger().log("error", "")
        }
    }
}