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
import {Game} from "../../games/Game"

export class MonitorCommand implements DefaultCommand {
    private readonly server: janho.Server
    readonly description: string
    readonly usage: string
    private room: Game | null
    private option: "all"|"simple"|"detail"

    constructor(server: janho.Server){
        this.server = server
        this.description = "Displays the contents of variables in the target room."
        this.usage = "show <roomId> [all/simple/detail]"
        this.room = null
        this.option = "simple"
        this.server.getEvent().gameEvent.on(() => {
            if(this.room !== null){
                console.clear()
                console.log()
                this.room.dataDump(this.option)
            }
        })
    }

    public execute(args: string[]){
        if(args.length === 0){
            this.server.getLogger().log("error", "Please enter room id.")
            return
        }
        if(args[0] === "exit"){
            this.exit()
            return
        }
        if(this.server.isRoom(args[0])){
            const room = this.server.getRoom(args[0])
            if(room !== null){
                if(args.length >= 2){
                    switch(args[1]){
                        case "all":
                            this.option = "all"
                            break;
                        case "simple":
                            this.option = "simple"
                            break;
                        case "detail":
                            this.option = "detail"
                    }
                }
                this.monitor(room)
            }
        }else{
            this.server.getLogger().log("error", "The room was not found.")
        }
    }

    private monitor(room: Game): boolean{
        this.server.getLogger().disable()
        this.room = room
        console.clear()
        console.log()
        this.room.dataDump(this.option)
        return true
    }
    private exit(){
        this.server.getLogger().enable()
        this.room = null
    }
}