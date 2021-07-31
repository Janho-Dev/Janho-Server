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
import {Game} from "./Game"
import {Protocol} from "./protocol/Protocol"

export class Server {
	private readonly io: socketio.Server
	private readonly protocol: Protocol
	private users: {[key: string]: string} = {}
	private players: {[key: string]: string} = {}
	private rooms: {[key: string]: Game} = {}

	constructor(io: socketio.Server){
		this.io = io
		this.protocol = new Protocol(this)
	}

	public addUser(socketId: string, name: string): boolean{
		if(!(socketId in this.users)){
			this.users[socketId] = name
			return true
		}else
			return false
	}
	public deleteUser(socketId: string): void{
		if(socketId in this.users)
			delete this.users[socketId]
	}
	public isUser(socketId: string): boolean{
		if(socketId in this.users)
			return true
		else
			return false
	}
	public getUserName(socketId: string): string|null{
		if(socketId in this.users)
			return this.users[socketId]
		else
			return null
	}

	public addPlayer(socketId: string, roomId: string): void{
		if(!(socketId in this.players))
			this.players[socketId] = roomId
	}
	public deletePlayer(socketId: string): void{
		if(socketId in this.players)
			delete this.players[socketId]
	}
	public isPlayer(socketId: string): boolean{
		if(socketId in this.players)
			return true
		else
			return false
	}
	public getPlayerRoomId(socketId: string): string|null{
		if(socketId in this.players)
			return this.players[socketId]
		else
			return null
	}

	public addRoom(roomId: string, hosterId: string): boolean{
		if(!(roomId in this.rooms)){
			this.rooms[roomId] = new Game(this, roomId, hosterId)
			return true
		}else
			return false
	}
	public deleteRoom(roomId: string): void{
		if(roomId in this.rooms)
			delete this.rooms[roomId]
	}
	public isRoom(roomId: string): boolean{
		if(roomId in this.rooms)
			return true
		else
			return false
	}
	public getRoom(roomId: string): Game|null{
		if(roomId in this.rooms)
			return this.rooms[roomId]
		else
			return null
	}

	public dead(socketId: string): void{
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
		this.io.to(socketId).emit("janho", data)
		console.log("\nEMIT " + socketId)//debug
		console.log(data)//debug
	}
	public onReceive(socketId: string, data: string): void{
		this.protocol.receive(socketId, data)
		console.log("\nREC " + socketId)//debug
		console.log(data)//debug
	}

	public getProtocol(): Protocol{
		return this.protocol
	}
}