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

import * as janho from "../Server"
import {CommandIF} from "./CommandIF"
import {Debug} from "./default/Debug"
import {GetUsers} from "./default/GetUsers"
import {Help} from "./default/Help"
import {Stop} from "./default/Stop"

export class Command {
    private readonly server: janho.Server
    private commands: {[key: string]: CommandIF} = {}

    constructor(server: janho.Server){
        this.server = server
        this.commands = {
            "debug": new Debug(this.server),
            "getusers": new GetUsers(this.server),
            "help": new Help(this.server, this),
            "stop": new Stop()
        }
    }

    public onCommand(message: string){
        const commands = message.split(" ")
        const command = commands[0]
        const commandClass = this.getCommand(command)
        commands.splice(0, 1)
        if(commandClass !== null){
            commandClass.execute(commands)
        }else{
            this.server.getLogger().log("error", "There is no such command.")
        }
    }

    public getCommand(command: string): CommandIF | null{
        if(command in this.commands)
            return this.commands[command]
        else
            return null
    }

    public getAllCommand(): {[key in string]: CommandIF} {
        return this.commands
    }
}