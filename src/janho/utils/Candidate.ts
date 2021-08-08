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

//赤ドラのIDを100,200,300としているため判定が複雑になっている <要改善案>

import * as Types from "./Types"

export class Candidate {
    /**
     * 鳴きの候補一覧を取得
     * @param kaze 場風
     * @param jikaze 自風
     * @param junhai 純牌
     * @param furo 鳴き牌
     * @param hai 加える牌
     * @returns Types.candidated
     */
    static get(
        kaze: Types.kaze_number, jikaze: Types.kaze_number,
        junhai: {[key in Types.junhai_type]: number[]}, furo: number[][], hai: number
    ): Types.candidated{

        let param: Types.pre_candidate = {
            "junhai": {"m": junhai["m"], "p": junhai["p"], "s": junhai["s"], "j": junhai["j"]},
            "furo": furo, "hai": hai
        }

        const s = Math.floor(hai / 100) % 10
        const n = Math.floor(hai / 10) % 10
        switch(s){
            case 1:
                param["junhai"]["m"][n] += 1
                if(n === 0) param["junhai"]["m"][5] += 1
                break;
            case 2:
                param["junhai"]["p"][n] += 1
                if(n === 0) param["junhai"]["p"][5] += 1
                break;
            case 3:
                param["junhai"]["s"][n] += 1
                if(n === 0) param["junhai"]["s"][5] += 1
                break;
            case 4:
                param["junhai"]["j"][n] += 1
                break;
        }

        for(let f of furo){
            f.push(hai)
        }

        let result: Types.candidated = {"pon": [], "chi": [], "kakan": [], "kan": []}
        if(kaze !== jikaze){
            result["pon"] = this.getPon(param)
            switch(jikaze){
                case 0:
                    if(kaze === 3) result["chi"] = this.getChi(param)
                    break;
                case 1:
                    if(kaze === 0) result["chi"] = this.getChi(param)
                    break;
                case 2:
                    if(kaze === 1) result["chi"] = this.getChi(param)
                    break;
                case 3:
                    if(kaze === 2) result["chi"] = this.getChi(param)
                    break;
            }
            result["kan"] = this.getKan(param)
        }
        else{
            result["kan"] = this.getAnkan(param)
            result["kakan"] = this.getKakan(param)
        }

        return result
    }

