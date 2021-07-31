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

export class Shipai {
    static getPai(): {[key: string]: number[]}{
        let shipai: number[] = [];
        for(let i = 100; i <= 400; i = i + 100){
            for(let j = 10; j <= (i === 400 ? 70 : 90); j = j + 10){
                for(let k = 1; k <= 4; k++){
                    if(k === 4 && j === 50 && i !== 400)
                        shipai.push(i)
                    else
                        shipai.push(i + j)
                }
            }
        }
        let yama: number[] = []
        while(shipai.length){
            yama.push(shipai.splice(Math.random() * shipai.length, 1)[0])
        }
        return {"rinshan": yama.slice(0, 4), "dora": yama.slice(4, 9), "uradora": yama.slice(9, 14), "tsumo": yama.slice(14, 84), "pei": yama.slice(84, 97), "sha": yama.slice(97, 110), "nan": yama.slice(110, 123), "ton": yama.slice(123, 136)}
    }
}