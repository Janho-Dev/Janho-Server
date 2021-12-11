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

export class GetPlayersCommand implements DefaultCommand {
    private readonly server: janho.Server
    readonly description: string
    readonly usage: string

    constructor(server: janho.Server){
        this.server = server
        this.description = "Display a list of players."
        this.usage = "players"
    }

    public execute(args: string[]){
        const players = this.server.getAllPlayer()
        if(Object.keys(players).length === 0){
            this.server.getLogger().log("info", "Player does not exist.")
            return
        }
        this.server.getLogger().log("info", "----- Player list -----")
        for(const [socketId, roomId] of Object.entries(players)){
            this.server.getLogger().log("info", socketId + " - " + roomId)
        }
    }
}