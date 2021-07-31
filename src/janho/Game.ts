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

import * as janho from "./Server"
import {Shipai} from "./utils/Shipai"

type x01 = 0 | 1 | 2 | 3
type x02 = "rinshan" | "tsumo"
type x03 = "hai"
type x04 = "hai" | "enable"
type x05 = "hai" | "sute"
type x06 = "bakaze" | "kyoku" | "homba" | "richi" | "yama"
type x07 = "bool" | "yama" | "ippatu"
type x08 = "wait" | "ready" | "game"
type x09 = "wait" | "ready" | "loaded" | "game" | "dead"
type x0a = "dora" | "uradora" 

export class Game {
    private readonly server: janho.Server
    private readonly roomId: string
    private readonly hosterId: string
    private players: {[key: string]: x09}

    private gameStatus: x08

    private timer: NodeJS.Timeout | null
    private timeout

    private jika: {[key in x01]: string}
    private yamahai: {[key in x02]: {[key in x03]: number[]}}
    private dorahai: {[key in x0a]: {[key in x04]: number[]}}
    private tehai: {[key in x01]: {[key in x05]: number[]}}
    private furo: {[key in x01]: {[key: number]: number[]}}

    private info: {[key in x06]: number}
    private kui: {[key in x01]: boolean}
    private kan: {[key in x01]: boolean}
    private richi: {[key in x01]: {[key in x07]: boolean | number}}

    private kaze: x01
    private waitRes: {[key: string]: {[key: string]: string[] | number}}
    
    constructor(server: janho.Server, roomId: string, hosterId: string){
        this.server = server
        this.roomId = roomId
        this.hosterId = hosterId
        this.players = {}

        this.gameStatus = "wait"
        this.timer = null
        this.timeout = 25

        this.jika = {0: "", 1: "", 2: "", 3: ""}
        this.yamahai = {"rinshan": {"hai": []}, "tsumo": {"hai": []}}
        this.dorahai = {"dora": {"hai": [], "enable": []}, "uradora": {"hai": [], "enable": []}}
        this.tehai = {0: {"hai": [], "sute": []}, 1: {"hai": [], "sute": []}, 2: {"hai": [], "sute": []}, 3: {"hai": [], "sute": []}}

        /**
         * 他家Furo判定
         * 0: 無し(自家)
         * 1: 上家
         * 2: 対面
         * 3: 下家
         * 4: 加槓
         */
        this.furo = {0: {}, 1: {}, 2: {}, 3: {}}

        this.info = {"bakaze": 0, "kyoku": 0, "homba": 0, "richi": 0, "yama": 70}
        this.kui = {0: false, 1: false, 2: false, 3: false}
        this.kan = {0: false, 1: false, 2: false, 3: false}
        this.richi = {0: {"bool": false, "yama": 0, "ippatu": false}, 1: {"bool": false, "yama": 0, "ippatu": false}, 2: {"bool": false, "yama": 0, "ippatu": false}, 3: {"bool": false, "yama": 0, "ippatu": false}}

        this.kaze = 0
        this.waitRes = {}

        this.players[hosterId] = "wait"
        this.server.addPlayer(this.hosterId, this.roomId)
    }

    /**
     * クライアントがルームに参加
     * @param socketId クライアントID
     * @returns 
     */
    public join(socketId: string): boolean{
        if(Object.keys(this.players).length === 4) return false
        this.players[socketId] = "wait"
        this.server.addPlayer(socketId, this.roomId)
        return true
    }

    /**
     * クライアント準備完了
     * @param socketId クライアントID
     * @param bool true = ready | false = wait
     * @returns
     */
    public ready(socketId: string, bool: boolean): boolean{
        if(this.gameStatus !== "wait") return false
        if(bool)
            this.players[socketId] = "ready"
        else
            this.players[socketId] = "wait"

        var i = 0
        for(const [socketId, status] of Object.entries(this.players)){
            if(status === "ready")
                i++
        }
        if(i !== 4) return true
        this.gameStatus = "ready"
        this.server.getProtocol().emitArray("startRoom", Object.keys(this.players), {"protocol": "startRoom"})
        return true
    }

    /**
     * クライアントがロード完了
     * @param socketId クライアントID
     * @returns 
     */
    public loaded(socketId: string): boolean{
        if(this.gameStatus !== "ready") return false
        this.players[socketId] = "loaded"
        var i = 0
        for(const [socketId, status] of Object.entries(this.players)){
            if(status === "loaded")
                i++
        }
        if(i !== 4) return true
        this.gameStatus = "game"
        this.server.getProtocol().emitArray("kaikyoku", Object.keys(this.players), {"protocol": "kaikyoku"})
        return true
    }

