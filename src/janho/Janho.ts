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

import * as express from "express"
import * as http from "http"
import * as socketio from "socket.io"
import * as janho from "./Server"
import {Judge} from "./utils/Judge"

const app: express.Express = express.default()
const hoster: http.Server = http.createServer(app)
const io: socketio.Server = new socketio.Server(hoster, {
    allowEIO3: true,
    cors: {
        origin: "file://",
        methods: ["GET", "POST"]
    }
})
const server: janho.Server = new janho.Server(io)

io.on("connection", (socket: socketio.Socket) => {
    socket.on("disconnect", () => {
        server.dead(socket.id)
    })
    socket.on("janho", (data: string) => {
        try{
            var parsed = JSON.parse(data);
        }catch(e){
            return
        }
        if(Judge.judgeArrOrHash(parsed) !== "hash") return
        server.onReceive(socket.id, data)
    })
})

hoster.listen(3000, () => {
    console.log('listening on *:3000')
})