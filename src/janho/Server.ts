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

import * as socketio from "socket.io"
import {Game} from "./games/Game"
import {Game4} from "./games/default/Game4"
import {Protocol} from "./protocol/Protocol"
import {Logger} from "./Logger"
import {CommandReader} from "./command/CommandReader"
import {Status} from "./Status"
import {PluginManager} from "./plugin/PluginManager"
import {Event} from "./event/Event"
import {UserAddEvent} from "./event/user/UserAddEvent"
import {UserDeleteEvent} from "./event/user/UserDeleteEvent"
import {UserDeadEvent} from "./event/user/UserDeadEvent"
import {ServerEmitEvent} from "./event/server/ServerEmitEvent"
import {ServerReceiveEvent} from "./event/server/ServerReceiveEvent"
import {RoomAddEvent} from "./event/server/RoomAddEvent"
import {RoomDeleteEvent} from "./event/server/RoomDeleteEvent"

export class Server {
	private readonly io: socketio.Server
	private readonly event: Event
	private readonly network: Protocol
	private readonly reader: CommandReader
	private readonly logger: Logger
	private readonly status: Status
	private readonly plugin: PluginManager
	private users: {[key: string]: string} = {}
	private players: {[key: string]: string} = {}
	private rooms: {[key: string]: Game} = {}

	constructor(io: socketio.Server){
		this.io = io
		this.event = new Event()
		this.network = new Protocol(this)
		this.reader = new CommandReader(this)
		this.logger = new Logger()
		this.status = new Status(this)
		this.plugin = new PluginManager(this)
	}

	/**
	 * ????????????????????????
	 * @param socketId ???????????????ID
	 * @param name ???????????????
	 * @returns true | false
	 */
	public addUser(socketId: string, name: string): boolean{
		if(!(socketId in this.users)){
			this.users[socketId] = name
			new UserAddEvent(this.getEvent(), socketId, name).emit()
			return true
		}else
			return false
	}
	/**
	 * ????????????????????????
	 * @param socketId ???????????????ID
	 */
	public deleteUser(socketId: string): void{
		if(socketId in this.users){
			let name = this.users[socketId]
			delete this.users[socketId]
			new UserDeleteEvent(this.getEvent(), socketId, name).emit()
		}
	}
	/**
	 * ????????????????????????
	 * @param socketId ???????????????ID
	 * @returns true | false
	 */
	public isUser(socketId: string): boolean{
		if(socketId in this.users)
			return true
		else
			return false
	}
	/**
	 * ????????????????????????
	 * @param socketId ???????????????ID
	 * @returns ???????????? | null
	 */
	public getUserName(socketId: string): string|null{
		if(socketId in this.users)
			return this.users[socketId]
		else
			return null
	}
	/**
	 * ????????????????????????
	 * @returns // {[key in string]: string}
	 */
	public getAllUser(): {[key in string]: string} {
		return this.users
	}

	/**
	 * ????????????????????????
	 * @param socketId ???????????????ID
	 * @param roomId ??????ID
	 */
	public addPlayer(socketId: string, roomId: string): void{
		if(!(socketId in this.players))
			this.players[socketId] = roomId
			//game addplayer event
	}
	/**
	 * ????????????????????????
	 * @param socketId ???????????????ID
	 */
	public deletePlayer(socketId: string): void{
		if(socketId in this.players)
			delete this.players[socketId]
			//game deleteplayer event
	}
	/**
	 * ????????????????????????
	 * @param socketId ???????????????ID
	 * @returns true | false
	 */
	public isPlayer(socketId: string): boolean{
		if(socketId in this.players)
			return true
		else
			return false
	}
	/**
	 * ????????????????????????ID??????
	 * @param socketId ???????????????ID
	 * @returns ??????ID | null
	 */
	public getPlayerRoomId(socketId: string): string|null{
		if(socketId in this.players)
			return this.players[socketId]
		else
			return null
	}
	/**
	 * ???????????????????????????
	 * @returns // {[key in string]: string}
	 */
	public getAllPlayer(): {[key in string]: string} {
		return this.players
	}

	/**
	 * ????????????
	 * @param roomId ??????ID
	 * @param hosterId ???????????????ID
	 * @returns true | false
	 */
	public addRoom(roomId: string, hosterId: string): boolean{
		if(!(roomId in this.rooms)){
			//?????????4?????????
			this.rooms[roomId] = new Game4(this, roomId, hosterId)
			new RoomAddEvent(this.getEvent(), roomId, hosterId).emit()
			return true
		}else
			return false
	}
	/**
	 * ????????????
	 * @param roomId ??????ID
	 */
	public deleteRoom(roomId: string): void{
		if(roomId in this.rooms){
			delete this.rooms[roomId]
			new RoomDeleteEvent(this.getEvent(), roomId).emit()
		}
	}
	/**
	 * ????????????
	 * @param roomId ??????ID
	 * @returns true | false
	 */
	public isRoom(roomId: string): boolean{
		if(roomId in this.rooms)
			return true
		else
			return false
	}
	/**
	 * ????????????
	 * @param roomId ??????ID
	 * @returns Game??????????????????????????? | null
	 */
	public getRoom(roomId: string): Game|null{
		if(roomId in this.rooms)
			return this.rooms[roomId]
		else
			return null
	}
	/**
	 * ???????????????
	 * @returns // {[key in string]: Game}
	 */
	public getAllRoom(): {[key in string]: Game} {
		return this.rooms
	}

	/**
	 * ???????????????????????????
	 * @param socketId ???????????????ID
	 */
	public dead(socketId: string): void{
		let name = this.users[socketId]
		new UserDeadEvent(this.getEvent(), socketId, name).emit()
		const roomId = this.getPlayerRoomId(socketId)
		if(roomId !== null){
			const room = this.getRoom(roomId)
			if(room !== null){
				room.dead(socketId)
			}
			this.deletePlayer(socketId)
		}
		if(this.isUser(socketId))
			this.deleteUser(socketId)
	}

	public emitData(socketId: string, data: string): void{
		new Promise((resolve, reject) => {
            setTimeout(() => {
				new ServerEmitEvent(this.getEvent(), socketId, data).emit()
                this.io.to(socketId).emit("janho", data)
				this.logger.log("debug", "EMIT " + socketId)
				this.logger.log("debug", data)
            }, 1);
        }).catch(() => {
            console.error("Error: socket.io emit error.")
        })
	}
	public onReceive(socketId: string, data: string): void{
		new ServerReceiveEvent(this.getEvent(), socketId, data).emit()
		this.network.receive(socketId, data)
		this.logger.log("debug", "REC " + socketId)
		this.logger.log("debug", data)
	}

	public enableStatus(): boolean{
		return this.status.enable()
	}
	public disableStatus(): boolean{
		return this.status.disable()
	}

	public getProtocol(): Protocol{
		return this.network
	}

	public getCommandReader(): CommandReader{
		return this.reader
	}

	public getLogger(): Logger{
		return this.logger
	}

	public getPluginManager(): PluginManager{
		return this.plugin
	}

	public getEvent(): Event{
		return this.event
	}
}