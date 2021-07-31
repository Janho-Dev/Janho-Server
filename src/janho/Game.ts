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
import * as Types from "./utils/Types"
import {Hora} from "./utils/Hora"
import {Shanten} from "./utils/Shanten"
import {Shipai} from "./utils/Shipai"
import {Logger} from "./logger/Logger"

export class Game {
    private readonly server: janho.Server
    private readonly roomId: string
    private readonly hosterId: string
    private players: {[key: string]: Types.player_status}

    private gameStatus: Types.game_status

    private timer: NodeJS.Timeout | null
    private timeout

    private jika: {[key in Types.kaze_number]: string}
    private yamahai: {[key in Types.yama_type]: {[key in Types.yamahai_type]: number[]}}
    private dorahai: {[key in Types.dora_type]: {[key in Types.dorahai_type]: number[]}}
    private tehai: {[key in Types.kaze_number]: {[key in Types.tehai_type]: number[]}}
    private junhai: {[key in Types.kaze_number]: {[key in Types.junhai_type]: number[]}}
    private furo: {[key in Types.kaze_number]: number[][]}
    private tsumo: {[key in Types.kaze_number]: number[] | number | null}

    private info: {[key in Types.info_type]: number}
    private kui: {[key in Types.kaze_number]: boolean}
    private kan: {[key in Types.kaze_number]: boolean}
    private richi: {[key in Types.kaze_number]: {[key in Types.richi_type]: boolean}}

    private kaze: Types.kaze_number
    private waitRes: {[key: string]: {[key: string]: string[] | number}}

    private point: {[key in Types.kaze_number]: number}

    private logger: Logger
    
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
        this.tehai = {
            0: {"hai": [], "sute": []}, 
            1: {"hai": [], "sute": []}, 
            2: {"hai": [], "sute": []}, 
            3: {"hai": [], "sute": []}
        }
        this.junhai = {
            0: {"m": [0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0]}, 
            1: {"m": [0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0]}, 
            2: {"m": [0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0]}, 
            3: {"m": [0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0]}
        }

        /**
         * 他家Furo判定(下1桁)
         * 0: 無し(自家)
         * 1: 上家
         * 2: 対面
         * 3: 下家
         * 4: 加槓
         */
        this.furo = {0: [], 1: [], 2: [], 3: []}
        /**
         * 和了判定(下1桁)
         * 0: 自家自摸
         * 1: 上家ロン
         * 2: 対面ロン
         * 3: 下家ロン
         */
        this.tsumo = {0: null, 1: null, 2: null, 3: null}

        this.info = {"bakaze": 0, "kyoku": 0, "homba": 0, "richi": 0, "yama": 70}
        this.kui = {0: false, 1: false, 2: false, 3: false}
        this.kan = {0: false, 1: false, 2: false, 3: false}
        this.richi = {
            0: {"bool": false, "double": false, "ippatu": false}, 
            1: {"bool": false, "double": false, "ippatu": false}, 
            2: {"bool": false, "double": false, "ippatu": false}, 
            3: {"bool": false, "double": false, "ippatu": false}
        }

        this.kaze = 0
        this.waitRes = {}

        this.point = {0: 25000, 1: 25000, 2: 25000, 3: 25000}

        this.players[hosterId] = "wait"
        this.server.addPlayer(this.hosterId, this.roomId)

