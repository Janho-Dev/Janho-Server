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

export class Shanten {
    static yukohai(tehai: number[], furo: number[]): number[]{
        return []
    }

    static shanten(tehai: number[], furo: number[]): number{
        return Math.min(this.shanten_ippan(tehai, furo), this.shanten_kokushi(tehai, furo), this.shanten_chitoi(tehai, furo))
    }

    static shanten_chitoi(tehai: number[], furo: number[]): number{
        return 0
    }
    static shanten_kokushi(tehai: number[], furo: number[]): number{
        return 0
    }
    static shanten_ippan(tehai: number[], furo: number[]): number{
        return 0
    }

    static mentsu_all(tehai: number[], furo: number[]): number{
        return 0
    }
    static mentsu(hai: number[], n: number = 1): number{
        return 0
    }
    static tatsu(hai: number[]): {a: number[], b: number[]}{
        return {a: [], b: []}
    }

    static _shanten(mentsu: number, tatsu: number, koritsu: number, janto: boolean): number{
        return 0
    }
}