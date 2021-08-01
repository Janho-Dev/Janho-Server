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

export class PluginManager {
    private readonly server: janho.Server
    private readonly pluginDir = path.resolve(__dirname, "..", "..", "..", "plugins")
    private loaded = false
    private plugins: PluginBase[] = []

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

    public async load(){
        if(this.loaded) return

        let pluginPaths: string[] = []
        this.plugins = []

        fs.readdirSync(this.pluginDir).forEach(file => {
            if (path.extname(file) !== ".ts" && path.extname(file) !== ".js") {
                return
            }
            pluginPaths.push(path.join(this.pluginDir, file))
        });

        for(let path of pluginPaths){
            try{
                const module = await import(path)
                this.plugins.push(new module.PluginMain(this.server))
            }catch(err){
                console.error(err)
            }
        }

        for(let plugin of this.plugins){
            if(typeof plugin.onEnable == "function"){
                plugin.onEnable()
            }
        }

        this.loaded = true
    }
}