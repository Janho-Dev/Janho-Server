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

export class Kan implements JanhoProtocol {
    private readonly server: janho.Server
    
    constructor(server: janho.Server){
        this.server = server
    }

    public procReceive(socketId: string, data: string): void{
        const parsed = JSON.parse(data)
        if("hai" in parsed){
            if(typeof parsed["hai"] === "number" && Array.isArray(parsed["combi"])){
                if(parsed["combi"].length !== 4) return
                for(let hai of parsed["combi"]){
                    if(typeof hai !== "number") return
                }
                const roomId = this.server.getPlayerRoomId(socketId)
                if(roomId !== null){
                    const room = this.server.getRoom(roomId)
                    if(room !== null){
                        const kaze = room.getKaze(socketId)
                        if(kaze === null) return
                        const result = room.onKan(kaze, parsed["hai"], parsed["combi"])
                        if(!result) this.procEmit(socketId, {"protocol": "kan", "result": false})
                        //return true --> Game::onKan()
                    }
                }
            }
        }
    }

    public procEmit(socketId: string, json: {}): void{
        const data = JSON.stringify(json)
        this.server.emitData(socketId, data)
    }
}