        this.logger = this.server.getLogger()
    }

    /**
     * クライアントがルームに参加
     * @param socketId セッションID
     * @returns true | false
     */
    public join(socketId: string): boolean{
        if(Object.keys(this.players).length === 4) return false
        this.players[socketId] = "wait"
        this.server.addPlayer(socketId, this.roomId)
        return true
    }

    /**
     * クライアント準備完了
     * @param socketId セッションID
     * @param bool true = ready | false = wait
     * @returns true | flase
     */
    public ready(socketId: string, bool: boolean): boolean{
        if(this.gameStatus !== "wait") return false
        if(bool)
            this.players[socketId] = "ready"
        else
            this.players[socketId] = "wait"

        let i = 0
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
     * @param socketId セッションID
     * @returns true | false
     */
    public loaded(socketId: string): boolean{
        if(this.gameStatus !== "ready") return false
        this.players[socketId] = "loaded"
        let i = 0
        for(const [socketId, status] of Object.entries(this.players)){
            if(status === "loaded")
                i++
        }
        if(i !== 4) return true
        this.gameStatus = "game"
        this.server.getProtocol().emitArray("kaikyoku", Object.keys(this.players), {"protocol": "kaikyoku"})
        this.start()
        return true
    }

    /**
     * ゲーム開始(4人全員に配牌処理)
     */
    public start(): void{
        if(this.gameStatus !== "game") return

        const hai = Shipai.getPai()
        this.yamahai["rinshan"]["hai"] = hai["rinshan"]
        this.dorahai["dora"]["hai"] = hai["dora"]
        this.dorahai["uradora"]["hai"] = hai["uradora"]
        this.yamahai["tsumo"]["hai"] = hai["tsumo"]
        this.tehai[3]["hai"] = hai["pei"]
        this.tehai[2]["hai"] = hai["sha"]
        this.tehai[1]["hai"] = hai["nan"]
        this.tehai[0]["hai"] = hai["ton"]

        this.logger.log("debug", "嶺上牌")
        this.logger.log("debug", hai["rinshan"])
        this.logger.log("debug", "ドラ")
        this.logger.log("debug", hai["dora"])
        this.logger.log("debug", "裏ドラ")
        this.logger.log("debug", hai["uradora"])
        this.logger.log("debug", "自摸牌")
        this.logger.log("debug", hai["tsumo"])
        this.logger.log("debug", "北")
        this.logger.log("debug", hai["pei"])
        this.logger.log("debug", "西")
        this.logger.log("debug", hai["sha"])
        this.logger.log("debug", "南")
        this.logger.log("debug", hai["nan"])
        this.logger.log("debug", "東")
        this.logger.log("debug", hai["ton"])

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

        this.players[this.jika[0]] = "game"
        this.players[this.jika[1]] = "game"
        this.players[this.jika[2]] = "game"
        this.players[this.jika[3]] = "game"

        this.onTsumo(0)
    }

    /**
     * プレイヤー退出
     * @param socketId セッションID
     * @returns true | false
     */
    public quit(socketId: string): boolean{
        if(this.gameStatus !== "wait") return false
        delete this.players[socketId]
        if(Object.keys(this.players).length === 0){
            this.server.deleteRoom(this.roomId)
        }
        return true
    }

    /**
     * プレイヤータイムアウト
     * @param socketId セッションID
     */
    public dead(socketId: string): void{
        if(this.gameStatus !== "game")
            this.quit(socketId)
        else
            this.players[socketId] = "dead"
        let i = 0
        for(const [socketId, status] of Object.entries(this.players)){
            if(status === "dead")
                i++
        }
        if(i !== 4) return
        this.server.deleteRoom(this.roomId)
    }

    /**
     * Timerセット
     * @param socketId セッションID
     * @param json JSON
     */
    public setTimer(socketId: string, json: {}): void {
        this.timer = setTimeout(() => this.finishTimer(socketId, json), this.timeout * 1000)
    }
    /**
     * Timerクリア
     */
    public clearTimer(): void{
        if(this.timer !== null)
            clearTimeout(this.timer)
    }
    /**
     * Timer終了時処理
     * @param socketId セッションID
     * @param json JSON
     */
    private finishTimer(socketId: string, json: {}): void{
        this.timer = null
        this.server.getProtocol().emit("timeout", socketId, {"protocol": "timeout"})
        this.server.getProtocol().receive(socketId, JSON.stringify(json))
        delete this.waitRes[socketId]
    }

    /**
     * ゲームリセット
     */
    public reset(): void{
        this.gameStatus = "wait"

        this.clearTimer()
        this.timer = null
        this.timeout = 25

        this.jika = {0: "", 1: "", 2: "", 3: ""}
        this.yamahai = {"rinshan": {"hai": []}, "tsumo": {"hai": []}}
        this.dorahai = {"dora": {"hai": [], "enable": []}, "uradora": {"hai": [], "enable": []}}
        this.tehai = {
            0: {"hai": [], "sute": []}, 
            1: {"hai": [], "sute": []}, 
            2: {"hai": [], "sute": []}, 
            3: {"hai": [], "sute": []}
        }
        this.junhai = {
            0: {"m": [0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0]}, 
            1: {"m": [0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0]}, 
            2: {"m": [0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0]}, 
            3: {"m": [0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0]}
        }
        this.furo = {0: [], 1: [], 2: [], 3: []}
        this.tsumo = {0: null, 1: null, 2: null, 3: null}

        this.info = {"bakaze": 0, "kyoku": 0, "homba": 0, "richi": 0, "yama": 70}
        this.kui = {0: false, 1: false, 2: false, 3: false}
        this.kan = {0: false, 1: false, 2: false, 3: false}
        this.richi = {
            0: {"bool": false, "double": false, "ippatu": false}, 
            1: {"bool": false, "double": false, "ippatu": false}, 
            2: {"bool": false, "double": false, "ippatu": false}, 
            3: {"bool": false, "double": false, "ippatu": false}}

        this.kaze = 0
        this.waitRes = {}

        this.point = {0: 25000, 1: 25000, 2: 25000, 3: 25000}
    }

    /**
     * 風取得
     * @param socketId セッションID
     * @returns 0 | 1 | 2 | 3 | null
     */
    public getKaze(socketId: string): Types.kaze_number | null{
        if(this.jika[0] === socketId) return 0
        else if(this.jika[1] === socketId) return 1
        else if(this.jika[2] === socketId) return 2
        else if(this.jika[3] === socketId) return 3
        else return null
    }

    /**
     * 自摸処理
     * @param kaze 0 | 1 | 2 | 3
     */
    public onTsumo(kaze: Types.kaze_number): void{//TODO
        this.logger.log("debug", this.players[this.jika[kaze]])
        const tsumoHai = this.yamahai["tsumo"]["hai"].splice(1, 2)[0]
        //this.tehai[kaze]["hai"].push(tsumoHai)
        this.tsumo[kaze] = tsumoHai
        this.waitRes[this.jika[kaze]] = {"protocol": this.tsumoCheck(kaze, tsumoHai)}
        if(this.players[this.jika[kaze]] === "game"){
            this.server.getProtocol().emit("tsumo", this.jika[kaze], {"protocol": "tsumo", "hai": tsumoHai})
            this.setTimer(this.jika[kaze], {"protocol": "dahai", "hai": tsumoHai})
            this.logger.log("debug", "\ntimer")
        }else if(this.players[this.jika[kaze]] === "dead"){
            //this.dahai ??
        }
    }
    /**
     * 自摸チェック
     * @param tsumoHai 牌ID
     * @returns string[]
     */
    private tsumoCheck(kaze: Types.kaze_number, tsumoHai: number): string[]{
        //シャンテン数、副露判断
        let shanten = Shanten.shanten(this.furo[kaze], this.junhai[kaze], this.tsumo[kaze])
        let result: string[] = ["dahai"]
        return result
    }

    /**
     * 打牌処理
     * @param kaze 0 | 1 | 2 | 3
     * @param dahaiHai 牌ID
     */
    public onDahai(kaze: Types.kaze_number, dahaiHai: number): void{
    }
    /**
     * 打牌チェック
     * @param kaze 0 | 1 | 2 | 3
     * @param dahaiHai 牌ID
     * @returns // {[key in Types.kaze_number]: string[]}
     */
    private dahaiCheck(kaze: Types.kaze_number, dahaiHai: number): {[key in Types.kaze_number]: string[]}{
        let result: {[key in Types.kaze_number]: string[]} = {0: [], 1: [], 2: [], 3: []}
        return result
    }

    /**
     * 副露処理
     * @param kaze 0 | 1 | 2 | 3
     * @param furoHai 牌ID[]
     */
    public onFuro(kaze: Types.kaze_number, furoHai: number[]): void{
    }
    /**
     * 副露チェック
     * @returns string[]
     */
    private furoCheck(): string[]{
        return ["dahai"]
    }

    /**
     * 槓処理
     * @param kaze 0 | 1 | 2 | 3
     * @param kanHai 牌ID[]
     */
    public onKan(kaze: Types.kaze_number, kanHai: number[]): void{
    }
    /**
     * 槓チェック
     * @param kaze 0 | 1 | 2 | 3 
     * @param kanHai 槓ID[]
     * @returns // {[key in Types.kaze_number]: string[]}
     */
    private kanCheck(kaze: Types.kaze_number, kanHai: number[]): {[key in Types.kaze_number]: string[]}{
        let result: {[key in Types.kaze_number]: string[]} = {0: [], 1: [], 2: [], 3: []}
        return result
    }

    /**
     * 槓自摸処理
     * @param kaze 0 | 1 | 2 | 3
     * @param tsumoHai 牌ID
     */
    public onKantsumo(kaze: Types.kaze_number, tsumoHai: number): void{
    }
    /**
     * 槓自摸チェック
     * @param tsumoHai 牌ID
     * @returns string[]
     */
    private kantsumoCheck(tsumoHai: number): string[]{
        let result: string[] = ["dahai"]
        return result
    }
}