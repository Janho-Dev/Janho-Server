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

/**
 * 未実装項目
 * ・立直
 * ・立直後の一発、ツモ
 * ・嶺上開花
 * ・流局
 * ・チャンカン
 * ・点数加減算
 * 
 * ・skipに関するバグあり
 * ・アガリ時緑一色などおかしな結果が出る
 * ・天和にならない
 * ・鳴きおかしい？＠クライアント
 * ・カンがおかしい
 * ・鳴いた牌が消えない
 * ・スマホスリープ後に復帰できない
 */
import * as janho from "../../Server"
import * as Types from "../../utils/Types"
import {Color} from "../../utils/Color"
import {Game} from "../Game"
import {Hora} from "../../utils/Hora"
import {Shipai} from "../../utils/Shipai"
import {Logger} from "../../Logger"
import {Candidate} from "../../utils/Candidate"
import {GameBase} from "./GameBase"

export class Game4 extends GameBase implements Game {
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
    private waitRes: {[key: string]: {"protocol": Types.wait_res}}

    private point: {[key in Types.kaze_number]: number}

    private logger: Logger
    
    constructor(server: janho.Server, roomId: string, hosterId: string){
        super(server, roomId)
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
        super.join(socketId)
        this.players[socketId] = "wait"
        this.server.addPlayer(socketId, this.roomId)
        const data = {
            "1": {"name": this.server.getUserName(Object.keys(this.players)[0]), "status": this.players[Object.keys(this.players)[0]]},
            "2": {"name": this.server.getUserName(Object.keys(this.players)[1]), "status": this.players[Object.keys(this.players)[1]]},
            "3": {"name": this.server.getUserName(Object.keys(this.players)[2]), "status": this.players[Object.keys(this.players)[2]]},
            "4": {"name": this.server.getUserName(Object.keys(this.players)[3]), "status": this.players[Object.keys(this.players)[3]]},
        }
        this.server.getProtocol().emitArray("roomUpdate", Object.keys(this.players), {"protocol": "roomUpdate", "data": data})
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
        super.ready(socketId, bool)
        if(bool)
            this.players[socketId] = "ready"
        else
            this.players[socketId] = "wait"
        this.server.getProtocol().emit("readyRoom", socketId, {"protocol": "readyRoom", "result": true})
        const data = {
            "1": {"name": this.server.getUserName(Object.keys(this.players)[0]), "status": this.players[Object.keys(this.players)[0]]},
            "2": {"name": this.server.getUserName(Object.keys(this.players)[1]), "status": this.players[Object.keys(this.players)[1]]},
            "3": {"name": this.server.getUserName(Object.keys(this.players)[2]), "status": this.players[Object.keys(this.players)[2]]},
            "4": {"name": this.server.getUserName(Object.keys(this.players)[3]), "status": this.players[Object.keys(this.players)[3]]},
        }
        this.server.getProtocol().emitArray("roomUpdate", Object.keys(this.players), {"protocol": "roomUpdate", "data": data})
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
        super.loaded(socketId)
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

    public sendPlayers(socketId: string){
        const data = {
            "1": {"name": this.server.getUserName(Object.keys(this.players)[0]), "status": this.players[Object.keys(this.players)[0]]},
            "2": {"name": this.server.getUserName(Object.keys(this.players)[1]), "status": this.players[Object.keys(this.players)[1]]},
            "3": {"name": this.server.getUserName(Object.keys(this.players)[2]), "status": this.players[Object.keys(this.players)[2]]},
            "4": {"name": this.server.getUserName(Object.keys(this.players)[3]), "status": this.players[Object.keys(this.players)[3]]},
        }
        this.server.getProtocol().emit("roomUpdate", socketId, {"protocol": "roomUpdate", "data": data})
    }

    /**
     * ゲーム開始(4人全員に配牌処理)
     */
    public start(): void{
        if(this.gameStatus !== "game") return
        super.start()

        const hai = Shipai.getPai("Game4")
        this.yamahai["rinshan"]["hai"] = hai["rinshan"]
        this.dorahai["dora"]["hai"] = hai["dora"]
        this.dorahai["uradora"]["hai"] = hai["uradora"]
        this.yamahai["tsumo"]["hai"] = hai["tsumo"]
        this.tehai[3]["hai"] = this.haiSort(hai["pei"])
        this.tehai[2]["hai"] = this.haiSort(hai["sha"])
        this.tehai[1]["hai"] = this.haiSort(hai["nan"])
        this.tehai[0]["hai"] = this.haiSort(hai["ton"])

        const dora = this.dorahai["dora"]["hai"][0]
        this.dorahai["dora"]["enable"].push(dora)

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

        const ton = this.server.getUserName(this.jika[0])
        const nan = this.server.getUserName(this.jika[1])
        const sha = this.server.getUserName(this.jika[2])
        const pei = this.server.getUserName(this.jika[3])
        this.server.getProtocol().emit("haipai", rand[0], {"protocol": "haipai", "hai": this.tehai[0]["hai"], "kaze": 0, "dora": dora, "ton": ton, "nan": nan, "sha": sha, "pei": pei})
        this.server.getProtocol().emit("haipai", rand[1], {"protocol": "haipai", "hai": this.tehai[1]["hai"], "kaze": 1, "dora": dora, "ton": ton, "nan": nan, "sha": sha, "pei": pei})
        this.server.getProtocol().emit("haipai", rand[2], {"protocol": "haipai", "hai": this.tehai[2]["hai"], "kaze": 2, "dora": dora, "ton": ton, "nan": nan, "sha": sha, "pei": pei})
        this.server.getProtocol().emit("haipai", rand[3], {"protocol": "haipai", "hai": this.tehai[3]["hai"], "kaze": 3, "dora": dora, "ton": ton, "nan": nan, "sha": sha, "pei": pei})

        this.players[this.jika[0]] = "game"
        this.players[this.jika[1]] = "game"
        this.players[this.jika[2]] = "game"
        this.players[this.jika[3]] = "game"

        this.onTsumo(0)
    }

    /**
     * 別局開始
     */
    public restart(): void{
        //
        super.restart()
    }

    /**
     * プレイヤー退出
     * @param socketId セッションID
     * @returns true | false
     */
    public quit(socketId: string): boolean{
        if(this.gameStatus !== "wait") return false
        super.quit(socketId)
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
        super.dead(socketId)
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
        super.reset()
        this.server.getProtocol().emitArray("resetRoom", Object.keys(this.players), {"protocol": "resetRoom"})
        this.gameStatus = "wait"
        for(let [str, status] of Object.entries(this.players)){
            status = "wait"
        }

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
        super.onTsumo(kaze)

        this.server.getProtocol().emitArray("turn", Object.keys(this.players), {"protocol": "turn", "kaze": kaze, "amari": this.yamahai.tsumo.hai.length})
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
    private tsumoCheck(kaze: Types.kaze_number, tsumoHai: number): Types.wait_res{
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
        let tehai = this.tehai[kaze]["hai"].slice()
        tehai = tehai.concat(tsumoHai)
        let result: Types.wait_res = {"dahai": {"hai": tehai, "combi": [], "from": null}}
        if(hora.yakuhai.length !== 0){
            result["hora"] = {"hai": [tsumoHai], "combi": [], "from": null}
        }

        const furo = Candidate.get(kaze, kaze, this.junhai[kaze], this.furo[kaze], tsumoHai)
        if(furo["kan"].length !== 0){
            result["ankan"] = {"hai": [tsumoHai], "combi": furo["kan"], "from": null}
        }
        if(furo["kakan"].length !== 0){
            result["kakan"] = {"hai": [tsumoHai], "combi": furo["kakan"], "from": null}
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
        if(!this.responseCheck(kaze, "dahai", dahaiHai)) return false
        super.onDahai(kaze, dahaiHai)

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
        }else if(tsumoHai !== null && Array.isArray(tsumoHai)){
            this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(dahaiHai), 1)
            this.tehai[kaze].hai = this.haiSort(this.tehai[kaze].hai)
        }
        this.tsumo[kaze] = null

        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()

        this.server.getProtocol().emit("dahai", this.jika[kaze], {"protocol": "dahai", "result": true})

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
    private dahaiCheck(kaze: Types.kaze_number, dahaiHai: number): {[key in Types.kaze_number]: Types.wait_res}{
        let result: {[key in Types.kaze_number]: Types.wait_res} = {0: {}, 1: {}, 2: {}, 3: {}}
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
            let i = 0
            switch(k){
                case 0:
                    if(kaze === 1) i = 1
                    else if(kaze === 2) i = 2
                    else if(kaze === 3) i = 3
                    break;
                case 1:
                    if(kaze === 0) i = 3
                    else if(kaze === 2) i = 1
                    else if(kaze === 3) i = 2
                    break;
                case 2:
                    if(kaze === 1) i = 3
                    else if(kaze === 0) i = 2
                    else if(kaze === 3) i = 1
                    break;
                case 3:
                    if(kaze === 1) i = 2
                    else if(kaze === 2) i = 3
                    else if(kaze === 0) i = 1
                    break;
            }
            ronhai = ronhai + i

            const hora = Hora.hora(this.tehai[k]["hai"], this.furo[k], this.junhai[k], dahaiHai, ronhai, param)
            let pre_result: Types.wait_res = {}
            if(hora.yakuhai.length !== 0){
                pre_result["hora"] = {"hai": [dahaiHai], "combi": [], "from": kaze}
            }

            const furo = Candidate.get(kaze, k, this.junhai[k], this.furo[k], dahaiHai)
            if(furo["chi"].length !== 0){
                pre_result["chi"] = {"hai": [dahaiHai], "combi": furo["chi"], "from": kaze}
            }
            if(furo["pon"].length !== 0){
                pre_result["pon"] = {"hai": [dahaiHai], "combi": furo["pon"], "from": kaze}
            }
            if(furo["kan"].length !== 0){
                pre_result["kan"] = {"hai": [dahaiHai], "combi": furo["kan"], "from": kaze}
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
    public onPon(kaze: Types.kaze_number, furoHai: number, combi: number[]): boolean{
        //待機処理
        if(!this.responseCheck(kaze, "pon", furoHai, combi)) return false
        super.onPon(kaze, furoHai, combi)

        this.server.getProtocol().emitArray("turn", Object.keys(this.players), {"protocol": "turn", "kaze": kaze, "amari": this.yamahai.tsumo.hai.length})

        this.event = "pon"
        this.resetRes()

        let new_combi = combi.slice()
        new_combi.splice(combi.indexOf(furoHai), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[0]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[1]), 1)
        this.tehai[kaze].hai = this.haiSort(this.tehai[kaze].hai)
        let i = 0
        switch(kaze){
            case 0:
                if(this.kaze === 1) i = 1
                else if(this.kaze === 2) i = 2
                else if(this.kaze === 3) i = 3
                break
            case 1:
                if(this.kaze === 2) i = 1
                else if(this.kaze === 3) i = 2
                else if(this.kaze === 0) i = 3
                break
            case 2:
                if(this.kaze === 3) i = 1
                else if(this.kaze === 0) i = 2
                else if(this.kaze === 1) i = 3
                break
            case 3:
                if(this.kaze === 0) i = 1
                else if(this.kaze === 1) i = 2
                else if(this.kaze === 2) i = 3
                break
        }
        new_combi.push(furoHai + i)
        this.furo[kaze].push(this.haiSort(new_combi))

        this.tsumo[kaze] = new_combi

        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()
        this.kaze = kaze
        this.waitRes[this.jika[kaze]] = {"protocol": {"dahai": {"hai": this.tehai[kaze].hai, "combi": [], "from": null}}}

        for(let k of num){
            if(k === kaze){
                const hai = this.tehai[k].hai[this.tehai[k].hai.length - 1]
                this.server.getProtocol().emit("pon", this.jika[k], {"protocol": "pon", "result": true})
                this.kui[k] = true
                this.server.getProtocol().emit("candidate", this.jika[k], {"protocol": "candidate", "data": {"dahai": {"hai": hai, "combi": []}}})
                this.setTimer(this.jika[k], {"protocol": "dahai", "hai": hai})
            }else if(this.players[this.jika[k]] === "game"){
                this.server.getProtocol().emit("pon", this.jika[k], {"protocol": "pon", "kaze": kaze, "hai": furoHai, "combi": new_combi})
            }
        }

        return true
    }

    /**
     * 吃処理
     * @param kaze 0 | 1 | 2 | 3
     * @param furoHai 牌ID[]
     * クライアントからの受信
     */
     public onChi(kaze: Types.kaze_number, furoHai: number, combi: number[]): boolean{
        //待機処理
        if(!this.responseCheck(kaze, "chi", furoHai, combi)) return false
        super.onChi(kaze, furoHai, combi)

        this.server.getProtocol().emitArray("turn", Object.keys(this.players), {"protocol": "turn", "kaze": kaze, "amari": this.yamahai.tsumo.hai.length})

        this.event = "chi"
        this.resetRes()

        let new_combi = combi.slice()
        new_combi.splice(combi.indexOf(furoHai), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[0]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[1]), 1)
        this.tehai[kaze].hai = this.haiSort(this.tehai[kaze].hai)
        new_combi.push(furoHai + 3)
        this.furo[kaze].push(this.haiSort(new_combi))

        this.tsumo[kaze] = new_combi

        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()
        this.kaze = kaze
        this.waitRes[this.jika[kaze]] = {"protocol": {"dahai": {"hai": this.tehai[kaze].hai, "combi": [], "from": null}}}

        for(let k of num){
            if(k === kaze){
                const hai = this.tehai[k].hai[this.tehai[k].hai.length - 1]
                this.server.getProtocol().emit("chi", this.jika[k], {"protocol": "chi", "result": true})
                this.kui[k] = true
                this.server.getProtocol().emit("candidate", this.jika[k], {"protocol": "candidate", "data": {"dahai": {"hai": this.tehai[kaze].hai, "combi": []}}})
                this.setTimer(this.jika[k], {"protocol": "dahai", "hai": hai})
            }else if(this.players[this.jika[k]] === "game"){
                this.server.getProtocol().emit("chi", this.jika[k], {"protocol": "chi", "kaze": kaze, "hai": furoHai, "combi": new_combi})
            }
        }

        return true
    }

    /**
     * 大明槓処理
     * @param kaze 0 | 1 | 2 | 3
     * @param kanHai 牌ID[]
     * クライアントから受信
     */
    public onKan(kaze: Types.kaze_number, kanHai: number, combi: number[]): boolean{
        //待機処理
        if(!this.responseCheck(kaze, "kan", kanHai)) return false
        super.onKan(kaze, kanHai, combi)

        this.server.getProtocol().emitArray("turn", Object.keys(this.players), {"protocol": "turn", "kaze": kaze, "amari": this.yamahai.tsumo.hai.length})

        this.event = "kan"
        this.resetRes()

        let new_combi = combi.slice()
        new_combi.splice(combi.indexOf(kanHai), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[0]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[1]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[2]), 1)
        this.tehai[kaze].hai = this.haiSort(this.tehai[kaze].hai)
        let i = 0
        switch(kaze){
            case 0:
                if(this.kaze === 1) i = 1
                else if(this.kaze === 2) i = 2
                else if(this.kaze === 3) i = 3
                break
            case 1:
                if(this.kaze === 2) i = 1
                else if(this.kaze === 3) i = 2
                else if(this.kaze === 0) i = 3
                break
            case 2:
                if(this.kaze === 3) i = 1
                else if(this.kaze === 0) i = 2
                else if(this.kaze === 1) i = 3
                break
            case 3:
                if(this.kaze === 0) i = 1
                else if(this.kaze === 1) i = 2
                else if(this.kaze === 2) i = 3
                break
        }
        new_combi.push(kanHai + i)
        this.furo[kaze].push(this.haiSort(new_combi))

        this.tsumo[kaze] = new_combi

        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()
        this.kaze = kaze

        for(let k of num){
            if(k === kaze){
                this.server.getProtocol().emit("kan", this.jika[k], {"protocol": "kan", "result": true})
                this.kan[k] = true
            }else if(this.players[this.jika[kaze]] === "game"){
                this.server.getProtocol().emit("kan", this.jika[k], {"protocol": "kan", "kaze": kaze, "hai": kanHai, "combi": new_combi})
            }
        }
        this.onKantsumo(kaze)

        return true
    }

    public onAnkan(kaze: Types.kaze_number, kanHai: number, combi: number[]): boolean{
        //待機処理
        if(!this.responseCheck(kaze, "ankan", kanHai)) return false
        super.onAnkan(kaze, kanHai, combi)

        this.event = "ankan"
        this.resetRes()

        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(combi[0]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(combi[1]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(combi[2]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(combi[3]), 1)
        this.tehai[kaze].hai = this.haiSort(this.tehai[kaze].hai)
        this.furo[kaze].push(this.haiSort(combi))

        this.tsumo[kaze] = combi

        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()
        this.kaze = kaze

        for(let k of num){
            if(k === kaze){
                this.server.getProtocol().emit("ankan", this.jika[k], {"protocol": "ankan", "result": true})
                this.kan[k] = true
            }else if(this.players[this.jika[kaze]] === "game"){
                this.server.getProtocol().emit("ankan", this.jika[k], {"protocol": "ankan", "kaze": kaze, "hai": kanHai, "combi": combi})
            }
        }
        this.onKantsumo(kaze)

        return true
    }

    public onKakan(kaze: Types.kaze_number, kanHai: number, combi: number[]): boolean{
        if(!this.responseCheck(kaze, "kakan", kanHai)) return false
        super.onKakan(kaze, kanHai, combi)

        this.event = "kakan"
        this.resetRes()

        const index = this.furo[kaze].indexOf(combi.splice(kanHai, 1))
        this.tehai[kaze].hai.splice(kanHai, 1)
        this.furo[kaze][index].push(kanHai)

        this.tsumo[kaze] = combi

        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()
        this.kaze = kaze

        for(let k of num){
            if(k === kaze){
                this.server.getProtocol().emit("kakan", this.jika[k], {"protocol": "kakan", "result": true})
                this.kan[k] = true
            }else if(this.players[this.jika[kaze]] === "game"){
                this.server.getProtocol().emit("kakan", this.jika[k], {"protocol": "kakan", "kaze": kaze, "hai": kanHai, "combi": combi})
            }
        }
        this.onKantsumo(kaze)

        return true
    }
    private kakanCheck(){
        //TODO
    }

    /**
     * 槓自摸処理
     * @param kaze 0 | 1 | 2 | 3
     * @param tsumoHai 牌ID
     */
    public onKantsumo(kaze: Types.kaze_number): void{
        super.onKantsumo(kaze)

        this.server.getProtocol().emitArray("turn", Object.keys(this.players), {"protocol": "turn", "kaze": kaze, "amari": this.yamahai.tsumo.hai.length})
        //他家の行動待ち(搶槓)
        this.event = "kantsumo"
        this.resetRes()

        //四槓散了は打牌後？

        const tsumoHai = this.yamahai["rinshan"]["hai"].splice(1, 2)[0]
        this.tsumo[kaze] = tsumoHai

        this.updateJunhai()

        const check = this.kantsumoCheck(kaze, tsumoHai)
        this.waitRes[this.jika[kaze]] = {"protocol": check}
        if(this.players[this.jika[kaze]] === "game"){
            this.server.getProtocol().emit("kantsumo", this.jika[kaze], {"protocol": "kantsumo", "hai": tsumoHai})
            this.server.getProtocol().emit("candidate", this.jika[kaze], {"protocol": "candidate", "data": check})
            this.setTimer(this.jika[kaze], {"protocol": "dahai", "hai": tsumoHai})
        }else if(this.players[this.jika[kaze]] === "dead"){
            this.server.getProtocol().receive(this.jika[kaze], JSON.stringify({"protocol": "dahai", "hai": tsumoHai}))
        }
    }
    /**
     * 槓自摸チェック
     * @param tsumoHai 牌ID
     * @returns string[]
     */
    private kantsumoCheck(kaze: Types.kaze_number, tsumoHai: number): Types.wait_res{
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
        const tehai = this.tehai[kaze]["hai"].slice()
        tehai.push(tsumoHai)
        let result: Types.wait_res = {"dahai": {"hai": tehai, "combi": [], "from": null}}
        if(hora.yakuhai.length !== 0){
            result["hora"] = {"hai": [tsumoHai], "combi": [], "from": null}
        }

        const furo = Candidate.get(kaze, kaze, this.junhai[kaze], this.furo[kaze], tsumoHai)
        if(furo["kan"].length !== 0){
            result["ankan"] = {"hai": [tsumoHai], "combi": furo["kan"], "from": null}
        }
        if(furo["kakan"].length !== 0){
            result["kakan"] = {"hai": [tsumoHai], "combi": furo["kakan"], "from": null}
        }

        return result
        //九種九拝判定
    }

    //
    public onHora(kaze: Types.kaze_number, _horaHai: number): boolean{
        if(!this.responseCheck(kaze, "hora", _horaHai)) return false
        super.onHora(kaze, _horaHai)

        let bakaze: Types.kaze_number
        if(this.info["bakaze"] === 0) bakaze = 0
        else if(this.info["bakaze"] === 1) bakaze = 1
        else if(this.info["bakaze"] === 2) bakaze = 2
        else bakaze = 3

        const richi = this.richi[kaze]
        const haitei = (this.yamahai["tsumo"]["hai"].length === 0)? 2 : 0
        const tenho = (this.yamahai["tsumo"]["hai"]. length === 69)? 2 : 0

        const param = Hora.get_param(
            bakaze, kaze, {"bool": richi["bool"], "double": richi["double"], "ippatu": richi["ippatu"]},
            false, false, haitei, tenho, this.dorahai, this.info["homba"], this.info["richi"])

        let horaHai = _horaHai
        let i = 0
        switch(kaze){
            case 0:
                if(this.kaze === 1) i = 1
                else if(this.kaze === 2) i = 2
                else if(this.kaze === 3) i = 3
                break;
            case 1:
                if(this.kaze === 0) i = 3
                else if(this.kaze === 2) i = 1
                else if(this.kaze === 3) i = 2
                break;
            case 2:
                if(this.kaze === 1) i = 3
                else if(this.kaze === 0) i = 2
                else if(this.kaze === 3) i = 1
                break;
            case 3:
                if(this.kaze === 1) i = 2
                else if(this.kaze === 2) i = 3
                else if(this.kaze === 0) i = 1
                break;
        }
        horaHai = horaHai + i

        const hora = Hora.hora(this.tehai[kaze]["hai"], this.furo[kaze], this.junhai[kaze], _horaHai, horaHai, param)

        const data2 = {
            "tehai": this.tehai[kaze]["hai"], "furo": this.furo[kaze], "horahai": _horaHai,
            "dora": this.dorahai["dora"]["enable"], "uradora": this.dorahai["uradora"]["enable"]
        }

        const num: Types.kaze_number[] = [0,1,2,3]
        for(let k of num){
            if(k === kaze){
                this.server.getProtocol().emit("hora", this.jika[k], {"protocol": "hora", "result": true, "kaze": kaze, "data": hora, "data2": data2})
            }else if(this.players[this.jika[kaze]] === "game"){
                this.server.getProtocol().emit("hora", this.jika[k], {"protocol": "hora", "kaze": kaze, "data": hora, "data2": data2})
            }
        }

        //todo
        this.reset()
        return true;
    }

    //
    public onRichi(kaze: Types.kaze_number, richiHai: number): boolean{
        if(!this.responseCheck(kaze, "richi", richiHai)) return false
        super.onRichi(kaze, richiHai)
        this.updateJunhai()
        //TODO
        return true;
    }

    //
    public onRyukyokuByPlayer(kaze: Types.kaze_number, type: Types.ryukyoku = "九種九牌"): boolean{
        super.onRyukyokuByPlayer(kaze, type)
        //TODO
        this.reset()
        return true;
    }

    //
    public onRyukyoku(type: Types.ryukyoku): void{
        super.onRyukyoku(type)
        //TODO
        this.reset()
        return;
    }

    public onSkip(kaze: Types.kaze_number): boolean{
        const socketId = this.jika[kaze]
        if(!(socketId in this.waitRes)) return false
        super.onSkip(kaze)
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

    public onEnd(){
        super.onEnd()
        //TODO
    }

    public onShukyoku(){
        super.onShukyoku()
        //TODO
    }

    private responseCheck(kaze: Types.kaze_number, protocol: string, hai: number, combi: number[] = []): boolean{
        if(this.jika[kaze] in this.waitRes){
            const response = this.waitRes[this.jika[kaze]]
            if("protocol" in response){
                if(!(protocol in response["protocol"])){
                    return false
                }
                if(!(response["protocol"][protocol]["hai"].includes(hai))){
                    return false
                }else{
                    if(combi.length){
                        if(!(response["protocol"][protocol]["combi"].some(n => 
                            (n.length === combi.length) && combi.every(i => n.includes(i))
                        ))){
                            return false
                        }
                    }
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
            let tehai: number[] = []
            tehai = this.tehai[k]["hai"].slice()
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
            this.junhai[k] = Object.assign({}, new_junhai)
        }
    }

    public dataDump(option: "all"|"simple"|"detail"): void{
        const a = [
            "Room Id:       ","Hoster Id:     ","Timeout:       ","Game Status:   ",
            "Kaze:          ","Event:         ","Players:       ","Jika:          ",
            "Yamahai:       ","Dorahai:       ","Tehai:         ","Junhai:        ",
            "Furo:          ","Tsumo:         ","Info:          ","Kui:           ",
            "Kan:           ","Richi:         ","Wait Response: ","Point:         "
        ]
        const b = [
            this.roomId,      this.hosterId,    this.timeout,     this.gameStatus,
            this.kaze,        this.event,       JSON.stringify(this.players),
            JSON.stringify(this.jika),          JSON.stringify(this.yamahai),
            JSON.stringify(this.dorahai),       JSON.stringify(this.tehai),
            JSON.stringify(this.junhai),        JSON.stringify(this.furo),
            JSON.stringify(this.tsumo),         JSON.stringify(this.info),
            JSON.stringify(this.kui),           JSON.stringify(this.kan),
            JSON.stringify(this.richi),         JSON.stringify(this.waitRes),
            JSON.stringify(this.point)
        ]
        switch(option){
            case "all":
                for(let i = 0; i < 20; i++){
                    console.log(Color.green + a[i] + Color.white + b[i])
                }
                break;
            case "simple":
                for(let i = 0; i < 20; i++){
                    const c = [0,1,2,3,4,5,9,13,14,15,16,17,19]
                    if(c.includes(i)){
                        console.log(Color.green + a[i] + Color.white + b[i])
                    }
                }
                break;
            case "detail":
                console.log("[Game4] detail mode is not implemented.")
                break;
        }
    }
}