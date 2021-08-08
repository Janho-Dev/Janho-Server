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
import {JanhoProtocol} from "./JanhoProtocol"
import {Register} from "./system/Register"
import {Timeout} from "./system/Timeout"
import {Timein} from "./system/Timein"

import {CreateRoom} from "./room/CreateRoom"
import {JoinRoom} from "./room/JoinRoom"
import {ReadyRoom} from "./room/ReadyRoom"
import {QuitRoom} from "./room/QuitRoom"
import {StartRoom} from "./room/StartRoom"

import {Kaikyoku} from "./game/Kaikyoku"
import {Haipai} from "./game/Haipai"
import {Tsumo} from "./game/Tsumo"
import {Dahai} from "./game/Dahai"
import {Hora} from "./game/Hora"
import {Kan} from "./game/Kan"
import {Kantsumo} from "./game/Kantsumo"
import {Ryukyoku} from "./game/Ryukyoku"
import {Shukyoku} from "./game/Shukyoku"
import {Skip} from "./game/Skip"
import {Candidate} from "./game/Candidate"
import {Chi} from "./game/Chi"
import {Pon} from "./game/Pon"
import {Ankan} from "./game/Ankan"
import {Kakan} from "./game/Kakan"


export class Protocol {
    private readonly server: janho.Server
    private protocols: {[key: string]: JanhoProtocol} = {}

    constructor(server: janho.Server){
        this.server = server
        this.protocols = {
            "register": new Register(this.server),
            "timeout": new Timeout(this.server),
            "timein": new Timein(this.server),

            "joinRoom": new JoinRoom(this.server),
            "createRoom": new CreateRoom(this.server),
            "readyRoom": new ReadyRoom(this.server),
            "quitRoom": new QuitRoom(this.server),
            "startRoom": new StartRoom(this.server),

            "kaikyoku": new Kaikyoku(this.server),
            "haipai": new Haipai(this.server),
            "tsumo": new Tsumo(this.server),
            "dahai": new Dahai(this.server),
            "hora": new Hora(this.server),
            "kan": new Kan(this.server),
            "kantsumo": new Kantsumo(this.server),
            "ryukyoku": new Ryukyoku(this.server),
            "shukyoku": new Shukyoku(this.server),
            "skip": new Skip(this.server),
            "candidate": new Candidate(this.server),
            "chi": new Chi(this.server),
            "pon": new Pon(this.server),
            "ankan": new Ankan(this.server),
            "kakan": new Kakan(this.server)
        }
    }

    /**
     * クライアントから受け取り
     * @param socketId セッションID
     * @param data JSON
     */
    public receive(socketId: string, data: string): void{
        const parsed = JSON.parse(data)
        if("protocol" in parsed){
            const protocol = this.getProtocol(parsed["protocol"])
            if(protocol !== null){
                protocol.procReceive(socketId, data)
            }
        }
    }
    /**
     * クライアントへ送信
     * @param protocolName プロトコル名
     * @param socketId セッションID
     * @param json JSON
     */
    public emit(protocolName: string, socketId: string, json: {}): void{
        const protocol = this.getProtocol(protocolName)
        if(protocol !== null){
            protocol.procEmit(socketId, json)
        }
    }

    /**
     * クライアントから受け取り(複数)
     * @param socketIds セッションID
     * @param data JSON
     */
    public receiveArray(socketIds: Array<string>, data: string): void{
        const parsed = JSON.parse(data)
        if("protocol" in parsed){
            const protocol = this.getProtocol(parsed["protocol"])
            if(protocol !== null){
                socketIds.forEach((socketId) => {
                    protocol.procReceive(socketId, data)
                })
            }
        }
    }
    /**
     * クライアントへ送信(複数)
     * @param protocolName プロトコル名
     * @param socketIds セッションID
     * @param json JSON
     */
    public emitArray(protocolName: string, socketIds: Array<string>, json: {}): void{
        const protocol = this.getProtocol(protocolName)
        if(protocol !== null){
            socketIds.forEach((socketId) => {
                protocol.procEmit(socketId, json)
            })
        }
    }

    /**
     * 指定したプロトコルインスタンス取得
     * @param protocol プロトコル名
     * @returns プロトコルインスタンス | null
     */
    private getProtocol(protocol: string): JanhoProtocol | null{
        if(protocol in this.protocols)
            return this.protocols[protocol]
        else
            return null
    }
}