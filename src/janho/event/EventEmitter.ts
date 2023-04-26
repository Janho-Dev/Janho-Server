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

import { EventEmitter as OriginalEventEmitter } from "events"
import { EventPort } from "./EventPort"

export class EventEmitter extends OriginalEventEmitter{
    public emit<T extends (...args: any[]) => void>(port: EventPort<T>, ...args: Parameters<T>): boolean;
    public emit(name: string | symbol, ...args: any): boolean;
    public emit(event: any, ...args: any[]) {
        const name = event instanceof EventPort ? event.name : event;
        return super.emit(name, ...args);
    }
}