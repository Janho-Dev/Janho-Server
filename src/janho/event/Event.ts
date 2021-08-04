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

import {EventEmitter} from "./EventEmitter"
import {EventPort} from "./EventPort"

export class Event{
    private readonly emitter: EventEmitter
    private readonly _socketConnectEvent: EventPort<(socketId: string) => void>
    private readonly _socketDisconnectEvent: EventPort<(socketId: string) => void>

    constructor(){
        this.emitter = new EventEmitter()
        this._socketConnectEvent = new EventPort("socketConnect", this.emitter)
        this._socketDisconnectEvent = new EventPort("socketDisconnect", this.emitter)
    }

    public get socketConnectEvent(){ return this._socketConnectEvent }
    public get socketDisconnectEvent(){ return this._socketDisconnectEvent }

    public socketConnect(socketId: string): boolean{
        if(!(this.traceCheck("SocketConnectEvent.emit"))) return false
        return this.emitter.emit(this._socketConnectEvent, socketId)
    }
    public socketDisconnect(socketId: string): boolean{
        if(!(this.traceCheck("SocketDisconnectEvent.emit"))) return false
        return this.emitter.emit(this._socketDisconnectEvent, socketId)
    }

    private traceCheck(value: string): boolean{
        const trace = new Error().stack
        if(trace === undefined) return false
        const pre_splited = trace.split("\n")[3]
        if(pre_splited === undefined) return false
        const splited = pre_splited.split(" ")
        if(splited[5] === value){
            return true
        }else{
            return false
        }
    }
}