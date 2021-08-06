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

require("janho-server-dev") //Comment out if you don't build to js

import * as express from "express"
import * as http from "http"
import * as socketio from "socket.io"
import * as janho from "./Server"
import fs from "fs"
import util from "util"
import path from "path"
import {performance} from "perf_hooks"
import {Judge} from "./utils/Judge"
import {VersionInfo} from "./VersionInfo"
import {SocketConnectEvent} from "./event/socket/SocketConnectEvent"
import {SocketDisconnectEvent} from "./event/socket/SocketDisconnectEvent"

const S_TIME = performance.now()

const app: express.Express = express.default()
const hoster: http.Server = http.createServer(app)
const io: socketio.Server = new socketio.Server(hoster, {
    allowEIO3: true,
    cors: {
        origin: ["file://", "http://localhost:7456"],
        methods: ["GET", "POST"]
    }
})
const server: janho.Server = new janho.Server(io)
const port = 3000

//コネクション処理
io.on("connection", (socket: socketio.Socket) => {
    new SocketConnectEvent(server.getEvent(), socket.id).emit()
    socket.on("disconnect", () => {
        new SocketDisconnectEvent(server.getEvent(), socket.id).emit()
        server.dead(socket.id)
    })
    socket.on("janho", (data: string) => {
        try{
            var parsed = JSON.parse(data);
        }catch(e){
            return
        }
        //データ構文確認
        if(Judge.judgeArrOrHash(parsed) !== "hash") return
        new Promise((resolve, reject) => {
            setTimeout(() => {
                server.onReceive(socket.id, data)
            }, 1);
        }).catch(() => {
            console.error("Error: socket.io receive error.")
        })
    })
})

//プログラム停止時
process.on("exit", (code: number) => {
    server.getPluginManager().unload()
    server.getLogger().log("info", "Server was stopped with exit code " + code + ".\n")
})

//エラー発生時
process.on("uncaughtException", function(error) {
    console.error("Caught exception: " + error.message + "\n")
    console.error(error.stack + "\n")
    const date = new Date()
    const dir = path.resolve(__dirname, "..", "..", "crash-report")
    if(!fs.existsSync(dir)){
        try{
            fs.mkdirSync(dir)
        }catch(e){
            console.error(e)
            process.exit(1)
        }
    }
    const log_file_err = fs.createWriteStream
    (
        dir
        + `/Crash-${date.getFullYear()}-${("0"+date.getMonth()).slice(-2)}-${("0"+date.getDate()).slice(-2)}`
        + `_${("0"+date.getHours()).slice(-2)}.${("0"+date.getMinutes()).slice(-2)}.${("0"+date.getSeconds()).slice(-2)}.log`,
        {flags:'a'}
    )
    log_file_err.once("open", () => {
        log_file_err.write(util.format(`Caught exception at ${date}`) + "\n" + util.format(error.stack) + "\n")
        log_file_err.end()
        process.exit(1)
    })
})

async function execute(){
    server.getLogger().log("success", `Janho Server ${VersionInfo.VERSION}. -The online mahjong software-`)
    if(VersionInfo.IS_DEVELOPMENT_BUILD){
        server.getLogger().log("warning", "This build is a development version.")
        server.getLogger().log("warning", "We recommend using a stable version that does not contain any serious bugs.")
    }
    server.getLogger().log("info", `This server is running Janho Client version 1.x.x`)
    server.getLogger().log("info", "Janho Server is distributed under the GNU Affero General Public License version 3.")

    const loadPlugins = () => {
        //pluginロード
        return new Promise<void>((resolve, reject) => {
            server.getLogger().log("info", "Preparing to load the plugin...")
            server.getPluginManager().load()
            resolve()
        })
    }
    await loadPlugins()

    //port番ポートで開く
    hoster.listen(port, () => {
        server.getLogger().log("info", `Server was started on *:${port}`)
        const E_TIME = performance.now()
        const ELAPSED = (E_TIME - S_TIME).toPrecision(3)
        server.getLogger().log("info", `Done (${ELAPSED}ms)! For help, type "help" or "?"`)
    })
}

execute()