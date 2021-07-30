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
import {DefaultCommand} from "./DefaultCommand"

export class DebugCommand implements DefaultCommand {
    private readonly server: janho.Server
    readonly description: string
    readonly usage: string

    constructor(server: janho.Server){
        this.server = server
        this.description = "Enables / disables debug mode."
        this.usage = "debug <true|false|status>"
    }

    public execute(args: string[]){
        if(args.length === 0){
            this.server.getLogger().log("error", "Please enter true, false or status.")
            return
        }
        if(args[0] === "true"){
            this.server.getLogger().setDebug(true)
        }else if(args[0] === "false"){
            this.server.getLogger().setDebug(false)
        }else if(args[0] === "status"){
            const status = this.server.getLogger().getDebug()
            this.server.getLogger().log("info", "Debug mode is " + status + ".")
        }else{
            this.server.getLogger().log("error", "Please enter true, false or status.")
        }
    }
}