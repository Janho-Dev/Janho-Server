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

import {Game4} from "./Game4";

export class Game4AI {
    private readonly parent: Game4

    constructor(parent: Game4){
        this.parent = parent
    }

    public excute(socketId: string, protocol: string, data: string){
        const parsed = JSON.parse(data)
        switch(protocol){
            case "joinRoom":
                if("result" in parsed) this.parent.ready(socketId, true)
                break

            case "startRoom":
                if("result" in parsed) break
                this.parent.loaded(socketId)
                break

            case "tsumo":
                const kaze = this.parent.getKaze(socketId)
                if(kaze === null) break
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if("hai" in parsed) this.parent.onDahai(kaze, parsed["hai"])
                    }, 2000)
                })
                break

            case "candidate":
                if("data" in parsed){
                    const parsed2 = parsed["data"]
                    if(!("dahai" in parsed2)){
                        if("chi" in parsed2 || "pon" in parsed2 || "kan" in parsed2 || "hora" in parsed2){
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    const kaze = this.parent.getKaze(socketId)
                                    if(kaze === null) return
                                    this.parent.onSkip(kaze)
                                }, 1000)
                            })
                        }
                    }
                }
                break

            case "endRoom":
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        this.parent.loaded(socketId)
                    }, 1)
                })
                break
        }
    }
}