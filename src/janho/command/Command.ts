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
import {DefaultCommand} from "./default/DefaultCommand"
import {DebugCommand} from "./default/DebugCommand"
import {GetPlayersCommand} from "./default/GetPlayersCommand"
import {GetRoomsCommand} from "./default/GetRoomsCommand"
import {GetUsersCommand} from "./default/GetUsersCommand"
import {HelpCommand} from "./default/HelpCommand"
import {StatusCommand} from "./default/StatusCommand"
import {StopCommand} from "./default/StopCommand"
import {LicenseCommand} from "./default/LicenseCommand"
import {PluginsCommand} from "./default/PluginsCommand"
import {MonitorCommand} from "./default/MonitorCommand"

export class Command {
    private readonly server: janho.Server
    private commands: {[key: string]: DefaultCommand} = {}

    constructor(server: janho.Server){
        this.server = server
        this.commands = {
            "debug": new DebugCommand(this.server),
            "getplayers": new GetPlayersCommand(this.server),
            "getrooms": new GetRoomsCommand(this.server),
            "getusers": new GetUsersCommand(this.server),
            "help": new HelpCommand(this.server, this),
            "status": new StatusCommand(this.server),
            "stop": new StopCommand(),
            "license": new LicenseCommand(this.server),
            "plugins": new PluginsCommand(this.server),
            "monitor": new MonitorCommand(this.server)
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

    public getCommand(command: string): DefaultCommand | null{
        if(command in this.commands)
            return this.commands[command]
        else
            return null
    }

    public getAllCommand(): {[key in string]: DefaultCommand} {
        return this.commands
    }
}