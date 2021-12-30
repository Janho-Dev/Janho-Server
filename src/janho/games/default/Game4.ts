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
 * 場合により実装予定
 * ・チャンカン
 * ・喰い変え
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
import {Shanten} from "../../utils/Shanten"
import {Game4AI} from "../default/Game4AI"

export class Game4 extends GameBase implements Game {
    private readonly hosterId: string
    private players: {[key: string]: Types.player_status}

    private firstTime: boolean

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
    private kuware: {[key in Types.kaze_number]: boolean}
    private kan: {[key in Types.kaze_number]: boolean}
    private richi: {[key in Types.kaze_number]: {[key in Types.richi_type]: boolean}}
    private skipKyushu: {[key in Types.kaze_number]: boolean}

    private kaze: Types.kaze_number
    private event: Types.event
    private waitRes: {[key: string]: {"protocol": Types.wait_res}}
    private waitTacha: boolean
    private waitNum: number
    private responseCache: {[key in Types.kaze_number]: {"type": string, "hai": number, "combi": number[]} | null}
    private suteCache: {[key in Types.kaze_number]: number | null}

    private point: {[key in Types.kaze_number]: number}

    private logger: Logger

    private AIPlayer: Game4AI
    
    constructor(server: janho.Server, roomId: string, hosterId: string){
        super(server, roomId)
        this.hosterId = hosterId
        this.players = {}

        this.firstTime = true

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
        this.kuware = {0: false, 1: false, 2: false, 3: false}
        this.kan = {0: false, 1: false, 2: false, 3: false}
        this.richi = {
            0: {"bool": false, "double": false, "ippatu": false}, 
            1: {"bool": false, "double": false, "ippatu": false}, 
            2: {"bool": false, "double": false, "ippatu": false}, 
            3: {"bool": false, "double": false, "ippatu": false}
        }
        this.skipKyushu = {0: false, 1: false, 2: false, 3: false}

        this.kaze = 0
        this.event = "tsumo"
        this.waitRes = {}
        this.waitTacha = false
        this.waitNum = 0
        this.responseCache = {0: null, 1: null, 2: null, 3: null}
        this.suteCache = {0: null, 1: null, 2: null, 3: null}

        this.point = {0: 25000, 1: 25000, 2: 25000, 3: 25000}

        this.players[hosterId] = "wait"
        this.server.addPlayer(this.hosterId, this.roomId)

        this.logger = this.server.getLogger()

        this.AIPlayer = new Game4AI(this)
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

    public getNumber(socketId: string): number{
        let i = 1
        for(let p of Object.keys(this.players)){
            if(socketId === p) return i
            i++
        }
        return 0
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

        if(this.firstTime){
            let ids: string[] = Object.keys(this.players)
            let rand: string[] = []
            while(ids.length){
                rand.push(ids.splice(Math.random() * ids.length, 1)[0])
            }
            this.jika[0] = rand[0]
            this.jika[1] = rand[1]
            this.jika[2] = rand[2]
            this.jika[3] = rand[3]
        }

        const ton = this.server.getUserName(this.jika[0])
        const nan = this.server.getUserName(this.jika[1])
        const sha = this.server.getUserName(this.jika[2])
        const pei = this.server.getUserName(this.jika[3])
        this.server.getProtocol().emit("haipai", this.jika[0], {"protocol": "haipai", "hai": this.tehai[0]["hai"], "kaze": 0, "dora": dora, "ton": ton, "nan": nan, "sha": sha, "pei": pei})
        this.server.getProtocol().emit("haipai", this.jika[1], {"protocol": "haipai", "hai": this.tehai[1]["hai"], "kaze": 1, "dora": dora, "ton": ton, "nan": nan, "sha": sha, "pei": pei})
        this.server.getProtocol().emit("haipai", this.jika[2], {"protocol": "haipai", "hai": this.tehai[2]["hai"], "kaze": 2, "dora": dora, "ton": ton, "nan": nan, "sha": sha, "pei": pei})
        this.server.getProtocol().emit("haipai", this.jika[3], {"protocol": "haipai", "hai": this.tehai[3]["hai"], "kaze": 3, "dora": dora, "ton": ton, "nan": nan, "sha": sha, "pei": pei})

        this.server.getProtocol().emitArray("info", Object.keys(this.players), {"protocol": "info", "bakaze": this.info.bakaze, "kyoku": this.info.kyoku, "homba": this.info.homba, "richi": this.info.richi, "point": this.point})

        this.players[this.jika[0]] = "game"
        this.players[this.jika[1]] = "game"
        this.players[this.jika[2]] = "game"
        this.players[this.jika[3]] = "game"

        this.updateJunhai()
        this.onTsumo(0)
    }

    /**
     * プレイヤー退出
     * @param socketId セッションID
     * @returns true | false
     */
    public quit(socketId: string): boolean{
        if(this.gameStatus === "game") return false
        super.quit(socketId)
        this.server.deletePlayer(socketId)
        delete this.players[socketId]
        if(Object.keys(this.players).length === 0){
            this.server.deleteRoom(this.roomId)
        }

        //残りがAIのみなら即部屋削除
        let i = 0
        for(let name of Object.keys(this.players)){
            if(name[0]+name[1]+name[2] === "AI-"){
                i++
            }
        }
        if(i === Object.keys(this.players).length){
            for(let name of Object.keys(this.players)){
                this.server.deletePlayer(name)
                this.server.deleteUser(name)
            }
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

        //残りがAIのみなら即部屋削除
        let p = Object.keys(this.players).slice()
        p.splice(p.indexOf(socketId), 1)
        let j = 0
        for(let name of p){
            if(name[0]+name[1]+name[2] === "AI-"){
                j++
            }else if(this.players[name] === "dead"){
                j++
            }
        }
        if(j === p.length){
            for(let name of p){
                this.server.deletePlayer(name)
                this.server.deleteUser(name)
                if(this.gameStatus !== "game")
                    this.quit(name)
                else
                    this.players[name] = "dead"
            }
        }

        let i = 0
        for(const [socketId, status] of Object.entries(this.players)){
            if(status === "dead")
                i++
        }
        const length = Object.entries(this.players).length
        if(i === length) this.server.deleteRoom(this.roomId)
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
            clearTimeout(timer)
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
    }

    /**
     * ゲームリセット
     */
    public reset(): void{
        super.reset()
        this.gameStatus = "wait"
        for(let [str, status] of Object.entries(this.players)){
            status = "wait"
        }

        this.firstTime = true

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
        this.kuware = {0: false, 1: false, 2: false, 3: false}
        this.kan = {0: false, 1: false, 2: false, 3: false}
        this.richi = {
            0: {"bool": false, "double": false, "ippatu": false}, 
            1: {"bool": false, "double": false, "ippatu": false}, 
            2: {"bool": false, "double": false, "ippatu": false}, 
            3: {"bool": false, "double": false, "ippatu": false}}
        this.skipKyushu = {0: false, 1: false, 2: false, 3: false}

        this.kaze = 0
        this.waitRes = {}
        this.waitTacha = false
        this.waitNum = 0
        this.responseCache = {0: null, 1: null, 2: null, 3: null}
        this.suteCache = {0: null, 1: null, 2: null, 3: null}

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
        
        if(this.gameStatus !== "game") return

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
        const tenho = (this.tehai[kaze].sute.length === 0)? 1 : 0

        const param = Hora.get_param(
            bakaze, kaze, {"bool": richi["bool"], "double": richi["double"], "ippatu": richi["ippatu"]},
            false, false, haitei, tenho, this.dorahai, this.info["homba"], this.info["richi"])

        const richiHai = Shanten.getHai(this.tehai[kaze]["hai"], this.furo[kaze], this.junhai[kaze], tsumoHai, null, param)

        let tehai = this.tehai[kaze]["hai"].slice()
        tehai = tehai.concat(tsumoHai)
        let result: Types.wait_res = {"dahai": {"hai": tehai, "combi": [], "from": null, "data": {}}}
        if(this.richi[kaze]["bool"]) result["dahai"] = {"hai": [tsumoHai], "combi": [], "from": null, "data": {}}

        if(Object.keys(richiHai).length !== 0 && this.richi[kaze]["bool"] === false && Object.keys(this.furo[kaze]).length <= 0){
            let richiHais: number[] = []
            for(let hai of Object.keys(richiHai)){
                richiHais.push(Number(hai))
            }
            result["richi"] = {"hai": richiHais, "combi": [], "from": null, "data": richiHai}
        }

        const hora = Hora.hora(this.tehai[kaze]["hai"], this.furo[kaze], this.junhai[kaze], tsumoHai, null, param)
        if(Object.keys(hora.yakuhai).length !== 0){
            result["hora"] = {"hai": [tsumoHai], "combi": [], "from": null, "data": {}}
        }

        const furo = Candidate.get(kaze, kaze, this.junhai[kaze], this.furo[kaze], tsumoHai)
        if(furo["kan"].length !== 0){
            result["ankan"] = {"hai": [tsumoHai], "combi": furo["kan"], "from": null, "data": {}}
        }
        if(furo["kakan"].length !== 0){
            result["kakan"] = {"hai": [tsumoHai], "combi": furo["kakan"], "from": null, "data": {}}
        }

        //九種九牌判定
        const k_shan = Shanten.shanten_kokushi(this.furo[kaze], this.junhai[kaze])
        if(k_shan <= 4 && this.skipKyushu[kaze] === false){
            result["kyushu"] = {"hai": [0], "combi": [], "from": null, "data": {}}
            this.skipKyushu[kaze] = true
        }

        return result
    }

    /**
     * 打牌処理
     * @param kaze 0 | 1 | 2 | 3
     * @param dahaiHai 牌ID
     * クライアントからの受信
     */
    public onDahai(kaze: Types.kaze_number, dahaiHai: number, isRichi: boolean = false): boolean{
        if(!this.responseCheck(kaze, "dahai", dahaiHai) && !isRichi) return false
        super.onDahai(kaze, dahaiHai, isRichi)

        this.event = "dahai"
        this.resetRes()

        if(!isRichi) this.richi[kaze]["ippatu"] = false

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

        this.server.getProtocol().emit(isRichi ? "richi" : "dahai", this.jika[kaze], {"protocol": isRichi ? "richi" : "dahai", "result": true})

        const check = this.dahaiCheck(kaze, dahaiHai)
        let i = 0
        for(let k of num){
            if(k === kaze) continue
            if(this.players[this.jika[k]] === "game"){
                this.server.getProtocol().emit(isRichi ? "richi" : "dahai", this.jika[k], {
                    "protocol": isRichi ? "richi" : "dahai", "kaze": kaze, "hai": dahaiHai
                })
                this.server.getProtocol().emit("candidate", this.jika[k], {"protocol": "candidate", "data": check[k]})
                if(Object.keys(check[k]).length === 0) continue
                i++
                this.waitRes[this.jika[k]] = {"protocol": check[k]}
                this.setTimer(this.jika[k], {"protocol": "skip"})
            }
        }

        if(Object.keys(this.waitRes).length > 1){
            this.waitTacha = true
            this.waitNum = Object.keys(this.waitRes).length
        }

        //四風連打判定
        if(this.suteCache[kaze] === null){
            this.suteCache[kaze] = dahaiHai
        }
        if(this.suteCache[0] !== null && this.suteCache[1] !== null &&
            this.suteCache[2] !== null && this.suteCache[3]){
                if(this.suteCache[0] === this.suteCache[1] &&
                    this.suteCache[0] === this.suteCache[2] &&
                    this.suteCache[0] === this.suteCache[3]){
                        if((Math.floor(this.suteCache[0] / 100) % 10) === 4){
                            const s = Math.floor(this.suteCache[0] / 10) % 10
                            if(s >= 1 && s <= 4){
                                this.onRyukyoku("四風連打")
                            }
                        }
                }
        }

        //流局の位置確認
        if(this.dorahai.dora["enable"].length === 5){
            this.onRyukyoku("四槓散了")
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
            if(Object.keys(hora.yakuhai).length !== 0){
                pre_result["hora"] = {"hai": [dahaiHai], "combi": [], "from": kaze, "data": {}}
            }

            if(this.richi[k]["bool"] === false){
                const furo = Candidate.get(kaze, k, this.junhai[k], this.furo[k], dahaiHai)
                if(furo["chi"].length !== 0){
                    pre_result["chi"] = {"hai": [dahaiHai], "combi": furo["chi"], "from": kaze, "data": {}}
                }
                if(furo["pon"].length !== 0){
                    pre_result["pon"] = {"hai": [dahaiHai], "combi": furo["pon"], "from": kaze, "data": {}}
                }
                if(furo["kan"].length !== 0){
                    pre_result["kan"] = {"hai": [dahaiHai], "combi": furo["kan"], "from": kaze, "data": {}}
                }
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
    public onPon(kaze: Types.kaze_number, furoHai: number, combi: number[], isCached: boolean = false): boolean{
        if(!this.responseCheck(kaze, "pon", furoHai, combi)) return false
        super.onPon(kaze, furoHai, combi, isCached)

        if(this.waitTacha){
            this.addResCache("pon", kaze, furoHai, combi)
            this.server.getProtocol().emit("pon", this.jika[kaze], {"protocol": "pon", "isCached": true, "result": true})
            return true
        }

        this.server.getProtocol().emitArray("turn", Object.keys(this.players), {"protocol": "turn", "kaze": kaze, "amari": this.yamahai.tsumo.hai.length})

        this.event = "pon"
        this.resetRes()

        let new_combi = combi.slice()
        new_combi.splice(combi.indexOf(furoHai), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[0]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[1]), 1)
        this.tehai[kaze].hai = this.haiSort(this.tehai[kaze].hai)

        this.tehai[this.kaze]["sute"].splice(this.tehai[this.kaze]["sute"].length - 1, 1)

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
        this.waitRes[this.jika[kaze]] = {"protocol": {"dahai": {"hai": this.tehai[kaze].hai, "combi": [], "from": null, "data": {}}}}

        for(let k of num){
            if(k === kaze){
                const hai = this.tehai[k].hai[this.tehai[k].hai.length - 1]
                if(isCached){
                    this.server.getProtocol().emit("pon", this.jika[k], {"protocol": "pon", "kaze": kaze, "hai": furoHai, "combi": new_combi})
                }else{
                    this.server.getProtocol().emit("pon", this.jika[k], {"protocol": "pon", "result": true})
                }
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
     public onChi(kaze: Types.kaze_number, furoHai: number, combi: number[], isCached: boolean = false): boolean{
        if(!this.responseCheck(kaze, "chi", furoHai, combi)) return false
        super.onChi(kaze, furoHai, combi, isCached)

        if(this.waitTacha){
            this.addResCache("chi", kaze, furoHai, combi)
            this.server.getProtocol().emit("chi", this.jika[kaze], {"protocol": "chi", "isCached": true, "result": true})
            return true
        }

        this.server.getProtocol().emitArray("turn", Object.keys(this.players), {"protocol": "turn", "kaze": kaze, "amari": this.yamahai.tsumo.hai.length})

        this.event = "chi"
        this.resetRes()

        this.kuware[this.kaze] = true

        let new_combi = combi.slice()
        new_combi.splice(combi.indexOf(furoHai), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[0]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[1]), 1)
        this.tehai[kaze].hai = this.haiSort(this.tehai[kaze].hai)
        new_combi.push(furoHai + 3)
        this.furo[kaze].push(this.haiSort(new_combi))

        this.tehai[this.kaze]["sute"].splice(this.tehai[this.kaze]["sute"].length - 1, 1)

        this.tsumo[kaze] = new_combi

        const num: Types.kaze_number[] = [0,1,2,3]

        this.updateJunhai()
        this.kaze = kaze
        this.waitRes[this.jika[kaze]] = {"protocol": {"dahai": {"hai": this.tehai[kaze].hai, "combi": [], "from": null, "data": {}}}}

        for(let k of num){
            if(k === kaze){
                const hai = this.tehai[k].hai[this.tehai[k].hai.length - 1]
                if(isCached){
                    this.server.getProtocol().emit("chi", this.jika[k], {"protocol": "chi", "kaze": kaze, "hai": furoHai, "combi": new_combi})
                }else{
                    this.server.getProtocol().emit("chi", this.jika[k], {"protocol": "chi", "result": true})
                }
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
    public onKan(kaze: Types.kaze_number, kanHai: number, combi: number[], isCached: boolean = false): boolean{
        if(!this.responseCheck(kaze, "kan", kanHai)) return false
        super.onKan(kaze, kanHai, combi, isCached)

        if(this.waitTacha){
            this.addResCache("kan", kaze, kanHai, combi)
            this.server.getProtocol().emit("kan", this.jika[kaze], {"protocol": "kan", "isCached": true, "result": true})
            return true
        }

        this.server.getProtocol().emitArray("turn", Object.keys(this.players), {"protocol": "turn", "kaze": kaze, "amari": this.yamahai.tsumo.hai.length})

        this.event = "kan"
        this.resetRes()

        let new_combi = combi.slice()
        new_combi.splice(combi.indexOf(kanHai), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[0]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[1]), 1)
        this.tehai[kaze].hai.splice(this.tehai[kaze].hai.indexOf(new_combi[2]), 1)
        this.tehai[kaze].hai = this.haiSort(this.tehai[kaze].hai)

        this.tehai[this.kaze]["sute"].splice(this.tehai[this.kaze]["sute"].length - 1, 1)

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
                if(isCached){
                    this.server.getProtocol().emit("kan", this.jika[k], {"protocol": "kan", "kaze": kaze, "hai": kanHai, "combi": new_combi})
                }else{
                    this.server.getProtocol().emit("kan", this.jika[k], {"protocol": "kan", "result": true})
                }
                this.kan[k] = true
            }else if(this.players[this.jika[kaze]] === "game"){
                this.server.getProtocol().emit("kan", this.jika[k], {"protocol": "kan", "kaze": kaze, "hai": kanHai, "combi": new_combi})
            }
        }
        this.onKantsumo(kaze)

        return true
    }

    public onAnkan(kaze: Types.kaze_number, kanHai: number, combi: number[]): boolean{
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

        //他家の行動待ち(搶槓)
        this.event = "kantsumo"
        this.resetRes()

        const nh = this.yamahai.tsumo.hai.splice(this.yamahai.tsumo.hai.length - 1, 1)[0]
        this.yamahai["rinshan"]["hai"].push(nh)

        const length = this.dorahai["dora"]["enable"].length
        const dora = this.dorahai["dora"]["hai"][length]
        this.dorahai["dora"]["enable"].push(dora)

        this.server.getProtocol().emitArray("turn", Object.keys(this.players), {"protocol": "turn", "kaze": kaze, "amari": this.yamahai.tsumo.hai.length})

        const tsumoHai = this.yamahai["rinshan"]["hai"].splice(0, 1)[0]
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
            false, true, haitei, tenho, this.dorahai, this.info["homba"], this.info["richi"])

        const richiHai = Shanten.getHai(this.tehai[kaze]["hai"], this.furo[kaze], this.junhai[kaze], tsumoHai, null, param)
        
        const tehai = this.tehai[kaze]["hai"].slice()
        tehai.push(tsumoHai)

        let result: Types.wait_res = {"dahai": {"hai": tehai, "combi": [], "from": null, "data": {}}}

        if(this.richi[kaze]["bool"]) result["dahai"] = {"hai": [tsumoHai], "combi": [], "from": null, "data": {}}

        if(Object.keys(richiHai).length !== 0 && this.richi[kaze]["bool"] === false && Object.keys(this.furo[kaze]).length <= 0){
            let richiHais: number[] = []
            for(let hai of Object.keys(richiHai)){
                richiHais.push(Number(hai))
            }
            result["richi"] = {"hai": richiHais, "combi": [], "from": null, "data": richiHai}
        }

        const hora = Hora.hora(this.tehai[kaze]["hai"], this.furo[kaze], this.junhai[kaze], tsumoHai, tsumoHai, param)
        if(Object.keys(hora.yakuhai).length !== 0){
            result["hora"] = {"hai": [tsumoHai], "combi": [], "from": null, "data": {}}
        }

        const furo = Candidate.get(kaze, kaze, this.junhai[kaze], this.furo[kaze], tsumoHai)
        if(furo["kan"].length !== 0){
            result["ankan"] = {"hai": [tsumoHai], "combi": furo["kan"], "from": null, "data": {}}
        }
        if(furo["kakan"].length !== 0){
            result["kakan"] = {"hai": [tsumoHai], "combi": furo["kakan"], "from": null, "data": {}}
        }

        return result
    }

    public onHora(kaze: Types.kaze_number, _horaHai: number, isCached: boolean = false): boolean{
        if(!this.responseCheck(kaze, "hora", _horaHai)) return false
        super.onHora(kaze, _horaHai, isCached)

        if(this.waitTacha){
            this.addResCache("hora", kaze, _horaHai, null)
            this.server.getProtocol().emit("hora", this.jika[kaze], {"protocol": "hora", "isCached": true, "result": true})
            return true
        }

        this.clearAllTimer()

        let bakaze: Types.kaze_number
        if(this.info["bakaze"] === 0) bakaze = 0
        else if(this.info["bakaze"] === 1) bakaze = 1
        else if(this.info["bakaze"] === 2) bakaze = 2
        else bakaze = 3

        const richi = this.richi[kaze]
        let haitei: Types.hora_number = (this.yamahai["tsumo"]["hai"].length === 0)? 2 : 0
        let tenho: Types.hora_number = (this.tehai[kaze].sute.length === 0)? 2 : 0
        if(this.kaze === kaze){
            haitei = (this.yamahai["tsumo"]["hai"].length === 0)? 1 : 0
            tenho = (this.tehai[kaze].sute.length === 0)? 1 : 0
        }

        if(this.richi[kaze]["bool"]){
            const length = this.dorahai.dora["enable"].length
            for(let i = 0; i <= length - 1; i++){
                this.dorahai.uradora["enable"].push(this.dorahai.uradora["hai"][i])
            }
        }

        const param = Hora.get_param(
            bakaze, kaze, {"bool": richi["bool"], "double": richi["double"], "ippatu": richi["ippatu"]},
            false, false, haitei, tenho, this.dorahai, this.info["homba"], this.info["richi"])

        let horaHai: number | null = _horaHai
        let i = 0

        if(this.event === "dahai"){
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
        }
        horaHai = horaHai + i
        if(i === 0) horaHai = null

        const hora = Hora.hora(this.tehai[kaze]["hai"], this.furo[kaze], this.junhai[kaze], _horaHai, horaHai, param)

        const data2 = {
            "tehai": this.tehai[kaze]["hai"], "furo": this.furo[kaze], "horahai": _horaHai,
            "dora": this.dorahai["dora"]["enable"], "uradora": this.dorahai["uradora"]["enable"], "name": this.server.getUserName(this.jika[kaze])
        }

        const num: Types.kaze_number[] = [0,1,2,3]
        for(let k of num){
            if(k === kaze){
                if(isCached){
                    this.server.getProtocol().emit("hora", this.jika[k], {"protocol": "hora", "kaze": kaze, "data": hora, "data2": data2})
                }else{
                    this.server.getProtocol().emit("hora", this.jika[k], {"protocol": "hora", "result": true, "kaze": kaze, "data": hora, "data2": data2})
                }
            }else if(this.players[this.jika[kaze]] === "game"){
                this.server.getProtocol().emit("hora", this.jika[k], {"protocol": "hora", "kaze": kaze, "data": hora, "data2": data2})
            }
        }

        this.onEnd([kaze], hora.bumpai)
        return true
    }

    public onManyHora(kaze: Types.kaze_number[], _horaHai: {[key in Types.kaze_number]: number}): void{
        super.onManyHora(kaze, _horaHai)

        this.clearAllTimer()

        let bakaze: Types.kaze_number
        if(this.info["bakaze"] === 0) bakaze = 0
        else if(this.info["bakaze"] === 1) bakaze = 1
        else if(this.info["bakaze"] === 2) bakaze = 2
        else bakaze = 3

        let horas: Types.point[] = []
        let datas2: Types.data2[] = []

        for(let k of kaze){
            const richi = this.richi[k]
            let haitei: Types.hora_number = (this.yamahai["tsumo"]["hai"].length === 0)? 2 : 0
            let tenho: Types.hora_number = (this.tehai[k].sute.length === 0)? 2 : 0
            if(this.kaze === k){
                haitei = (this.yamahai["tsumo"]["hai"].length === 0)? 1 : 0
                tenho = (this.tehai[k].sute.length === 0)? 1 : 0
            }

            if(this.richi[k]["bool"]){
                const length = this.dorahai.dora["enable"].length
                for(let i = 0; i <= length - 1; i++){
                    this.dorahai.uradora["enable"].push(this.dorahai.uradora["hai"][i])
                }
            }

            const param = Hora.get_param(
                bakaze, k, {"bool": richi["bool"], "double": richi["double"], "ippatu": richi["ippatu"]},
                false, false, haitei, tenho, this.dorahai, this.info["homba"], this.info["richi"])

            let horaHai: number | null = _horaHai[k]
            let i = 0

            if(this.event === "dahai"){
                switch(k){
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
            }
            horaHai = horaHai + i
            if(i === 0) horaHai = null

            const hora = Hora.hora(this.tehai[k]["hai"], this.furo[k], this.junhai[k], _horaHai[k], horaHai, param)

            const data2: Types.data2 = {
                "tehai": this.tehai[k]["hai"], "furo": this.furo[k], "horahai": _horaHai[k],
                "dora": this.dorahai["dora"]["enable"], "uradora": this.dorahai["uradora"]["enable"], "name": this.server.getUserName(this.jika[k])
            }

            horas.push(hora)
            datas2.push(data2)
        }

        let new_bumpai = [0,0,0,0]
        for(let h of Object.values(horas)){
            for(let i = 0; i < 4; i++){
                new_bumpai[i] = new_bumpai[i] + h.bumpai[i]
            }
        }

        this.server.getProtocol().emitArray("manyHora", Object.values(this.jika), {"protocol": "manyHora", "kazes": kaze, "datas": horas, "datas2": datas2})
        if(kaze.length >= 3){
            this.onRyukyoku("三家和")
        }else{       
            this.onEnd(kaze, new_bumpai)
        }
    }

    public onRichi(kaze: Types.kaze_number, richiHai: number): boolean{
        if(!this.responseCheck(kaze, "richi", richiHai)) return false
        super.onRichi(kaze, richiHai)

        this.resetRes()

        this.server.getProtocol().emit("richi", this.jika[kaze], {"protocol": "richi", "result": true})

        this.richi[kaze]["bool"] = true
        this.richi[kaze]["ippatu"] = true
        if(this.tehai[kaze]["sute"].length === 0) this.richi[kaze]["double"] = true
        this.info["richi"] = this.info["richi"] + 1 //局終了後に減らす
        this.point[kaze] = this.point[kaze] - 1000
        this.onDahai(kaze, richiHai, true)

        let i = 0
        for(let r of Object.values(this.richi)){
            if(r["bool"]) i++
        }
        if(i >= 4){
            this.onRyukyoku("四家立直")
        }
        return true;
    }

    public onRyukyokuByPlayer(kaze: Types.kaze_number, type: Types.ryukyoku = "九種九牌"): boolean{
        if(!this.responseCheck(kaze, "kyushu", 0)) return false
        super.onRyukyokuByPlayer(kaze, type)

        this.clearAllTimer()

        this.server.getProtocol().emit("ryukyoku", this.jika[kaze], {"protocol": "ryukyoku", "result": true})

        this.server.getProtocol().emitArray("ryukyoku", Object.keys(this.players), {"protocol": "ryukyoku", "kaze": kaze, "type": type, "tehai": this.tehai[kaze].hai})
        this.onEnd(null, [0,0,0,0])
        return true;
    }

    public onRyukyoku(type: Types.ryukyoku): void{
        super.onRyukyoku(type)

        this.clearAllTimer()

        let point = [0,0,0,0]
        const tehais: {[key in Types.kaze_number]: number[] | null} = {0: null, 1: null, 2: null, 3: null}
        if(type === "荒牌平局"){
            const num: Types.kaze_number[] = [0,1,2,3]
            //流し満貫
            let nagashi: Types.kaze_number[] = []
            let notNagashi: Types.kaze_number[] = []
            for(const k of num){
                if(this.kui[k]) break
                if(this.kuware[k]) break
                let result = true
                for(let p of this.tehai[k].sute){
                    const s = Math.floor(p / 100) % 10
                    const n = Math.floor(p / 10) % 10
                    if(s !== 4){
                        if(n !== 1 && n !== 9) result = false
                    }
                }
                if(result){
                    nagashi.push(k)
                }else{
                    notNagashi.push(k)
                }
            }
            if(nagashi.length !== 0){
                let datas: Types.point[] = []
                let datas2: Types.data2[] = []
                if(nagashi.length <= 2){
                    for(let nk of nagashi){
                        if(nk === 0) point[nk] = 12000 + (this.info.homba * 300) + (this.info.richi * 1000)
                        else point[nk] = 8000 + (this.info.homba * 300) + (this.info.richi * 1000)

                        datas[nk] = 
                        {   
                            "yakuhai": [],
                            "fu": 0,
                            "hansu": 0,
                            "yakuman": 0,
                            "point": point[nk],
                            "bumpai": [],
                            "hora": "nagashi"
                        }
                        datas2[nk] = {"tehai": this.tehai[nk].hai, "furo": [], "horahai": 0, "dora": this.dorahai.dora.enable, "uradora": this.dorahai.uradora.enable, "name": this.server.getUserName(this.jika[nk])}
                    }
                    for(let nnk of notNagashi){
                        if(nagashi.length === 1){
                            if(nagashi.includes(0)){
                                point[nnk] = -((12000 + (this.info.homba * 300)) / 3)
                            }else{
                                if(nnk === 0) point[nnk] = -((12000 + (this.info.homba * 300)) / 3)
                                else point[nnk] = -(((12000 + (this.info.homba * 300)) / 3)/ 2)
                            }
                        }else if(nagashi.length === 2){
                            if(nagashi.includes(0)){
                                point[nnk] = -((20000 + (this.info.homba * 300)) / 2)
                            }else{
                                point[nnk] = -((16000 + (this.info.homba * 300)) / 2)
                            }
                        }
                    }
                }
                datas = datas.filter(v => v)
                datas2 = datas2.filter(v => v)
                this.server.getProtocol().emitArray("nagashiMangan", Object.keys(this.players), {"protocol": "nagashiMangan", "kazes": nagashi, "datas": datas, "datas2": datas2, "point": point})
                this.onEnd(nagashi, point)
                return
            }

            let i = 0
            let j: {[key in Types.kaze_number]: boolean} = {0: false, 1: false, 2: false, 3: false}
            let m: Types.kaze_number[] | null = null
            for(const k of num){
                if(Shanten.shanten(this.furo[k], this.junhai[k], null) === 0){
                    i++
                    j[k] = true
                    if(m === null) m = []
                    m.push(k)
                    tehais[k] = this.tehai[k].hai
                }
            }
            let minus = 0
            let plus = 0
            switch(i){
                case 1:
                    minus = -1000
                    plus = 3000
                    break
                case 2:
                    minus = -1500
                    plus = 1500
                    break
                case 3:
                    minus = -3000
                    plus = 1000
                    break
            }
            for(let [s, bool] of Object.entries(j)){
                if(bool){
                    point[Number(s)] = plus
                }else{
                    point[Number(s)] = minus
                }
            }
            this.server.getProtocol().emitArray("ryukyoku", Object.keys(this.players), {"protocol": "ryukyoku", "kaze": null, "type": type, "tehais": tehais, "point": point})
            this.onEnd(m, point)
            return
        }
        this.server.getProtocol().emitArray("ryukyoku", Object.keys(this.players), {"protocol": "ryukyoku", "kaze": null, "type": type, "tehais": tehais})
        this.onEnd(null, point)
        return
    }

    public onSkip(kaze: Types.kaze_number): boolean{
        const socketId = this.jika[kaze]
        if(!(socketId in this.waitRes)) return false
        super.onSkip(kaze)
        delete this.waitRes[socketId]

        this.waitNum = Object.keys(this.waitRes).length
        this.checkResCache()

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

    //一局終了
    public onEnd(hora: Types.kaze_number[] | null, point: number[]){
        super.onEnd(hora, point)

        this.clearAllTimer()
        this.timer = {}

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

        this.kui = {0: false, 1: false, 2: false, 3: false}
        this.kuware = {0: false, 1: false, 2: false, 3: false}
        this.kan = {0: false, 1: false, 2: false, 3: false}
        this.richi = {
            0: {"bool": false, "double": false, "ippatu": false}, 
            1: {"bool": false, "double": false, "ippatu": false}, 
            2: {"bool": false, "double": false, "ippatu": false}, 
            3: {"bool": false, "double": false, "ippatu": false}}
        this.skipKyushu = {0: false, 1: false, 2: false, 3: false}

        this.kaze = 0
        this.waitRes = {}
        this.waitTacha = false
        this.waitNum = 0
        this.responseCache = {0: null, 1: null, 2: null, 3: null}
        this.suteCache = {0: null, 1: null, 2: null, 3: null}

        this.point[0] += point[0]
        this.point[1] += point[1]
        this.point[2] += point[2]
        this.point[3] += point[3]

        //終局判定をしてtrueなら終局へ
        for(let [s,p] of Object.entries(this.point)){
            if(p <= 0){
                this.onShukyoku()
                return
            }
        }

        if(hora !== null){
            if(hora.includes(0)){
                if(this.point[0] >= 35000 && this.info.bakaze === 1 && this.info.kyoku === 4){ //終局点数は弄れるようにする。
                    this.onShukyoku()       //終局判定をしてtrueなら終局へ
                    return
                }
                this.info = {"bakaze": this.info.bakaze, "kyoku": this.info.kyoku, "homba": this.info.homba + 1, "richi": this.info.richi, "yama": 70}
            }else{
                if(this.info.bakaze === 1 && this.info.kyoku === 4){
                    this.onShukyoku()
                    return
                }
                //組み換え
                const jika0 = this.jika[1].slice()
                const jika1 = this.jika[2].slice()
                const jika2 = this.jika[3].slice()
                const jika3 = this.jika[0].slice()
                this.jika[0] = jika0
                this.jika[1] = jika1
                this.jika[2] = jika2
                this.jika[3] = jika3
                const c_point = {0: this.point[0], 1: this.point[1] ,2: this.point[2], 3: this.point[3]}
                this.point = {0: c_point[1], 1: c_point[2], 2: c_point[3], 3: c_point[0]}
            }
        }else{
            if(this.info.kyoku === 4){
                if(this.info.bakaze === 1){
                    this.onShukyoku()
                    return
                }
                this.info = {"bakaze": this.info.bakaze + 1, "kyoku": 1, "homba": 0, "richi": this.info.richi, "yama": 70}
            }else{
                this.info = {"bakaze": this.info.bakaze, "kyoku": this.info.kyoku + 1, "homba": 0, "richi": this.info.richi, "yama": 70}
            }
            //組み換え
            const jika0 = this.jika[1].slice()
            const jika1 = this.jika[2].slice()
            const jika2 = this.jika[3].slice()
            const jika3 = this.jika[0].slice()
            this.jika[0] = jika0
            this.jika[1] = jika1
            this.jika[2] = jika2
            this.jika[3] = jika3
            const c_point = {0: this.point[0], 1: this.point[1] ,2: this.point[2], 3: this.point[3]}
            this.point = {0: c_point[1], 1: c_point[2], 2: c_point[3], 3: c_point[0]}
        }

        if(hora !== null){
            this.info.richi = 0
        }

        this.server.getProtocol().emitArray("endRoom", Object.keys(this.players), {"protocol": "endRoom"})
        this.firstTime = false
        this.gameStatus = "ready"
        for(let [str, status] of Object.entries(this.players)){
            status = "ready"
        }
    }

    //卓終了
    public onShukyoku(){
        super.onShukyoku()
        this.server.getProtocol().emitArray("shukyoku", Object.keys(this.players), {"protocol": "shukyoku"})
        this.reset()
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
                            (n.length === combi.length) &&
                            JSON.stringify(n.concat().sort()) === JSON.stringify(combi.concat().sort())))){
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

    private addResCache(type: string, kaze: Types.kaze_number, hai: number, _combi: number[] | null){
        let combi: number[]
        if(_combi === null) combi = []
        else combi = _combi
        this.responseCache[kaze] = {"type": type, "hai": hai, "combi": combi}
        this.checkResCache()
    }

    private checkResCache(){
        if(this.waitNum === 0){
            this.waitTacha = false
            this.responseCache = {0: null, 1: null, 2: null, 3: null}
            return
        }

        let i = 0
        let j: string[] = []
        for(let [a, b] of Object.entries(this.responseCache)){
            if(b !== null){
                switch(Number(a)){
                    case 0: j.push(b.type); break
                    case 1: j.push(b.type); break
                    case 2: j.push(b.type); break
                    case 3: j.push(b.type); break
                }
                i++
            }
        }
        if(i !== this.waitNum) return

        this.waitTacha = false

        let k = 4
        const _responseCache = Object.assign({}, this.responseCache)

        let l: {[key in number]: boolean} = {0: false, 1: false, 2: false, 3: false}
        let m = 0
        for(let [s, v] of Object.entries(_responseCache)){
            if(v === null) continue
            if(v.type === "hora"){
                l[Number(s)] = true
                m++
            }
        }

        for(let [a, b] of Object.entries(_responseCache)){
            let kaze: Types.kaze_number = 0
            switch(Number(a)){
                case 1: kaze = 1; break
                case 2: kaze = 2; break
                case 3: kaze = 3; break
            }
            if(b !== null){
                switch(b.type){
                    case "chi":
                        if(j.includes("pon") || j.includes("kan") || j.includes("hora")){
                            break
                        }
                        setTimeout(() => {
                            if(b !== null)
                            this.onChi(kaze, b.hai, b.combi, true)
                        }, k)
                        break

                    case "pon":
                        if(j.includes("hora")){
                            break
                        }
                        setTimeout(() => {
                            if(b !== null)
                                this.onPon(kaze, b.hai, b.combi, true)
                        }, k)
                        break

                    case "kan":
                        if(j.includes("hora")){
                            break
                        }
                        setTimeout(() => {
                            if(b !== null)
                                this.onKan(kaze, b.hai, b.combi, true)
                        }, k)
                        break
                    case "hora":
                        if(m >= 2) break
                        setTimeout(() => {
                            if(b !== null)
                                this.onHora(kaze, b.hai, true)
                        }, k)
                        break
                }
            }
            k++
        }

        if(m >= 2){
            let kazes: Types.kaze_number[] = []
            let horahai = {0: 0, 1: 0, 2: 0, 3: 0}
            for(let [key, value] of Object.entries(l)){
                let kaze: Types.kaze_number = 0
                switch(Number(key)){
                    case 1: kaze = 1; break
                    case 2: kaze = 2; break
                    case 3: kaze = 3; break
                }
                if(value){
                    const res = Object.assign({}, _responseCache[kaze])
                    if(res !== null)
                        kazes.push(kaze)
                        horahai[kaze] = res.hai

                }
            }
            setTimeout(() => {
                this.onManyHora(kazes, horahai)
            }, k - m)
        }

        this.waitNum = 0
        this.responseCache = {0: null, 1: null, 2: null, 3: null}
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

    public excuteAI(socketId: string, protocol: string, data: string): void{
		this.AIPlayer.excute(socketId, protocol, data)
    }

    public addAI(): void{
        var S = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	    var N = 17
        var name = `AI-${Array.from(Array(N)).map(()=>S[Math.floor(Math.random()*S.length)]).join('')}`
        this.server.addUser(name, "CPU")
        const bool = this.join(name)
        this.server.getProtocol().emit("joinRoom", name, {"protocol": "joinRoom", "result": bool})
        if(!bool) this.server.deleteUser(name)
    }
}