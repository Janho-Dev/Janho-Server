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

export interface Game {
    join(socketId: string): boolean
    ready(socketId: string, bool: boolean): boolean
    loaded(socketId: string): boolean
    start(): void
    quit(socketId: string): boolean
    dead(socketId: string): void
    setTimer(socketId: string, json: {}): void
    clearTimer(socketId: string): void
    reset(): void
    getKaze(socketId: string): Types.kaze_number | null
    onTsumo(kaze: Types.kaze_number): void
    onDahai(kaze: Types.kaze_number, dahaiHai: number): boolean
    onPon(kaze: Types.kaze_number, furoHai: number, combi: number[]): boolean
    onChi(kaze: Types.kaze_number, furoHai: number, combi: number[]): boolean
    onKan(kaze: Types.kaze_number, kanHai: number, combi: number[]): boolean
    onAnkan(kaze: Types.kaze_number, kanHai: number, combi: number[]): boolean
    onKakan(kaze: Types.kaze_number, kanHai: number, combi: number[]): boolean
    onKantsumo(kaze: Types.kaze_number): void
    onHora(kaze: Types.kaze_number, horaHai: number): boolean
    onRichi(kaze: Types.kaze_number, richiHai: number): boolean
    onRyukyokuByPlayer(kaze: Types.kaze_number, type: Types.ryukyoku): boolean
    onRyukyoku(type: Types.ryukyoku): void
    onSkip(kaze: Types.kaze_number): boolean
    onEnd(): void
    onShukyoku(): void
}