    /**
     * ゲーム開始(4人全員に配牌処理)
     * @returns 
     */
    public start(): boolean{
        if(this.gameStatus !== "game") return false

        const hai = Shipai.getPai()
        this.yamahai["rinshan"]["hai"] = hai["rinshan"]
        this.dorahai["dora"]["hai"] = hai["dora"]
        this.dorahai["uradora"]["hai"] = hai["uradora"]
        this.yamahai["tsumo"]["hai"] = hai["tsumo"]
        this.tehai[3]["hai"] = hai["pei"]
        this.tehai[2]["hai"] = hai["sha"]
        this.tehai[1]["hai"] = hai["nan"]
        this.tehai[0]["hai"] = hai["ton"]

        //debug
        console.log("嶺上牌")
        console.log(hai["rinshan"])
        console.log("ドラ")
        console.log(hai["dora"])
        console.log("裏ドラ")
        console.log(hai["uradora"])
        console.log("自摸牌")
        console.log(hai["tsumo"])
        console.log("北")
        console.log(hai["pei"])
        console.log("西")
        console.log(hai["sha"])
        console.log("南")
        console.log(hai["nan"])
        console.log("東")
        console.log(hai["ton"])

        let ids: string[] = Object.keys(this.players)
        let rand: string[] = []
        while(ids.length){
            rand.push(ids.splice(Math.random() * ids.length, 1)[0])
        }
        this.jika[0] = rand[0]
        this.jika[1] = rand[1]
        this.jika[2] = rand[2]
        this.jika[3] = rand[3]
        this.server.getProtocol().emit("haipai", rand[0], {"protocol": "haipai", "hai": this.tehai[0]["hai"], "kaze": 0})
        this.server.getProtocol().emit("haipai", rand[1], {"protocol": "haipai", "hai": this.tehai[1]["hai"], "kaze": 1})
        this.server.getProtocol().emit("haipai", rand[2], {"protocol": "haipai", "hai": this.tehai[2]["hai"], "kaze": 2})
        this.server.getProtocol().emit("haipai", rand[3], {"protocol": "haipai", "hai": this.tehai[3]["hai"], "kaze": 3})

        for(const [socketId, status] of Object.entries(rand)){
            this.players[socketId] = "game"
        }

        this.onTsumo(0)
        return true
    }

    public quit(socketId: string): boolean{
        if(this.gameStatus !== "wait") return false
        delete this.players[socketId]
        if(Object.keys(this.players).length === 0){
            this.server.deleteRoom(this.roomId)
        }
        return true
    }

    public dead(socketId: string): void{
        if(this.gameStatus !== "game")
            this.quit(socketId)
        else
            this.players[socketId] = "dead"
        var i = 0
        for(const [socketId, status] of Object.entries(this.players)){
            if(status === "dead")
                i++
        }
        if(i !== 4) return
        this.server.deleteRoom(this.roomId)
    }

    public setTimer(socketId: string, json: {}): void {
        this.timer = setTimeout(() => this.finishTimer(socketId, json), this.timeout * 1000)
    }
    public clearTimer(): void{
        if(this.timer !== null)
            clearTimeout(this.timer)
    }
    private finishTimer(socketId: string, json: {}): void{
        this.timer = null
        this.server.getProtocol().emit("timeout", socketId, {"protocol": "timeout"})
        this.server.getProtocol().receive(socketId, JSON.stringify(json))
        delete this.waitRes[socketId]
    }

    public reset(): void{
        this.gameStatus = "wait"

        this.clearTimer()
        this.timer = null
        this.timeout = 25

        this.jika = {0: "", 1: "", 2: "", 3: ""}
        this.yamahai = {"rinshan": {"hai": []}, "tsumo": {"hai": []}}
        this.dorahai = {"dora": {"hai": [], "enable": []}, "uradora": {"hai": [], "enable": []}}
        this.tehai = {0: {"hai": [], "sute": []}, 1: {"hai": [], "sute": []}, 2: {"hai": [], "sute": []}, 3: {"hai": [], "sute": []}}
        this.furo = {0: {}, 1: {}, 2: {}, 3: {}}

        this.info = {"bakaze": 0, "kyoku": 0, "homba": 0, "richi": 0, "yama": 70}
        this.kui = {0: false, 1: false, 2: false, 3: false}
        this.kan = {0: false, 1: false, 2: false, 3: false}
        this.richi = {0: {"bool": false, "yama": 0, "ippatu": false}, 1: {"bool": false, "yama": 0, "ippatu": false}, 2: {"bool": false, "yama": 0, "ippatu": false}, 3: {"bool": false, "yama": 0, "ippatu": false}}

        this.kaze = 0
        this.waitRes = {}
    }

    /**
     * 以下、ゲーム進行関数
     */
    public getKaze(socketId: string): x01 | null{
        if(this.jika[0] === socketId) return 0
        else if(this.jika[1] === socketId) return 1
        else if(this.jika[2] === socketId) return 2
        else if(this.jika[3] === socketId) return 3
        else return null
    }

    public onTsumo(kaze: x01): void{
        const tsumoHai = this.yamahai["tsumo"]["hai"].splice(1, 2)[0]
        this.tehai[kaze]["hai"].push(tsumoHai)
        this.waitRes[this.jika[kaze]] = {"protocol": this.tsumoCheck(tsumoHai)}
        if(this.players[this.jika[kaze]] === "game"){
            this.server.getProtocol().emit("tsumo", this.jika[kaze], {"protocol": "tsumo", "hai": tsumoHai})
            this.setTimer(this.jika[kaze], {"protocol": "dahai", "hai": tsumoHai})
        }else if(this.players[this.jika[kaze]] === "dead"){
            //this.dahai ??
        }
    }
    private tsumoCheck(tsumoHai: number): string[]{
        //シャンテン数、副露判断
        let result: string[] = ["dahai"]
        return result
    }

    public onDahai(kaze: x01, dahaiHai: number): void{
    }
    private dahaiCheck(kaze: x01, dahaiHai: number): {[key in x01]: string[]}{
        let result: {[key in x01]: string[]} = {0: [], 1: [], 2: [], 3: []}
        return result
    }

    public onFuro(kaze: x01, furoHai: number[]): void{
    }
    private furoCheck(): string[]{
        return ["dahai"]
    }

    public onKan(kaze: x01, kanHai: number[]): void{
    }
    private kanCheck(kaze: x01, kanHai: number[]): {[key in x01]: string[]}{
        let result: {[key in x01]: string[]} = {0: [], 1: [], 2: [], 3: []}
        return result
    }

    public onKantsumo(kaze: x01, tsumoHai: number): void{
    }
    private kantsumoCheck(tsumoHai: number): string[]{
        let result: string[] = ["dahai"]
        return result
    }
}