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
 import {JanhoProtocol} from "../JanhoProtocol"

export class JoinRoom implements JanhoProtocol {
    private readonly server: janho.Server
    
    constructor(server: janho.Server){
        this.server = server
    }

    public procReceive(socketId: string, data: string): void{
        if(this.server.isPlayer(socketId)) return
        const parsed = JSON.parse(data)
        if("roomId" in parsed){
            if(typeof parsed["roomId"] === "string"){
                const room = this.server.getRoom(parsed["roomId"])
                if(room !== null){
                    const result = room.join(socketId)
                    if(result) this.procEmit(socketId, {"protocol": "joinRoom", "result": true})
                    else this.procEmit(socketId, {"protocol": "joinRoom", "result": false})
                }else{
                    this.procEmit(socketId, {"protocol": "joinRoom", "result": false})
                }
            }
        }
    }

    public procEmit(socketId: string, json: {}): void{
        const data = JSON.stringify(json)
        this.server.emitData(socketId, data)
    }
}