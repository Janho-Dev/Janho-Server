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

import * as Types from "../utils/Types"
import { Logger } from "../Logger"

export class PluginLogger {
    private readonly logger: Logger
    private readonly plugin_name: string

    constructor(plugin_name: string, logger: Logger){
        this.plugin_name = plugin_name
        this.logger = logger
    }

    /**
     * プラグイン用ログ関数
     * @param level ログレベル
     * @param message メッセージ内容
     * @param id 任意のログID
     */
    public log(level: Types.level_type, message: any, id?: Types.log_id){
        this.logger.log(level, `[${this.plugin_name}] ` + message, id)
    }
}
module.exports.PluginLogger = PluginLogger