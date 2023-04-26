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
import { DefaultCommand } from "./DefaultCommand"

export class StatusCommand implements DefaultCommand {
    private readonly server: janho.Server
    readonly description: string
    readonly usage: string

    constructor(server: janho.Server){
        this.server = server
        this.description = "Shows the status of the server."
        this.usage = "status"
    }

    public execute(args: string[]){
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

        this.server.getLogger().log("info", "Client - " + client)
        this.server.getLogger().log("info", "Player - " + player)
        this.server.getLogger().log("info", "room - " + room)
        this.server.getLogger().log("info", "Total memory - " + rss + " MB")
        this.server.getLogger().log("info", "Heap memory - " + heap + " MB")
        this.server.getLogger().log("info", "Uptime - " + uptime)
    }
}