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
import fs from "fs"
import path from "path"
import {PluginBase} from "./PluginBase"
import {PluginLogger} from "./PluginLogger"
import {VersionInfo} from "../VersionInfo"

export class PluginManager {
    private readonly server: janho.Server
    private readonly pluginDir = path.resolve(__dirname, "..", "..", "..", "plugins")
    private loaded = false
    private plugins: {[key in string]: {"class": PluginBase, "json": any}} = {}

    constructor(server: janho.Server){
        this.server = server
        this.init()
    }

    private init(){
        if(!fs.existsSync(this.pluginDir)){
            try{
                fs.mkdirSync(this.pluginDir)
            }catch(e){
                console.error(e)
            }
        }
    }

    public getPlugin(name: string): {"class": PluginBase, "json": any} | null{
        if(name.toLowerCase() in this.plugins){
            return this.plugins[name.toLowerCase()]
        }else{
            return null
        }
    }

    public getPluginClass(name: string): PluginBase | null{
        const result = this.getPlugin(name)
        if(result !== null){
            return result.class
        }else{
            return null
        }
    }

    public getPluginJson(name: string): any{
        const result = this.getPlugin(name)
        if(result !== null){
            return result.json
        }else{
            return null
        }
    }

    public getPluginList(): string[]{
        let list: string[] = []
        for(let [name, plugin] of Object.entries(this.plugins)){
            list.push(plugin.json.name + " v"+plugin.json.version)
        }
        return list
    }

    public async load(){
        if(this.loaded) return

        let dirpaths: string[] = []
        let pre_names: string[] = []
        let pre_plugins: {[key in string]: string} = {}
        let pre_jsons: {[key in string]: any} = {}
        this.plugins = {}

        try{
            fs.readdirSync(this.pluginDir).forEach(file => {
                const filepath = path.join(this.pluginDir, file)
                const stats = fs.statSync(filepath)
                if(stats.isDirectory()){
                    dirpaths.push(filepath)
                }
            })

            for(let dirpath of dirpaths){
                fs.readdirSync(dirpath).forEach(file => {
                    if(path.extname(file) !== ".json"){
                        return
                    }
                    const json = JSON.parse(fs.readFileSync(path.join(dirpath, file), "utf-8"))
                    const keys = ["name", "main", "version", "serverVersion", "author", "description"]
                    for(let key of keys){
                        if(!(key in json)){
                            this.server.getLogger().log("error", `${key} not found`)//todo
                            return
                        }
                    }
                    if(pre_names.includes(json.name)){
                        this.server.getLogger().log("error", `${json.name} already`)//todo
                        return
                    }
                    if(json.serverVersion !== VersionInfo.VERSION && json.serverVersion !== "all"){
                        this.server.getLogger().log("error", "The server version defined in the plugin is different.")
                        this.server.getLogger().log("error", `"${json.name}" Requested server version: ${json.serverVersion}.`)
                        return
                    }
                    pre_names.push(json.name.toLowerCase())
                    const mainpath = path.resolve(dirpath, json.main)
                    pre_plugins[json.name.toLowerCase()] = mainpath
                    pre_jsons[json.name.toLowerCase()] = json
                })
            }

            for(let [name, mainpath] of Object.entries(pre_plugins)){
                if(fs.existsSync(mainpath)){
                    const module = await import(mainpath)
                    const json = pre_jsons[name]
                    this.server.getLogger().log("info", `Loading ${json.name} v${json.version}`)
                    this.plugins[json.name.toLowerCase()] = {
                        "class": new module.PluginMain(this.server, new PluginLogger(json.name, this.server.getLogger())),
                        "json": json
                    }
                    this.plugins[json.name.toLowerCase()]["class"].onEnable()
                }else{
                    this.server.getLogger().log("error", "Error!")//todo
                }
            }
        }catch(err){
            console.error(err)
        }

        this.loaded = true
    }

    public unload(){
        for(let [name, plugin] of Object.entries(this.plugins)){
            this.server.getLogger().log("info", `Unloading ${plugin.json.name} v${plugin.json.version}`)
            plugin.class.onDisable()
        }
        this.plugins = {}
        this.loaded = false
    }
}