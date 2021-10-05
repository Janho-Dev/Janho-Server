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
import {Color} from "./utils/Color"

export class Logger {
    private status: boolean
    private debug: boolean
    private exception: Types.log_exception

    constructor(){
        this.status = true
        this.debug = false
        this.exception = {"": false}
    }

    public log(level: Types.level_type, message: any, id?: Types.log_id){
        if(!(this.status)) return
        if(id !== undefined){
            if(this.exception[id]) return
        }
        const time = "[" + this.getTimeStr() + "] "
        switch(level){
            case "debug":
                if(this.debug)
                this.send(Color.white + time + Color.reset + Color.gray + "[DEBUG]: " + message)
                break
            case "info":
                this.send(Color.white + time + Color.reset + Color.white + "[INFO]: " + message)
                break
            case "notice":
                this.send(Color.white + time + Color.reset + Color.cyan + "[NOTICE]: " + message)
                break
            case "warning":
                this.send(Color.white + time + Color.reset + Color.yellow + "[WARNING]: " + message)
                break
            case "error":
                this.send(Color.white + time + Color.reset + Color.red + "[ERROR]: " + message)
                break
            case "success":
                this.send(Color.white + time + Color.reset + Color.green + "[SUCCESS]: " + message)
        }
    }

    public send(message: string){
        if(!(this.status)) return
        console.log(message + Color.reset)
    }

    public getTimeStr(): string{
        const date = new Date()
        const timeStr = String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0")
        return timeStr
    }

    public setDebug(bool: boolean, log: boolean = true){
        this.debug = bool
        if(log) this.log("notice", "Debug mode changed to " + bool + ".")
    }
    public getDebug(): boolean{
        return this.debug
    }

    public enable(){
        this.status = true
    }
    public disable(){
        this.status = false
    }

    public newLine(){
        if(!(this.status)) return
        console.log("")
    }
}