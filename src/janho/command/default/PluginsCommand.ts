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
import {Color} from "../../utils/Color"
import {DefaultCommand} from "./DefaultCommand"

export class PluginsCommand implements DefaultCommand {
    private readonly server: janho.Server
    readonly description: string
    readonly usage: string

    constructor(server: janho.Server){
        this.server = server
        this.description = "Display a list of plugins."
        this.usage = "plugins [\"plugin name\"]"
    }

    public execute(args: string[]){
        if(args.length === 0){
            const plugins = this.server.getPluginManager().getPluginList()
            const str = plugins.join(", ")
            this.server.getLogger().log("info", `Plugins(${plugins.length}): ${str}`)
            this.server.getLogger().newLine()
            this.server.getLogger().log("info", "You can see more detailed usage with \"plugins <\"plugin name\">\".")
            return
        }
        const result = this.server.getPluginManager().getPluginJson(args[0])
        if(result === null){
            this.server.getLogger().log("error", "There is no such plugin.")
        }else{
            this.server.getLogger().log("info", Color.green + result.name)
            this.server.getLogger().log("info", "Ver - " + result.version)
            this.server.getLogger().log("info", "Description - " + result.description)
            this.server.getLogger().log("info", "Author - " + result.author)
        }
    }
}