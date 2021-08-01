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
import * as Types from "../../utils/Types"
import {Game} from "../Game"
import {Hora} from "../../utils/Hora"
import {Shipai} from "../../utils/Shipai"
import {Logger} from "../../Logger"
import {Candidate} from "../../utils/Candidate"

export class Game4 implements Game {
    private readonly server: janho.Server
    private readonly roomId: string
    private readonly hosterId: string
    private players: {[key: string]: Types.player_status}

    private gameStatus: Types.game_status

    private timer: {[key: string]: NodeJS.Timeout}
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
    private event: Types.event
    private waitRes: {[key: string]: {"protocol": {[key: string]: number[]}}}

    private point: {[key in Types.kaze_number]: number}

    private logger: Logger
    
    constructor(server: janho.Server, roomId: string, hosterId: string){
        this.server = server
        this.roomId = roomId
        this.hosterId = hosterId
        this.players = {}

        this.gameStatus = "wait"
        this.timer = {}
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
            0: {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}, 
            1: {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}, 
            2: {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}, 
            3: {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}
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
            3: {"bool": false, "double": false, "ippatu": false}
        }

        this.kaze = 0
        this.event = "tsumo"
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
        this.server.getProtocol().emit("startRoom", socketId, {"protocol": "startRoom", "result": true})
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

