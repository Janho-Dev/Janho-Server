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

import * as janho from "../Server"
import { Command } from "./Command"

export class CommandReader {
    private readonly server: janho.Server
    private readonly command: Command

    constructor(server: janho.Server){
        this.server = server
        this.command = new Command(server)

        // キー入力待ち状態にする
        process.stdin.resume()
        process.stdin.setEncoding("utf8")

        // 標準入力を受け取ってコマンドイベント発生
        process.stdin.on("data", (chunk) => {
            const message = "" + chunk
            // 制御文字をreplace
            this.command.onCommand(message.replace(/[\x00-\x1F\x7F-\x9F]/g, ""))
        })
    }

    public getCommand(): Command{
        return this.command
    }
}