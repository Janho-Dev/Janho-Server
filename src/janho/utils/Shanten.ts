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

import { Hora } from "./Hora"
import * as Types from "./Types"

export class Shanten {

    static getHai(tehai: number[], furo: number[][], junhai: {[key in Types.junhai_type]: number[]}, tsumohai: number, ronhai: number | null, param: Types.hora_info)
    : {[key in number]: number[]} {

        let result: {[key: number]: number[]} = {}

        let _junhai_: {[key in Types.junhai_type]: number[]} = {"m": [], "p": [], "s": [], "j": []}
        _junhai_["m"] = _junhai_["m"].concat(junhai["m"])
        _junhai_["p"] = _junhai_["p"].concat(junhai["p"])
        _junhai_["s"] = _junhai_["s"].concat(junhai["s"])
        _junhai_["j"] = _junhai_["j"].concat(junhai["j"])
        if(this.shanten(furo, _junhai_, tsumohai) !== 0) return {}

        //捨てた後のシャン点数0 = 捨て可能牌
        let _tehai = tehai.slice()
        _tehai.push(tsumohai)
        for(let hai of _tehai){
            let __tehai = _tehai.slice()
            __tehai.splice(__tehai.indexOf(hai), 1)
            //
            let _junhai = {"m": [0,0,0,0,0,0,0,0,0,0], "p": [0,0,0,0,0,0,0,0,0,0], "s": [0,0,0,0,0,0,0,0,0,0], "j": [0,0,0,0,0,0,0,0]}
            for(let _hai of __tehai){
                const s = Math.floor(_hai / 100) % 10
                const n = Math.floor(_hai / 10) % 10
                switch(s){
                    case 1:
                        _junhai["m"][n] += 1
                        if(n === 0) _junhai["m"][5] += 1
                        break;
                    case 2:
                        _junhai["p"][n] += 1
                        if(n === 0) _junhai["p"][5] += 1
                        break;
                    case 3:
                        _junhai["s"][n] += 1
                        if(n === 0) _junhai["s"][5] += 1
                        break;
                    case 4:
                        _junhai["j"][n] += 1
                        break;
                }
            }
            //

            let __junhai_: {[key in Types.junhai_type]: number[]} = {"m": [], "p": [], "s": [], "j": []}
            __junhai_["m"] = __junhai_["m"].concat(_junhai["m"])
            __junhai_["p"] = __junhai_["p"].concat(_junhai["p"])
            __junhai_["s"] = __junhai_["s"].concat(_junhai["s"])
            __junhai_["j"] = __junhai_["j"].concat(_junhai["j"])
            
            if(this.shanten(furo, __junhai_, null) === 0){
                const tenpai = this.tenpai(furo, __junhai_, null)
                if(tenpai !== null){
                    result[hai] = tenpai
                }
            }
        }
        return result
    }

    /**
     * 向聴数の解
     * @param furo 牌ID[][]
     * @param junhai // {[key in Types.junhai_type]: number[]}
     * @param tsumo 牌ID | [] | null
     * @returns 純向聴数
     */
    static shanten(furo: number[][], junhai: {[key in Types.junhai_type]: number[]}, tsumo: number[] | number | null): number{
        return Math.min(
            this.shanten_ippan(furo, junhai, tsumo), 
            this.shanten_kokushi(furo, junhai), 
            this.shanten_chitoi(furo, junhai)
        )
    }