        const hai = Shipai.getPai("Game4")
        this.yamahai["rinshan"]["hai"] = hai["rinshan"]
        this.dorahai["dora"]["hai"] = hai["dora"]
        this.dorahai["uradora"]["hai"] = hai["uradora"]
        this.yamahai["tsumo"]["hai"] = hai["tsumo"]
        this.tehai[3]["hai"] = this.haiSort(hai["pei"])
        this.tehai[2]["hai"] = this.haiSort(hai["sha"])
        this.tehai[1]["hai"] = this.haiSort(hai["nan"])
        this.tehai[0]["hai"] = this.haiSort(hai["ton"])

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
        this.server.getProtocol().emit("timein", socketId, {"protocol": "timein", "time": this.timeout})
        this.timer[socketId] = setTimeout(() => this.finishTimer(socketId, json), this.timeout * 1000)
    }
    /**
     * Timerクリア
     */
    public clearTimer(socketId: string): void{
        if(this.timer[socketId] !== null)
            clearTimeout(this.timer[socketId])
    }
    public clearAllTimer(): void{
        for(const [key, timer] of Object.entries(this.timer)){
            clearTimeout()//TODO
        }
    }
    /**
     * Timer終了時処理
     * @param socketId セッションID
     * @param json JSON
     */
    private finishTimer(socketId: string, json: {}): void{
        delete this.timer[socketId]
        this.server.getProtocol().emit("timeout", socketId, {"protocol": "timeout", "event": json})
        this.server.getProtocol().receive(socketId, JSON.stringify(json))
        delete this.waitRes[socketId]
    }

    /**
     * ゲームリセット
     */
    public reset(): void{
        this.gameStatus = "wait"

        this.clearAllTimer()
        this.timer = {}
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
            0: {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}, 
            1: {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}, 
            2: {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}, 
            3: {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}
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
    public onTsumo(kaze: Types.kaze_number): void{
        this.event = "tsumo"
        this.resetRes()

        if(this.yamahai["tsumo"]["hai"].length === 0){
            this.onRyukyoku("荒牌平局")
            return
        }

        const tsumoHai = this.yamahai["tsumo"]["hai"].splice(0, 1)[0]
        this.tsumo[kaze] = tsumoHai

        this.updateJunhai()

        const check = this.tsumoCheck(kaze, tsumoHai)
        this.waitRes[this.jika[kaze]] = {"protocol": check}
        if(this.players[this.jika[kaze]] === "game"){
            this.server.getProtocol().emit("tsumo", this.jika[kaze], {"protocol": "tsumo", "hai": tsumoHai})
            this.server.getProtocol().emit("candidate", this.jika[kaze], {"protocol": "candidate", "data": check})
            this.setTimer(this.jika[kaze], {"protocol": "dahai", "hai": tsumoHai})
        }else if(this.players[this.jika[kaze]] === "dead"){
            this.server.getProtocol().receive(this.jika[kaze], JSON.stringify({"protocol": "dahai", "hai": tsumoHai}))
        }
    }
    /**
     * 自摸チェック
     * @param tsumoHai 牌ID
     * @returns string[]
     */
    private tsumoCheck(kaze: Types.kaze_number, tsumoHai: number): {[key: string]: number[]}{
        let bakaze: Types.kaze_number
        if(this.info["bakaze"] === 0) bakaze = 0
        else if(this.info["bakaze"] === 1) bakaze = 1
        else if(this.info["bakaze"] === 2) bakaze = 2
        else bakaze = 3

        const richi = this.richi[kaze]
        const haitei = (this.yamahai["tsumo"]["hai"].length === 0)? 1 : 0
        const tenho = (this.yamahai["tsumo"]["hai"]. length === 69)? 1 : 0

        const param = Hora.get_param(
            bakaze, kaze, {"bool": richi["bool"], "double": richi["double"], "ippatu": richi["ippatu"]},
            false, false, haitei, tenho, this.dorahai, this.info["homba"], this.info["richi"])
        const hora = Hora.hora(this.tehai[kaze]["hai"], this.furo[kaze], this.junhai[kaze], tsumoHai, tsumoHai, param)
        let result: {[key: string]: number[]} = {"dahai": []}
        if(hora.yakuhai.length !== 0){
            result["hora"] = [tsumoHai]
        }

        const furo = Candidate.get(kaze, kaze, this.junhai[kaze], this.furo[kaze], tsumoHai)
        if(furo["kan"].length !== 0){
            result["ankan"] = [tsumoHai]
        }
        if(furo["kakan"].length !== 0){
            result["kakan"] = [tsumoHai]
        }

        return result
        //九種九拝判定
    }

    /**
     * 打牌処理
     * @param kaze 0 | 1 | 2 | 3
     * @param dahaiHai 牌ID
     * クライアントからの受信
     */
    public onDahai(kaze: Types.kaze_number, dahaiHai: number): boolean{
        if(!this.responseCheck(kaze, "dahai")) return false

        this.event = "dahai"
        this.resetRes()
        const tsumoHai = this.tsumo[kaze]
        this.tehai[kaze].sute.push(dahaiHai)
        if(tsumoHai !== null && typeof tsumoHai === "number"){
            if(tsumoHai !== dahaiHai){
                this.tehai[kaze].hai.push(tsumoHai)
                this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(dahaiHai), 1)
                this.tehai[kaze].hai = this.haiSort(this.tehai[kaze].hai)
            }
        }
        this.tsumo[kaze] = null

        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()

        const check = this.dahaiCheck(kaze, dahaiHai)
        let i = 0
        for(let k of num){
            if(k === kaze) continue
            if(this.players[this.jika[k]] === "game"){
                this.server.getProtocol().emit("dahai", this.jika[k], {"protocol": "dahai", "kaze": kaze, "hai": dahaiHai})
                this.server.getProtocol().emit("candidate", this.jika[k], {"protocol": "candidate", "data": check[k]})
                if(Object.keys(check[k]).length === 0) continue
                i++
                this.waitRes[this.jika[k]] = {"protocol": check[k]}
                this.setTimer(this.jika[k], {"protocol": "skip"})
            }
        }
        if(i === 0){
            if(this.kaze === 3) this.kaze = 0
            else if(this.kaze === 2) this.kaze = 3
            else if(this.kaze === 1) this.kaze = 2
            else this.kaze = 1
            this.onTsumo(this.kaze)
        }

        return true
    }
    /**
     * 打牌チェック
     * @param kaze 0 | 1 | 2 | 3
     * @param dahaiHai 牌ID
     * @returns // {[key in Types.kaze_number]: string[]}
     */
    private dahaiCheck(kaze: Types.kaze_number, dahaiHai: number): {[key in Types.kaze_number]: {[key: string]: number[]}}{
        let result: {[key in Types.kaze_number]: {[key: string]: number[]}} = {0: {}, 1: {}, 2: {}, 3: {}}
        let bakaze: Types.kaze_number
            if(this.info["bakaze"] === 0) bakaze = 0
            else if(this.info["bakaze"] === 1) bakaze = 1
            else if(this.info["bakaze"] === 2) bakaze = 2
            else bakaze = 3
        const num: Types.kaze_number[] = [0,1,2,3]
        for(const k of num){
            if(k === kaze) continue

            const richi = this.richi[k]
            const haitei = (this.yamahai["tsumo"]["hai"].length === 0)? 2 : 0
            const tenho = (this.yamahai["tsumo"]["hai"].length === 69)? 2 : 0

            const param = Hora.get_param(
                bakaze, k, {"bool": richi["bool"], "double": richi["double"], "ippatu": richi["ippatu"]},
                false, false, haitei, tenho, this.dorahai, this.info["homba"], this.info["richi"])

            let ronhai = dahaiHai
            switch(k){
                case 0:
                    if(kaze === 1) ronhai += 3
                    else if(kaze === 2) ronhai += 2
                    else if(kaze === 3) ronhai += 1
                    break;
                case 1:
                    if(kaze === 0) ronhai += 1
                    else if(kaze === 2) ronhai += 3
                    else if(kaze === 3) ronhai += 2
                    break;
                case 2:
                    if(kaze === 1) ronhai += 1
                    else if(kaze === 0) ronhai += 2
                    else if(kaze === 3) ronhai += 3
                    break;
                case 3:
                    if(kaze === 1) ronhai += 2
                    else if(kaze === 2) ronhai += 1
                    else if(kaze === 0) ronhai += 3
                    break;
            }

            const hora = Hora.hora(this.tehai[k]["hai"], this.furo[k], this.junhai[k], dahaiHai, ronhai, param)
            let pre_result: {[key: string]: number[]} = {}
            if(hora.yakuhai.length !== 0){
                pre_result["hora"] = [dahaiHai]
            }

            const furo = Candidate.get(kaze, k, this.junhai[k], this.furo[k], dahaiHai)
            if(furo["chi"].length !== 0){
                pre_result["chi"] = [dahaiHai]
            }
            if(furo["pon"].length !== 0){
                pre_result["pon"] = [dahaiHai]
            }
            if(furo["kan"].length !== 0){
                pre_result["daiminkan"] = [dahaiHai]
            }
            
            result[k] = pre_result
        }
        return result
    }

    /**
     * 碰処理
     * @param kaze 0 | 1 | 2 | 3
     * @param furoHai 牌ID[]
     * クライアントからの受信
     */
    public onPon(kaze: Types.kaze_number, furoHai: number[]): boolean{
        if(!this.responseCheck(kaze, "pon")) return false

        this.event = "furo"
        this.resetRes()
        //ここにチェック？
        this.furo[kaze].push(furoHai)
        //副露に使用した牌を抜く
        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()

        const check = this.ponCheck(kaze, furoHai)
        for(let k of num){
            if(k === kaze) continue
            if(this.players[this.jika[k]] === "game"){
                this.server.getProtocol().emit("pon", this.jika[k], {"protocol": "pon", "kaze": kaze, "hai": furoHai})
            }
        }

        return true//
    }
    /**
     * 碰チェック
     * @returns string[]
     */
    private ponCheck(kaze: Types.kaze_number, furoHai: number[]): string[]{
        return ["dahai"]
    }

    /**
     * 吃処理
     * @param kaze 0 | 1 | 2 | 3
     * @param furoHai 牌ID[]
     * クライアントからの受信
     */
     public onChi(kaze: Types.kaze_number, furoHai: number[]): boolean{
        if(!this.responseCheck(kaze, "chi")) return false

        this.event = "furo"
        this.resetRes()
        //ここにチェック？
        this.furo[kaze].push(furoHai)
        //副露に使用した牌を抜く
        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()

        const check = this.chiCheck(kaze, furoHai)
        for(let k of num){
            if(k === kaze) continue
            if(this.players[this.jika[k]] === "game"){
                this.server.getProtocol().emit("chi", this.jika[k], {"protocol": "chi", "kaze": kaze, "hai": furoHai})
            }
        }

        return true//
    }
    /**
     * 吃チェック
     * @returns string[]
     */
    private chiCheck(kaze: Types.kaze_number, furoHai: number[]): string[]{
        return ["dahai"]
    }

    /**
     * 大明槓処理
     * @param kaze 0 | 1 | 2 | 3
     * @param kanHai 牌ID[]
     * クライアントから受信
     */
    public onKan(kaze: Types.kaze_number, kanHai: number[]): boolean{
        if(!this.responseCheck(kaze, "kan")) return false

        this.event = "kan"
        this.resetRes()
        //ここにチェック？
        this.furo[kaze].push(kanHai)
        //副露に使用した牌を抜く
        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()

        const check = this.kanCheck(kaze, kanHai)
        for(let k of num){
            if(k === kaze) continue
            if(this.players[this.jika[kaze]] === "game"){
                this.server.getProtocol().emit("kan", this.jika[k], {"protocol": "kan", "kaze": kaze, "hai": kanHai})
                if(Object.keys(check[k]).length === 0) continue
                this.waitRes[this.jika[k]] = {"protocol": check[k]}
                this.setTimer(this.jika[k], {"protocol": "skip"})//skip??
            }
        }

        return true
    }
    /**
     * 大明槓チェック
     * @param kaze 0 | 1 | 2 | 3 
     * @param kanHai 槓ID[]
     * @returns // {[key in Types.kaze_number]: string[]}
     */
    private kanCheck(kaze: Types.kaze_number, kanHai: number[]): {[key in Types.kaze_number]: {[key: string]: number[]}}{
        let result: {[key in Types.kaze_number]: {[key: string]: number[]}} = {0: {}, 1: {}, 2: {}, 3: {}}
        return result
    }

    //
    public onAnkan(kaze: Types.kaze_number, kanHai: number[]): boolean{
        if(!this.responseCheck(kaze, "ankan")) return false
        this.updateJunhai()

        return true;
    }
    private ankanCheck(){}

    //
    public onKakan(kaze: Types.kaze_number, kanHai: number[]): boolean{
        if(!this.responseCheck(kaze, "kakan")) return false
        this.updateJunhai()

        return true;
    }
    private kakanCheck(){}

    /**
     * 槓自摸処理
     * @param kaze 0 | 1 | 2 | 3
     * @param tsumoHai 牌ID
     */
    public onKantsumo(kaze: Types.kaze_number): void{
        this.event = "kantsumo"
        this.resetRes()
        //他の家が行動を起こさなかったらつもる//どこかにかく？
        //これ以上つもれるかは一応チェック？その前に四槓三了？
        const tsumoHai = this.yamahai["rinshan"]["hai"].splice(1, 2)[0]
        this.tsumo[kaze] = tsumoHai

        this.updateJunhai()

        this.waitRes[this.jika[kaze]] = {"protocol": this.kantsumoCheck(kaze, tsumoHai)}
        if(this.players[this.jika[kaze]] === "game"){
            this.server.getProtocol().emit("kantsumo", this.jika[kaze], {"protocol": "kantsumo", "hai": tsumoHai})
            this.setTimer(this.jika[kaze], {"protocol": "dahai", "hai": tsumoHai})
        }else if(this.players[this.jika[kaze]] === "dead"){
            //this.dahai ??
        }
    }
    /**
     * 槓自摸チェック
     * @param tsumoHai 牌ID
     * @returns string[]
     */
    private kantsumoCheck(kaze: Types.kaze_number, tsumoHai: number): {[key: string]: number[]}{
        let result: {[key: string]: number[]} = {"dahai": [tsumoHai]}
        return result
    }

    //
    public onHora(kaze: Types.kaze_number, horaHai: number): boolean{
        if(!this.responseCheck(kaze, "hora")) return false
        return true;
    }
    private horaCheck(){}

    //
    public onRichi(kaze: Types.kaze_number, richiHai: number): boolean{
        if(!this.responseCheck(kaze, "richi")) return false
        this.updateJunhai()

        return true;
    }
    private richiCheck(){}

    //
    public onRyukyokuByPlayer(kaze: Types.kaze_number, type: Types.ryukyoku = "九種九牌"): boolean{
        return true;
    }
    private ryukyokuByPlayerCheck(){}

    //
    public onRyukyoku(type: Types.ryukyoku): void{
        return;
    }
    private ryukyokuCheck(){}

    public onSkip(kaze: Types.kaze_number): boolean{
        const socketId = this.jika[kaze]
        if(!(socketId in this.waitRes)) return false
        delete this.waitRes[socketId]
        this.server.getProtocol().emit("skip", socketId, {"protocol": "skip", "result": true})
        if(Object.keys(this.waitRes).length === 0){
            if(this.event === "dahai"){
                if(this.kaze === 3) this.kaze = 0
                else if(this.kaze === 2) this.kaze = 3
                else if(this.kaze === 1) this.kaze = 2
                else this.kaze = 1
                this.onTsumo(this.kaze)
            }
        }
        return true
    }

    public onEnd(){}
    private endCheck(){}

    public onShukyoku(){}
    private shukyokuCheck(){}

    private responseCheck(kaze: Types.kaze_number, protocol: string): boolean{
        if(this.jika[kaze] in this.waitRes){
            const response = this.waitRes[this.jika[kaze]]
            if("protocol" in response){
                if(!(protocol in response["protocol"])){
                    return false
                }
            }else{
                return false
            }
        }else{
            return false
        }
        return true
    }

    private resetRes(){
        for(let [key, socketId] of Object.entries(this.jika)){
            if(this.timer[socketId] !== null){
                clearTimeout(this.timer[socketId])
                delete this.timer[socketId]
            }
            if(socketId in this.waitRes)
                delete this.waitRes[socketId]
        }
    }

    private haiSort(hai: number[]): number[]{
        return hai.sort((a,b) => {return a - b})
    }

    private updateJunhai(): void{
        const num: Types.kaze_number[] = [0,1,2,3]
        for(let k of num){
            let new_junhai = {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}
            const pre_tehai = this.tehai[k]["hai"]
            let tehai: number[] = []
            tehai = tehai.concat(pre_tehai)
            for(let hai of tehai){
                const s = Math.floor(hai / 100) % 10
                const n = Math.floor(hai / 10) % 10
                switch(s){
                    case 1:
                        new_junhai["m"][n] += 1
                        if(n === 0) new_junhai["m"][5] += 1
                        break;
                    case 2:
                        new_junhai["p"][n] += 1
                        if(n === 0) new_junhai["p"][5] += 1
                        break;
                    case 3:
                        new_junhai["s"][n] += 1
                        if(n === 0) new_junhai["s"][5] += 1
                        break;
                    case 4:
                        new_junhai["j"][n] += 1
                        break;
                }
            }
            this.junhai[k] = new_junhai
        }
    }
}