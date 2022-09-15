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

export class Judge {

    /**
     * オブジェクトの配列・ハッシュ型判定
     * @param obj - オブジェクト
     * @returns 結果
     */
    static judgeArrOrHash(obj: any): string{
        if((typeof obj) === "object"){
            if(obj === null) return (typeof obj)
            if(obj.length != undefined){
                return "array"
            }else{
                for(let t in obj) {
                    if(obj[t] != undefined)
                        return "hash"
                    else
                        return "object"
                }
            }
        }
        return (typeof obj)
    }
}