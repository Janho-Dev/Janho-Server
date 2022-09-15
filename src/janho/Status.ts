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
import {VersionInfo} from "./VersionInfo"

export class Status {
    private readonly server: janho.Server
    private timer: NodeJS.Timer | null

    constructor(server: janho.Server){
        this.server = server
        this.timer = null
        this.enable()
    }

    /** ステータス表示の有効化 */
    public enable(): boolean{
        if(this.timer){
            return false
        }
        const name = VersionInfo.NAME
        const version = VersionInfo.VERSION
        this.timer = setInterval(() => {
            const memory_used = process.memoryUsage()
            const time = Math.floor(process.uptime())

            const day = Math.floor(time / (24 * 60 * 60))
            const hour = Math.floor(time % (24 * 60 * 60) / (60 * 60))
            const minutes = Math.floor(time % (24 * 60 * 60) % (60 * 60) / 60)
            const second = time % (24 * 60 * 60) % (60 * 60) % 60

            const daystr = (day === 0) ? "" : day + ":"
            const hourstr = (hour === 0) ? "" : ("00" + hour).slice(-2) + ":"
            const minutesstr = (minutes === 0) ? "" : ("00" + minutes).slice(-2) + ":"
            const secondstr = (minutes === 0) ? second + " sec." : ("00" + second).slice(-2)

            const client = Object.keys(this.server.getAllUser()).length
            const player = Object.keys(this.server.getAllPlayer()).length
            const room = Object.keys(this.server.getAllRoom()).length
            const rss = Math.round(memory_used.rss / 1024 / 1024 * 100) / 100
            const heap = Math.round(memory_used.heapTotal / 1024 / 1024 * 100) / 100
            const uptime = daystr + hourstr + minutesstr + secondstr
            process.stdout.write(
                String.fromCharCode(27) 
                + "]0;" 
                + `${name} ${version} | Client ${client} | Player ${player} | Room ${room} | Memory ${rss} MB | Heap ${heap} MB | Uptime ${uptime}`
                + String.fromCharCode(7)
            )
        }, 1000)
        return true
    }
    
    /** ステータス表示の無効化 */
    public disable(): boolean{
        if(this.timer){
            clearInterval(this.timer)
            this.timer = null
            return true
        }
        this.timer = null
        return false
    }
}