    /**
     * チーによる鳴きの判定
     * @param param Types.pre_candidate
     * @returns 鳴きの組み合わせ候補一覧
     */
    private static getChi(param: Types.pre_candidate): number[][]{
        let result: number[][] = []
        let type: Types.junhai_type[] = ["m","p","s"]
        for(let s of type){
            let junhai = param.junhai[s]
            for(let i = 1; i < 8; i++){
                if(junhai[i] >= 1 && junhai[i+1] >= 1 && junhai[i+2] >= 1){
                    const n = Math.floor(param.hai / 10) % 10
                    if(i === 5 && n === 0){
                        if(this.getHai(s, 0) === param.hai){
                            result.push([this.getHai(s, 0), this.getHai(s, i+1), this.getHai(s, i+2)])
                        }
                    }else if(i+1 === 5 && n === 0){
                        if(this.getHai(s, 0) === param.hai){
                            result.push([this.getHai(s, i), this.getHai(s, 0), this.getHai(s, i+2)])
                        }
                    }else if(i+2 === 5 && n === 0){
                        if(this.getHai(s, 0) === param.hai){
                            result.push([this.getHai(s, i), this.getHai(s, i+1), this.getHai(s, 0)])
                        }
                    }else{
                        if(this.getHai(s, i) === param.hai || this.getHai(s, i+1) === param.hai || this.getHai(s, i+2) === param.hai){
                            if(i === 5 && junhai[0] >= 1){
                                result.push([this.getHai(s, 0), this.getHai(s, i+1), this.getHai(s, i+2)])
                                if(junhai[i] >= 2){
                                    result.push([this.getHai(s, i), this.getHai(s, i+1), this.getHai(s, i+2)])
                                }
                            }else if(i+1 === 5 && junhai[0] >= 1){
                                result.push([this.getHai(s, i), this.getHai(s, 0), this.getHai(s, i+2)])
                                if(junhai[i+1] >= 2){
                                    result.push([this.getHai(s, i), this.getHai(s, i+1), this.getHai(s, i+2)])
                                }
                            }else if(i+2 === 5 && junhai[0] >= 1){
                                result.push([this.getHai(s, 0), this.getHai(s, i+1), this.getHai(s, 0)])
                                if(junhai[i+2] >= 2){
                                    result.push([this.getHai(s, i), this.getHai(s, i+1), this.getHai(s, i+2)])
                                }
                            }else{
                                result.push([this.getHai(s, i), this.getHai(s, i+1), this.getHai(s, i+2)])
                            }
                        }
                    }
                }
            }
        }
        return result
    }
    /**
     * ポンによる鳴きの判定
     * @param param Types.pre_candidate
     * @returns 鳴きの組み合わせ候補一覧
     */
    private static getPon(param: Types.pre_candidate): number[][]{
        let result: number[][] = []
        let type: Types.junhai_type[] = ["m","p","s","j"]
        for(let s of type){
            let junhai = param.junhai[s]
            for(let i = 1; i < 8; i++){
                if(junhai[i] >= 3){
                    const n = Math.floor(param.hai / 10) % 10
                    if(s !== "j" && i === 5 && n === 0){
                        if(this.getHai(s, 0) === param.hai){
                            result.push([this.getHai(s, 0), this.getHai(s, i), this.getHai(s, i)])
                        }
                    }else{
                        if(this.getHai(s, i) === param.hai){
                            if(s !== "j" && i === 5 && junhai[0] >= 1){
                                result.push([this.getHai(s, 0), this.getHai(s, i), this.getHai(s, i)])
                                if(junhai[i] >= 4){
                                    result.push([this.getHai(s, i), this.getHai(s, i), this.getHai(s, i)])
                                }
                            }else{
                                result.push([this.getHai(s, i), this.getHai(s, i), this.getHai(s, i)])
                            }
                        }
                    }
                }
            }
        }
        return result
    }
    /**
     * カンによる鳴きの判定
     * @param param Types.pre_candidate
     * @returns 鳴きの組み合わせ候補一覧
     */
    private static getKan(param: Types.pre_candidate): number[][]{
        let result: number[][] = []
        let type: Types.junhai_type[] = ["m","p","s","j"]
        for(let s of type){
            let junhai = param.junhai[s]
            for(let i = 1; i < 8; i++){
                if(junhai[i] >= 4){
                    const n = Math.floor(param.hai / 10) % 10
                    if(s !== "j" && i === 5 && n === 0){
                        if(this.getHai(s, 0) === param.hai){
                            result.push([this.getHai(s, 0), this.getHai(s, i), this.getHai(s, i), this.getHai(s, i)])
                        }
                    }else{
                        if(this.getHai(s, i) === param.hai){
                            if(i === 5 && junhai[0] >= 1){
                                result.push([this.getHai(s, 0), this.getHai(s, i), this.getHai(s, i), this.getHai(s, i)])
                            }else{
                                result.push([this.getHai(s, i), this.getHai(s, i), this.getHai(s, i), this.getHai(s, i)])
                            }
                        }
                    }
                }
            }
        }
        return result
    }
    /**
     * 暗槓による鳴きの判定
     * @param param Types.pre_candidate
     * @returns 鳴きの組み合わせ候補一覧
     */
    private static getAnkan(param: Types.pre_candidate): number[][]{
        let result: number[][] = []
        let type: Types.junhai_type[] = ["m","p","s","j"]
        for(let s of type){
            let junhai = param.junhai[s]
            for(let i = 1; i < 8; i++){
                if(junhai[i] >= 4){
                    if(s !== "j" && i === 5  && junhai[0] >= 1){
                        result.push([this.getHai(s, 0), this.getHai(s, i), this.getHai(s, i), this.getHai(s, i)])
                    }else{
                        result.push([this.getHai(s, i), this.getHai(s, i), this.getHai(s, i), this.getHai(s, i)])
                    }
                }
            }
        }
        return result
    }
    /**
     * 加槓による鳴きの判定
     * @param param Types.pre_candidate
     * @returns 鳴きの組み合わせ候補一覧
     */
    private static getKakan(param: Types.pre_candidate): number[][]{
        let result: number[][] = []
        const s = Math.floor(param.hai / 100) % 10
        const n = Math.floor(param.hai / 10) % 10
        let ss: Types.junhai_type | null = null
        switch(s){
            case 1:
                ss = "m"
                break
            case 2:
                ss = "p"
                break
            case 3:
                ss = "s"
                break
            case 4:
                ss = "j"
                break
        }
        if(ss === null) return result
        for(let f of param.furo){
            if(f.length === 3){
                const as = Math.floor(f[0] / 100) % 10
                const bs = Math.floor(f[1] / 100) % 10
                const cs = Math.floor(f[2] / 100) % 10
                if(as === bs && as === cs && as === s){
                    const an = Math.floor(f[0] / 10) % 10
                    const bn = Math.floor(f[1] / 10) % 10
                    const cn = Math.floor(f[2] / 10) % 10
                    if(ss !== "j"){
                        if(n === 0){
                            if(an === 5 && bn === 5 && cn === 5){
                                result.push([this.getHai(ss, 0), this.getHai(ss, n), this.getHai(ss, n), this.getHai(ss, n)])
                            }
                        }else{
                            if((an === 0 && bn === 5 && cn === 5 && n === 5) || (an === 5 && bn === 0 && cn === 5 && n === 5) || (an === 5 && bn === 5 && cn === 0 && n === 5)){
                                result.push([this.getHai(ss, 0), this.getHai(ss, n), this.getHai(ss, n), this.getHai(ss, n)])
                            }else if(an === bn && an === cn && an === n){
                                result.push([this.getHai(ss, n), this.getHai(ss, n), this.getHai(ss, n), this.getHai(ss, n)])
                            }
                        }
                    }else{
                        if(an === bn && an === cn && an === n){
                            result.push([this.getHai(ss, n), this.getHai(ss, n), this.getHai(ss, n), this.getHai(ss, n)])
                        }
                    }
                }
            }
        }
        return result
    }

    /**
     * 牌種と数字から牌IDを求める
     * @param s 牌種
     * @param n 牌の数字
     * @returns 牌ID
     */
    private static getHai(s: Types.junhai_type, n: number): number{
        let hai_n
        switch(s){
            case "j":
                hai_n = 400
                break;
            case "m":
                hai_n = 100
                break;
            case "p":
                hai_n = 200
                break;
            case "s":
                hai_n = 300
                break;
        }
        return hai_n + (n * 10)
    }
}