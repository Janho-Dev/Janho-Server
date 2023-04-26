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
import { Color } from "../../utils/Color"
import { Command } from "../Command"
import { DefaultCommand } from "./DefaultCommand"

export class HelpCommand implements DefaultCommand {
    private readonly server: janho.Server
    private readonly command: Command
    readonly description: string
    readonly usage: string

    constructor(server: janho.Server, command: Command){
        this.server = server
        this.command = command
        this.description = "Display a list of commands."
        this.usage = "help [\"command\"]"
    }

    public execute(args: string[]){
        if(args.length === 0){
            const commands = this.command.getAllCommand()
            this.server.getLogger().log("info", "----- Command help -----")
            for(const [command, commandClass] of Object.entries(commands)){
                this.server.getLogger().log("info", Color.green + command + Color.reset + " - " + commandClass.description)
            }
            this.server.getLogger().newLine()
            this.server.getLogger().log("info", "You can see more detailed usage with \"help <\"command name\">\".")
            return
        }
        const result = this.command.getCommand(args[0])
        if(result === null){
            this.server.getLogger().log("error", "There is no such command.")
        }else{
            this.server.getLogger().log("info", Color.green + args[0])
            this.server.getLogger().log("info", "Description - " + result.description)
            this.server.getLogger().log("info", "Usage - " + result.usage)
        }
    }
}