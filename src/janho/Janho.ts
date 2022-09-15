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


// TypeScriptで起動する場合はコメントアウト
require("janho-server-dev")

import * as express from "express"
import * as http from "http"
import * as socketio from "socket.io"
import * as janho from "./Server"
import fs from "fs"
import util from "util"
import path from "path"
import {createServer} from "https"
import {readFileSync} from "fs"
import {performance} from "perf_hooks"
import {Judge} from "./utils/Judge"
import {VersionInfo} from "./VersionInfo"
import {SocketConnectEvent} from "./event/socket/SocketConnectEvent"
import {SocketDisconnectEvent} from "./event/socket/SocketDisconnectEvent"
import {SocketReceiveEvent} from "./event/socket/SocketReceiveEvent"
import {ServerStopEvent} from "./event/server/ServerStopEvent"
import {ServerPreLoadEvent} from "./event/server/ServerPreLoadEvent"
import {ServerLoadEvent} from "./event/server/ServerLoadEvent"

const S_TIME = performance.now()
const app: express.Express = express.default()
let hoster: http.Server
let io: socketio.Server
let server: janho.Server
let port = 3000

// 例外発生時エラーログを出力する
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

/**
 * 初期化処理
 * @param https - 暗号化モードの有無
 * @param key - 秘密鍵の絶対パス
 * @param cert - 証明書の絶対パス
 */
async function initialize(https: boolean, key: string, cert: string): Promise<void>{
    if(https){
        hoster = createServer({
            key: readFileSync(key),
            cert: readFileSync(cert)
        }, app)
    }else{
        hoster = http.createServer(app)
    }
    io = new socketio.Server(hoster, {
        allowEIO3: true,
        cors: {
            origin: ["file://", "http://localhost:7456"],
            methods: ["GET", "POST"]
        }
    })
    server = new janho.Server(io)

    // socket.io コネクション処理
    io.on("connection", (socket: socketio.Socket) => {
        new SocketConnectEvent(server.getEvent(), socket.id).emit()
        socket.on("disconnect", () => {
            new SocketDisconnectEvent(server.getEvent(), socket.id).emit()
            server.dead(socket.id)
        })
        socket.on("janho", (data: string) => {
            new SocketReceiveEvent(server.getEvent(), socket.id, data).emit()
            try{
                var parsed = JSON.parse(data);
            }catch(e){
                return
            }

            // 受信したデータの型を確認する
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

    // プログラム停止時実行
    process.on("exit", (code: number) => {
        new ServerStopEvent(server.getEvent()).emit()
        server.getPluginManager().unload()
        server.getLogger().log("info", "Server was stopped with exit code " + code + ".\n")
    })
}

/** メイン関数 */
async function execute(){
    // 設定ファイルを読み込み
    const data = {"server": {"port": 3000,"enable-https": false,"key": "","cert": ""}}
    const pt = path.resolve(__dirname, "..", "..", "janho.json")
    if(!fs.existsSync(pt)){
        fs.writeFileSync(pt, JSON.stringify(data, null, "\t"))
    }
    const json = JSON.parse(fs.readFileSync(pt, 'utf8'))
    let https = false
    if("server" in json){
        if("port" in json["server"]){
            port = json["server"]["port"]
        }
        if("key" in json["server"] && "cert" in json["server"]){
            if("enable-https" in json["server"]){
                if(json["server"]["enable-https"]) https = true
            }
        }
    }
    await initialize(https, json["server"]["key"], json["server"]["cert"])

    // バージョンを確認
    new ServerPreLoadEvent(server.getEvent()).emit()
    server.getLogger().log("success", `Janho Server ${VersionInfo.VERSION}. -The online mahjong software-`)
    if(VersionInfo.IS_DEVELOPMENT_BUILD){
        server.getLogger().log("warning", "This build is a development version.")
        server.getLogger().log("warning", "We recommend using a stable version that does not contain any serious bugs.")
    }
    server.getLogger().log("info", `This server is running Janho Client version 1.x.x`)
    server.getLogger().log("info", "Janho Server is distributed under the GNU Affero General Public License version 3.")

    // プラグインをロード
    const loadPlugins = () => {
        return new Promise<void>((resolve, reject) => {
            server.getLogger().log("info", "Preparing to load the plugin...")
            server.getPluginManager().load()
            resolve()
        })
    }
    await loadPlugins()

    // 設定したポート番号でサーバーを開く
    try{
        hoster.listen(port, () => {
            server.getLogger().log("info", `Server was started on *:${port}`)
            const E_TIME = performance.now()
            const ELAPSED = (E_TIME - S_TIME).toPrecision(3)
            server.getLogger().log("info", `Done (${ELAPSED}ms)! For help, type "help" or "?"`)
        })
    }catch(e){
        console.error(e)
        process.exit(1)
    }
    new ServerLoadEvent(server.getEvent()).emit()
}

execute()