    /**
     * 七対子向聴数計算
     * @param furo 牌ID[][]
     * @param _junhai // {[key in Types.junhai_type]: number[]}
     * @returns 向聴数
     */
    private static shanten_chitoi(furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}): number{
        if(furo.length) return Infinity

        let n_tatsu = 0
        let n_tanki = 0

        for(const [s, junhai] of Object.entries(_junhai)){
            for(let n = 1; n < junhai.length; n++){
                if(junhai[n] >= 2) n_tatsu++
                else if(junhai[n] == 1) n_tanki++
            }
        }

        if(n_tatsu > 7) n_tatsu = 7
        if(n_tatsu + n_tanki > 7) n_tanki = 7 - n_tatsu

        return 13 - n_tatsu * 2 - n_tanki
    }
    /**
     * 国士無双向聴数計算
     * @param furo 牌ID[][]
     * @param _junhai // {[key in Types.junhai_type]: number[]}
     * @returns 向聴数
     */
    private static shanten_kokushi(furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}): number{
        if(furo.length) return Infinity

        let n_yaochu = 0
        let n_tatsu = 0

        for(const [s, junhai] of Object.entries(_junhai)){
            let nn = (s == "j") ? [1,2,3,4,5,6,7] : [1,9]
            for(let n of nn){
                if(junhai[n] >= 1) n_yaochu++
                if(junhai[n] >= 2) n_tatsu++
            }
        }

        return n_tatsu ? 12 - n_yaochu : 13 - n_yaochu
    }
    /**
     * 一般向聴数計算
     * @param furo 牌ID[][]
     * @param _junhai // {[key in Types.junhai_type]: number[]}
     * @param tsumo 牌ID | [] | null
     * @returns 向聴数
     */
    private static shanten_ippan(furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}, tsumo: number[] | number | null): number{
        let min = this.mentsu_all(furo, _junhai)

        for(const [s, junhai] of Object.entries(_junhai)){
            for(let n = 1; n < junhai.length; n++){
                if(junhai[n] >= 2){
                    junhai[n] -= 2
                    let n_shanten = this.mentsu_all(furo, _junhai, true)
                    junhai[n] += 2
                    if(n_shanten < min) min = n_shanten
                }
            }
        }
        if(min == -1 && tsumo){
            if(Array.isArray(tsumo)){
                if(tsumo.length > 2)
                return 0
            }
        }

        return min
    }

    /**
     * 向聴数計算
     * @param furo 牌ID[][]
     * @param junhai // {[key in Types.junhai_type]: number[]}
     * @param janto 雀頭 true | false
     * @returns 向聴数
     */
    private static mentsu_all(furo: number[][], junhai: {[key in Types.junhai_type]: number[]}, janto = false): number{
        let r = {
            m: this.mentsu(junhai.m),
            p: this.mentsu(junhai.p),
            s: this.mentsu(junhai.s)
        }

        let j = [0, 0, 0]
        let n = 1
        for(n; n <= 7; n++){
            if(junhai.j[n] >= 3) j[0]++
            else if(junhai.j[n] == 2) j[1]++
            else if(junhai.j[n] == 1) j[2]++
        }

        let n_furo = furo.length

        let min = 13

        for(let m of [r.m.a, r.m.b]){
            for(let p of [r.p.a, r.p.b]){
                for(let s of [r.s.a, r.s.b]){
                    let x = [n_furo, 0, 0]
                    for(let i = 0; i < 3; i++){
                        x[i] += m[i] + p[i] + s[i] + j[i]
                    }
                    let n_shanten = this._shanten(x[0], x[1], x[2], janto)
                    if(n_shanten < min) min = n_shanten
                }
            }
        }

        return min
    }
    /**
     * 面子抜き取り
     * @param hai 牌ID[]
     * @param n 位置
     * @returns // {a: number[], b: number[]}
     */
    private static mentsu(hai: number[], n: number = 1): {a: number[], b: number[]}{
        if(n > 9) return this.tatsu(hai)

        let max = this.mentsu(hai, n+1)

        if(n <= 7 && hai[n] > 0 && hai[n+1] > 0 && hai[n+2] > 0){
            hai[n]--
            hai[n+1]--
            hai[n+2]--
            let r = this.mentsu(hai, n)
            hai[n]++
            hai[n+1]++
            hai[n+2]++

            r.a[0]++
            r.b[0]++

            if(r.a[0]*2 + r.a[1] > max.a[0]*2 + max.a[1]) max.a = r.a
            if(r.b[0]*10 + r.b[1] > max.b[0]*10 + max.b[1]) max.b = r.b
        }

        if(hai[n] >= 3){
            hai[n] -= 3
            let r = this.mentsu(hai, n)
            hai[n] += 3

            r.a[0]++
            r.b[0]++

            if(r.a[0]*2 + r.a[1] > max.a[0]*2 + max.a[1]) max.a = r.a
            if(r.b[0]*10 + r.b[1] > max.b[0]*10 + max.b[1]) max.b = r.b
        }

        return max
    }
    /**
     * 搭子計算
     * @param hai 牌ID[]
     * @returns // {a: number[], b: number[]}
     */
    private static tatsu(hai: number[]): {a: number[], b: number[]}{
        let n_hai = 0
        let n_tatsu = 0
        let n_tanki = 0

        let n = 1
        for(n; n <= 9; n++){
            n_hai += hai[n]
            if(n <= 7 && hai[n+1] === 0 && hai[n+2] == 0){
                n_tatsu += n_hai >> 1
                n_tanki += n_hai % 2
                n_hai = 0
            }
        }
        n_tatsu += n_hai >> 1
        n_tanki += n_hai % 2

        return {
            a: [0, n_tatsu, n_tanki], 
            b: [0, n_tatsu, n_tanki]
        }
    }

    /**
     * 向聴数計算改
     * @param mentsu 面子数
     * @param tatsu 搭子数
     * @param koritsu 孤立牌数
     * @param janto 雀頭 true | false
     * @returns 向聴数
     */
    private static _shanten(mentsu: number, tatsu: number, koritsu: number, janto: boolean): number{
        let n = janto ? 4 : 5
        if(mentsu > 4){
            tatsu += mentsu - 4
            mentsu = 4
        }
        if(mentsu + tatsu > 4){
            koritsu += mentsu + tatsu - 4
            tatsu = 4 - mentsu
        }
        if(mentsu + tatsu + koritsu > n){
            koritsu = n - mentsu - tatsu
        }
        if(janto) tatsu++
        return 13 - mentsu * 3 - tatsu * 2 - koritsu
    }

    public static tenpai(
        furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}, tsumo: number[] | number | null
    ): number[] | null{

        if (tsumo !== null) return null
    
        let hai = []
        let n_shanten = this.shanten(furo, _junhai, tsumo)
        const kaze: Types.junhai_type[] = ["m","p","s","j"]
        for (let s of kaze) {
            let junhai = _junhai[s]
            for (let n = 1; n < junhai.length; n++) {
                if (junhai[n] >= 4) continue
                junhai[n]++
                let n_s = 100
                if(s === "p") n_s = 200
                else if(s === "s") n_s = 300
                else if(s === "j") n_s = 400
                if (this.shanten(furo, _junhai, tsumo) < n_shanten) hai.push(n_s+(n*10))
                junhai[n]--
            }
        }
        return hai
    }
}