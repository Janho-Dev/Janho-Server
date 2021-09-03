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

    //socket
    private readonly _socketConnectEvent: EventPort<(socketId: string) => void>
    private readonly _socketDisconnectEvent: EventPort<(socketId: string) => void>
    private readonly _socketReceiveEvent: EventPort<(socketId: string, data: string) => void>

    //server
    private readonly _serverStopEvent: EventPort<() => void>
    private readonly _serverPreLoadEvent: EventPort<() => void>
    private readonly _serverLoadEvent: EventPort<() => void>
    private readonly _serverEmitEvent: EventPort<(socketId: string, data: string) => void>
    private readonly _serverReceiveEvent: EventPort<(socketId: string, data: string) => void>
    private readonly _roomAddEvent: EventPort<(roomId: string, hosterId: string) => void>
    private readonly _roomDeleteEvent: EventPort<(roomId: string) => void>

    //plugin

    //user
    private readonly _userAddEvent: EventPort<(socketId: string, name: string) => void>
    private readonly _userDeleteEvent: EventPort<(socketId: string, name: string) => void>
    private readonly _userDeadEvent: EventPort<(socketId: string, name: string) => void>

    //game

    constructor(){
        this.emitter = new EventEmitter()

        //socket
        this._socketConnectEvent = new EventPort("socketConnect", this.emitter)
        this._socketDisconnectEvent = new EventPort("socketDisconnect", this.emitter)
        this._socketReceiveEvent = new EventPort("socketReceive", this.emitter)

        //server
        this._serverStopEvent = new EventPort("serverStop", this.emitter)
        this._serverPreLoadEvent = new EventPort("serverPreLoad", this.emitter)
        this._serverLoadEvent = new EventPort("serverLoad", this.emitter)
        this._serverEmitEvent = new EventPort("serverEmit", this.emitter)
        this._serverReceiveEvent = new EventPort("serverReceive", this.emitter)
        this._roomAddEvent = new EventPort("roomAdd", this.emitter)
        this._roomDeleteEvent = new EventPort("roomDelete", this.emitter)

        //plugin

        //user
        this._userAddEvent = new EventPort("userAdd", this.emitter)
        this._userDeleteEvent = new EventPort("userDelete", this.emitter)
        this._userDeadEvent = new EventPort("userDead", this.emitter)

        //game
    }

    //socket
    public get socketConnectEvent(){ return this._socketConnectEvent }
    public socketConnect(socketId: string): boolean{
        if(!(this.traceCheck("SocketConnectEvent.emit"))) return false
        return this.emitter.emit(this._socketConnectEvent, socketId)
    }
    public get socketDisconnectEvent(){ return this._socketDisconnectEvent }
    public socketDisconnect(socketId: string): boolean{
        if(!(this.traceCheck("SocketDisconnectEvent.emit"))) return false
        return this.emitter.emit(this._socketDisconnectEvent, socketId)
    }
    public get socketReceiveEvent(){ return this._socketReceiveEvent }
    public socketReceive(socketId: string, data: string): boolean{
        if(!(this.traceCheck("SocketReceiveEvent.emit"))) return false
        return this.emitter.emit(this._socketReceiveEvent, socketId, data)
    }

    //server
    public get serverStopEvent(){ return this._serverStopEvent }
    public serverStop(): boolean{
        if(!(this.traceCheck("ServerStopEvent.emit"))) return false
        return this.emitter.emit(this._serverStopEvent)
    }
    public get serverPreLoadEvent(){ return this._serverPreLoadEvent }
    public serverPreLoad(): boolean{
        if(!(this.traceCheck("ServerPreLoadEvent.emit"))) return false
        return this.emitter.emit(this._serverPreLoadEvent)
    }
    public get serverLoadEvent(){ return this._serverLoadEvent }
    public serverLoad(): boolean{
        if(!(this.traceCheck("ServerLoadEvent.emit"))) return false
        return this.emitter.emit(this._serverLoadEvent)
    }
    public get serverEmitEvent(){ return this._serverEmitEvent }
    public serverEmit(socketId: string, data: string): boolean{
        if(!(this.traceCheck("ServerEmitEvent.emit"))) return false
        return this.emitter.emit(this._serverEmitEvent, socketId, data)
    }
    public get serverReceiveEvent(){ return this._serverReceiveEvent }
    public serverReceive(socketId: string, data: string): boolean{
        if(!(this.traceCheck("ServerReceiveEvent.emit"))) return false
        return this.emitter.emit(this._serverReceiveEvent, socketId, data)
    }
    public get roomAddEvent(){ return this._roomAddEvent }
    public roomAdd(roomId: string, hosterId: string): boolean{
        if(!(this.traceCheck("RoomAddEvent.emit"))) return false
        return this.emitter.emit(this._roomAddEvent, roomId, hosterId)
    }
    public get roomDeleteEvent(){ return this._roomDeleteEvent }
    public roomDelete(roomId: string): boolean{
        if(!(this.traceCheck("RoomDeleteEvent.emit"))) return false
        return this.emitter.emit(this._roomDeleteEvent, roomId)
    }

    //plugin

    //user
    public get userAddEvent(){ return this._userAddEvent }
    public userAdd(socketId: string, name: string): boolean{
        if(!(this.traceCheck("UserAddEvent.emit"))) return false
        return this.emitter.emit(this._userAddEvent, socketId, name)
    }
    public get userDeleteEvent(){ return this._userDeleteEvent }
    public userDelete(socketId: string, name: string): boolean{
        if(!(this.traceCheck("UserDeleteEvent.emit"))) return false
        return this.emitter.emit(this._userDeleteEvent, socketId, name)
    }
    public get userDeadEvent(){ return this._userDeadEvent }
    public userDead(socketId: string, name: string): boolean{
        if(!(this.traceCheck("UserDeadEvent.emit"))) return false
        return this.emitter.emit(this._userDeadEvent, socketId, name)
    }

    //game

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