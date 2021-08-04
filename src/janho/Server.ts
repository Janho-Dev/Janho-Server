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
import {GameListener} from "./games/GameListener"
import {Game4} from "./games/default/Game4"
import {Protocol} from "./protocol/Protocol"
import {Logger} from "./Logger"
import {CommandReader} from "./command/CommandReader"
import {Status} from "./Status"
import {PluginManager} from "./plugin/PluginManager"
import {Event} from "./event/Event"

export class Server {
	private readonly io: socketio.Server
	private readonly network: Protocol
	private readonly reader: CommandReader
	private readonly logger: Logger
	private readonly status: Status
	private readonly listener: GameListener
	private readonly plugin: PluginManager
	private readonly event: Event
	private users: {[key: string]: string} = {}
	private players: {[key: string]: string} = {}
	private rooms: {[key: string]: Game} = {}

	constructor(io: socketio.Server){
		this.io = io
		this.network = new Protocol(this)
		this.reader = new CommandReader(this)
		this.logger = new Logger()
		this.status = new Status(this)
		this.listener = new GameListener(this)
		this.plugin = new PluginManager(this)
		this.event = new Event()
	}

	/**
	 * 利用ユーザの追加
	 * @param socketId セッションID
	 * @param name ユーザー名
	 * @returns true | false
	 */
	public addUser(socketId: string, name: string): boolean{
		if(!(socketId in this.users)){
			this.users[socketId] = name
			
			return true
		}else
			return false
	}
	/**
	 * 利用ユーザの削除
	 * @param socketId セッションID
	 */
	public deleteUser(socketId: string): void{
		if(socketId in this.users)
			delete this.users[socketId]
	}
	/**
	 * 利用ユーザの確認
	 * @param socketId セッションID
	 * @returns true | false
	 */
	public isUser(socketId: string): boolean{
		if(socketId in this.users)
			return true
		else
			return false
	}
	/**
	 * 利用ユーザ名取得
	 * @param socketId セッションID
	 * @returns ユーザ名 | null
	 */
	public getUserName(socketId: string): string|null{
		if(socketId in this.users)
			return this.users[socketId]
		else
			return null
	}
	/**
	 * 全利用ユーザ取得
	 * @returns // {[key in string]: string}
	 */
	public getAllUser(): {[key in string]: string} {
		return this.users
	}

	/**
	 * プレイヤーの追加
	 * @param socketId セッションID
	 * @param roomId 部屋ID
	 */
	public addPlayer(socketId: string, roomId: string): void{
		if(!(socketId in this.players))
			this.players[socketId] = roomId
	}
	/**
	 * プレイヤーの削除
	 * @param socketId セッションID
	 */
	public deletePlayer(socketId: string): void{
		if(socketId in this.players)
			delete this.players[socketId]
	}
	/**
	 * プレイヤーの確認
	 * @param socketId セッションID
	 * @returns true | false
	 */
	public isPlayer(socketId: string): boolean{
		if(socketId in this.players)
			return true
		else
			return false
	}
	/**
	 * プレイヤーの部屋ID取得
	 * @param socketId セッションID
	 * @returns 部屋ID | null
	 */
	public getPlayerRoomId(socketId: string): string|null{
		if(socketId in this.players)
			return this.players[socketId]
		else
			return null
	}
	/**
	 * 全プレイヤーの取得
	 * @returns // {[key in string]: string}
	 */
	public getAllPlayer(): {[key in string]: string} {
		return this.players
	}

	/**
	 * 部屋追加
	 * @param roomId 部屋ID
	 * @param hosterId セッションID
	 * @returns true | false
	 */
	public addRoom(roomId: string, hosterId: string): boolean{
		if(!(roomId in this.rooms)){
			//現在は4麻のみ
			this.rooms[roomId] = new Game4(this, roomId, hosterId)
			this.getListener().register(this.rooms[roomId])
			return true
		}else
			return false
	}
	/**
	 * 部屋削除
	 * @param roomId 部屋ID
	 */
	public deleteRoom(roomId: string): void{
		if(roomId in this.rooms)
			delete this.rooms[roomId]
	}
	/**
	 * 部屋確認
	 * @param roomId 部屋ID
	 * @returns true | false
	 */
	public isRoom(roomId: string): boolean{
		if(roomId in this.rooms)
			return true
		else
			return false
	}
	/**
	 * 部屋取得
	 * @param roomId 部屋ID
	 * @returns Gameクラスインスタンス | null
	 */
	public getRoom(roomId: string): Game|null{
		if(roomId in this.rooms)
			return this.rooms[roomId]
		else
			return null
	}
	/**
	 * 全部屋取得
	 * @returns // {[key in string]: Game}
	 */
	public getAllRoom(): {[key in string]: Game} {
		return this.rooms
	}

	/**
	 * 利用者タイムアウト
	 * @param socketId セッションID
	 */
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
		new Promise((resolve, reject) => {
            setTimeout(() => {
                this.io.to(socketId).emit("janho", data)
				this.logger.log("debug", "EMIT " + socketId)
				this.logger.log("debug", data)
            }, 1);
        }).catch(() => {
            console.error("Error: socket.io emit error.")
        })
	}
	public onReceive(socketId: string, data: string): void{
		this.network.receive(socketId, data)
		this.logger.log("debug", "REC " + socketId)
		this.logger.log("debug", data)
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

	public getListener(): GameListener{
		return this.listener
	}

	public getPluginManager(): PluginManager{
		return this.plugin
	}

	public getEvent(): Event{
		return this.event
	}
}