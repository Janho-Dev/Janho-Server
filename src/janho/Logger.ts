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

import * as Types from "./utils/Types"
import { Color } from "./utils/Color"

export class Logger {
    private status: boolean
    private debug: boolean
    private exception: Types.log_exception

    constructor(){
        this.status = true
        this.debug = false
        this.exception = {"": false}
    }

    /**
     * 標準出力にログを出力
     * @param level - ログレベル
     * @param message - 出力内容
     * @param id - ログID
     */
    public log(level: Types.level_type, message: any, id?: Types.log_id){
        if(!(this.status)) return
        if(id !== undefined){
            if(this.exception[id]) return
        }
        const time = "[" + this.getTimeStr() + "] "
        const forward = Color.white + time + Color.reset
        switch(level){
            case "debug":
                if(this.debug)
                this.send(forward + Color.gray + "[DEBUG]: " + message)
                break
            case "info":
                this.send(forward + Color.white + "[INFO]: " + message)
                break
            case "notice":
                this.send(forward + Color.cyan + "[NOTICE]: " + message)
                break
            case "warning":
                this.send(forward + Color.yellow + "[WARNING]: " + message)
                break
            case "error":
                this.send(forward + Color.red + "[ERROR]: " + message)
                break
            case "success":
                this.send(forward + Color.green + "[SUCCESS]: " + message)
        }
    }

    /**
     * 標準出力に出力
     * @param message - 出力内容
     */
    public send(message: string){
        if(!(this.status)) return
        console.log(message + Color.reset)
    }

    /** 加工済みのタイムスタンプ取得 */
    public getTimeStr(): string{
        const date = new Date()
        const timeStr = String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0")
        return timeStr
    }

    /**
     * デバッグモード切替
     * @param bool - デバッグモードの有無
     * @param log - 変更後のメッセージを表示するか
     */
    public setDebug(bool: boolean, log: boolean = true){
        this.debug = bool
        if(log) this.log("notice", "Debug mode changed to " + bool + ".")
    }
    /** デバッグモードの状態取得 */
    public getDebug(): boolean{
        return this.debug
    }

    /** デバッグモード有効化 */
    public enable(){
        this.status = true
    }
    /** デバッグモード無効化 */
    public disable(){
        this.status = false
    }

    /** 標準出力で改行 */
    public newLine(){
        if(!(this.status)) return
        console.log("")
    }
}