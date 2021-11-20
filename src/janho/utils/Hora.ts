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

import * as Types from "./Types"
import {Shanten} from "./Shanten"

export class Hora {

    /**
     * 候補役和了牌(上1桁)
     * 1: 和了牌
    */

    /**
     * 他家Furo/Hora判定(下1桁) 更新版
     * 0: 無し(自家)
     * 1: 上家
     * 2: 対面
     * 3: 下家
     * 5: 自摸
    */

    /**
     * 天和・海底判定
     * 0: 無し
     * 1: 天和・海底模月
     * 2: 地和・河底撈魚
     */

    static get_param
    (
        bakaze: Types.kaze_number, 
        jikaze: Types.kaze_number, 
        _richi: {[key in Types.richi_type]: boolean},
        chankan: boolean,
        rinshan: boolean,
        haitei: Types.hora_number,
        tenho: Types.hora_number,
        _dorahai: {[key in Types.dora_type]: {[key in Types.dorahai_type]: number[]}},
        tsumibo: number,
        richibo: number
    ): Types.hora_info
    {
        let richi: Types.hora_number
        let ippatsu: boolean
        if(_richi["bool"]){
            if(_richi["double"]) richi = 2
            else richi = 1
            
            if(_richi["ippatu"]) ippatsu = true
            else ippatsu = false
        }else{
            richi = 0
            ippatsu = false
        }
        
        let dorahai = _dorahai["dora"]["enable"]
        let uradorahai = _dorahai["uradora"]["enable"]
        return {
            "bakaze": bakaze,
            "jikaze": jikaze,
            "yakuhai": {
                "richi": richi,
                "ippatsu": ippatsu,
                "chankan": chankan,
                "rinshan": rinshan,
                "haitei": haitei,
                "tenho": tenho
            },
            "dora": dorahai,
            "uradora": uradorahai,
            "kyotaku": {
                "tsumibo": tsumibo,
                "richibo": richibo
            }
        }
    }

    static hora(_tehai: number[], __furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}, tsumohai: number, ronhai: number | null, param: Types.hora_info){
        let tehai = _tehai.slice()
        
        let hora: "ron"|"tsumo" = "ron"
        if(ronhai === null) hora = "tsumo"
        let max :Types.point = {yakuhai: [], fu: 0, hansu: 0, yakuman: 0, point: 0, bumpai: [], hora: hora}

        let _furo: number[][] = []
        _furo = JSON.parse(JSON.stringify(__furo))
        let furo: number[][] = []
        if(_furo !== undefined){
            furo = _furo.filter(n => n.length !== 0)
        }

        let junhai: {[key in Types.junhai_type]: number[]} = {"m": [], "p": [], "s": [], "j": []}
        junhai["m"] = junhai["m"].concat(_junhai["m"])
        junhai["p"] = junhai["p"].concat(_junhai["p"])
        junhai["s"] = junhai["s"].concat(_junhai["s"])
        junhai["j"] = junhai["j"].concat(_junhai["j"])

        if(Shanten.shanten(furo, junhai, tsumohai) <= 0){
            const tp = Shanten.tenpai(furo, junhai, null)
            if(tp !== null){
                if(!tp.includes(tsumohai)) return max
            }else{
                return max
            }
        }else  return max
        
        if(typeof tsumohai === "number"){
            const s = Math.floor(tsumohai / 100) % 10
            const n = Math.floor(tsumohai / 10) % 10
        
            switch(s){
                case 1:
                    junhai["m"][n] += 1
                    if(n === 0) junhai["m"][5] += 1
                    break;
                case 2:
                    junhai["p"][n] += 1
                    if(n === 0) junhai["p"][5] += 1
                    break;
                case 3:
                    junhai["s"][n] += 1
                    if(n === 0) junhai["s"][5] += 1
                    break;
                case 4:
                    junhai["j"][n] += 1
                    break;
            }
        }

        let pre_yakuhai = this.get_pre_yakuhai(param.yakuhai)
        let allfuro: number[] = []
        for(let p of furo){
            allfuro = allfuro.concat(p)
        }
        const alltehai = tehai.concat(allfuro)
        let post_yakuhai = this.get_post_yakuhai(alltehai, param.dora, param.uradora)

        for(let mentsu of this.hora_mentsu(furo, junhai, tsumohai, ronhai)){
            let hudi = this.get_hudi(mentsu, param.bakaze, param.jikaze)
            let yakuhai = this.get_yakuhai(mentsu, hudi, pre_yakuhai, post_yakuhai)
            let rv = this.get_point(hudi.fu, yakuhai, ronhai, param, hora)

            if(! max || rv.point > max.point || rv.point == max.point && (! rv.hansu || rv.hansu > max.hansu || rv.hansu == max.hansu && rv.fu > max.fu)) max = rv
        }
        return max
    }

    private static get_point(fu: number, yakuhai: Types.yakuhai, _ronhai: number | null, param: Types.hora_info, hora: "ron"|"tsumo"): Types.point{
        if(yakuhai.length == 0) return {yakuhai: [], fu: 0, hansu: 0, yakuman: 0, point: 0, bumpai: [], hora: hora}

        let ronhai: string | null = null
        if(_ronhai !== null) ronhai = this.toStrMentsu([[_ronhai]])[0]

        let jikaze = param.jikaze
        let hansu: number = 0,
            yakuman: number = 0,
            point: number = 0,
            base: number = 0,
            hojusha: number = 0,
            point2: number = 0,
            base2: number = 0,
            hojusha2: number | null = null
        let new_fu: number | null = fu

        if(yakuhai[0].hansu == "*" || yakuhai[0].hansu == "**"){
            new_fu = null
            yakuman = yakuhai.map(h =>
                {
                    if(typeof h.hansu !== "number") return h.hansu.length
                    else return 0
                }).reduce((x, y) => x + y)
            base = 8000 * yakuman

            let h = yakuhai.find(h => h.hojusha)
            if(h){
                if(h.hojusha !== null && (h.hojusha === "+" || h.hojusha === "=" || h.hojusha === "-")){
                    hojusha2 = (jikaze + {"+": 1, "=": 2, "-": 3}[h.hojusha]) % 4
                    base2 = 8000 * (typeof h.hansu !== "number" ? h.hansu.length : 0)
                }
            }
        }else{
            hansu = yakuhai.map(h => 
                {
                    if(typeof h.hansu === "number") return h.hansu
                    else return 0
                }).reduce((x, y) => x + y)
            base = (hansu >= 13) ? 8000
                    : (hansu >= 11) ? 6000
                    : (hansu >= 8) ? 4000
                    : (hansu >= 6) ? 3000
                    : Math.min(fu << (2 + hansu), 2000)
        }
        
        let bumpai = [0, 0, 0, 0]
        let tsumi = param.kyotaku.tsumibo
        let richi = param.kyotaku.richibo

        if(hojusha2 != null){
            if(ronhai) base2 = base2 / 2
            base = base - base2
            point2 = base2 * (jikaze == 0 ? 6 : 4)
            bumpai[jikaze] += point2
            bumpai[hojusha2] -= point2
        }else{
            point2 = 0
        }

        if(ronhai || base == 0){
            if(base == 0 && hojusha2 != null){
                hojusha = hojusha2
            }else{
                if(ronhai){
                    if(ronhai[2] === "+" || ronhai[2] === "=" || ronhai[2] === "-"){
                        hojusha = (jikaze + {"+": 1, "=": 2, "-": 3}[ronhai[2]]) % 4
                    }
                }
            }
            point = Math.ceil(base * (jikaze == 0 ? 6 : 4) / 100) * 100
            bumpai[jikaze] += point + tsumi * 300 + richi * 1000
            bumpai[hojusha] -= point + tsumi * 300
        }else{
            let oya = Math.ceil(base * 2 / 100) * 100
            let ko = Math.ceil(base / 100) * 100
            if(jikaze == 0){
                point = oya * 3
                for(let l = 0; l < 4; l++){
                    if(l == jikaze) bumpai[l] += point + tsumi * 300 + richi * 1000
                    else bumpai[l] -= oya + tsumi * 100
                }
            }else{
                point = oya + ko * 2
                for(let l = 0; l < 4; l++){
                    if(l == jikaze) bumpai[l] += point + tsumi * 300 + richi * 1000
                    else if(l == 0) bumpai[l] -= oya + tsumi * 100
                    else bumpai[l] -= ko + tsumi * 100
                }
            }
        }

        return {
            yakuhai: yakuhai,
            fu: fu,
            hansu: hansu,
            yakuman: yakuman,
            point: point + point2,
            bumpai: bumpai,
            hora: hora
        }
    }

    private static get_post_yakuhai(tehai: number[], dorahai: number[], uradorahai: number[]): Types.yakuhai{
        let post_yakuhai = []

        let n_dorahai = 0
        for(let p of dorahai){
            p = this.shindorahai(p)
            for(let m of tehai){
                if(m != p) continue
                n_dorahai ++
            }
        }
        if(n_dorahai) post_yakuhai.push({name: "ドラ", hansu: n_dorahai, hojusha: null})

        let n_akadorahai = 0
        for(let m of tehai){
            if(m % 100 != 0) continue
            n_akadorahai ++
        }
        if(n_akadorahai) post_yakuhai.push({name: "赤ドラ", hansu: n_akadorahai, hojusha: null})

        let n_uradorahai = 0
        for(let p of uradorahai || []){
            p = this.shindorahai(p)
            for(let m of tehai){
                if(m != p) continue
                n_uradorahai ++
            }
        }
        if(n_uradorahai) post_yakuhai.push({name: "裏ドラ", hansu: n_uradorahai, hojusha: null})

        return post_yakuhai
    }

    private static get_yakuhai(mentsu: number[][], hudi: Types.hudi, pre_yakuhai: Types.yakuhai, post_yakuhai: Types.yakuhai): Types.yakuhai{
        
        const str_mentsu = this.toStrMentsu(mentsu)

        let yakuman: Types.yakuhai = (pre_yakuhai.length > 0 && (pre_yakuhai[0].hansu == "*" || pre_yakuhai[0].hansu == "**"))
                                        ? pre_yakuhai : []
        yakuman = yakuman
                    .concat(kokushimuso())
                    .concat(suanko())
                    .concat(daisangen())
                    .concat(sushiho())
                    .concat(tsuiso())
                    .concat(ryuiso())
                    .concat(chinroto())
                    .concat(sukantsu())
                    .concat(churempoto())

        if(yakuman.length > 0) return yakuman

        let yakuhai: Types.yakuhai = pre_yakuhai
                                        .concat(menzenchintsumoho())
                                        .concat(kazehai())
                                        .concat(pinfu())
                                        .concat(tanyaochu())
                                        .concat(ipeko())
                                        .concat(sanshokudojun())
                                        .concat(ikkitsukan())
                                        .concat(honchantaiyaochu())
                                        .concat(chitoitsu())
                                        .concat(toitoiho())
                                        .concat(sananko())
                                        .concat(sankantsu())
                                        .concat(sanshokudoko())
                                        .concat(honroto())
                                        .concat(shosangen())
                                        .concat(honitsu())
                                        .concat(junchantaiyaochu())
                                        .concat(ryampeiko())
                                        .concat(chinitsu())

        if(yakuhai.length > 0) yakuhai = yakuhai.concat(post_yakuhai)
        
        return yakuhai
        
        function churempoto(): Types.yakuhai{
            if(str_mentsu.length != 1) return []
            if(str_mentsu[0].match(/^[mpsj]1112345678999/))
                return [{name: "純正九蓮宝燈", hansu: "**", hojusha: null}]
            else return [{name: "九蓮宝燈", hansu: "*", hojusha: null}]
        }
    
        function sukantsu(): Types.yakuhai{
            if(hudi.n_kantsu == 4) return [{name: "四槓子", hansu: "*", hojusha: null}]
            return []
        }
    
        function chinroto(): Types.yakuhai{
            if(hudi.n_kotsu == 4 && hudi.n_yaochu == 5 && hudi.n_jihai == 0)
                return [{name: "清老頭", hansu: "*", hojusha: null}]
            return []
        }
    
        function ryuiso(): Types.yakuhai{
            if(str_mentsu.filter(m => m.match(/^[mp]/)).length > 0) return []
            if(str_mentsu.filter(m => m.match(/^j[^6]/)).length > 0) return []
            if(str_mentsu.filter(m => m.match(/^s.*[1579]/)).length > 0) return []
            return [{name: "緑一色", hansu: "*", hojusha: null}]
        }
    
        function tsuiso(): Types.yakuhai{
            if(hudi.n_jihai == str_mentsu.length)
                return [{name: "字一色", hansu: "*", hojusha: null}]
            return []
        }
    
        function sushiho(): Types.yakuhai{
            const kotsu = hudi.kotsu
            if(kotsu.j[1] + kotsu.j[2] + kotsu.j[3] + kotsu.j[4] == 4){
                let hoju_mentsu = str_mentsu.filter(m =>
                                    m.match(/^j([1234])\1\1(?:[\+\=\-]|\1)(?!\!)/))
                let hojusha = (hoju_mentsu[3] && hoju_mentsu[3].match(/[\+\=\-]/))
                if(hojusha) return [{name: "大四喜", hansu: "**", hojusha: hojusha[0]}]
                else return [{name: "大四喜", hansu: "**", hojusha: null}]
            }
            if(kotsu.j[1] + kotsu.j[2] + kotsu.j[3] + kotsu.j[4] == 3
                    && str_mentsu[0].match(/^j[1234]/))
                        return [{name: "小四喜", hansu: "*", hojusha: null}]
            return []
        }
    
        function daisangen(): Types.yakuhai{
            const kotsu = hudi.kotsu
            if(kotsu.j[5] + kotsu.j[6] + kotsu.j[7] == 3){
                let hoju_mentsu = str_mentsu.filter(m =>
                                    m.match(/^j([567])\1\1(?:[\+\=\-]|\1)(?!\!)/))
                let hojusha = (hoju_mentsu[2] && hoju_mentsu[2].match(/[\+\=\-]/))
                if(hojusha) return [{name: "大三元", hansu: "*", hojusha: hojusha[0]}]
                else return [{name: "大三元", hansu: "*", hojusha: null}]
            }
            return []
        }
    
        function suanko(): Types.yakuhai{
            if(hudi.n_ankotsu != 4) return []
            if(hudi.tanki) return [{name: "四暗刻単騎", hansu: "**", hojusha: null}]
            else return [{name: "四暗刻", hansu: "*", hojusha: null}]
        }
    
        function kokushimuso(): Types.yakuhai{
            if(str_mentsu.length != 13) return []
            if(hudi.tanki) return [{name: "国士無双十三面", hansu: "**", hojusha: null}]
            else return [{name: "国士無双", hansu: "*", hojusha: null}]
        }
    
        function chinitsu(): Types.yakuhai{
            for(let s of ["m", "p", "s"]){
                const yise = new RegExp(`^[j${s}]`)
                if(str_mentsu.filter(m=>m.match(yise)).length == str_mentsu.length
                    && hudi.n_jihai == 0)
                    return [{name: "清一色", hansu: (hudi.menzen ? 6 : 5), hojusha: null}]
            }
            return []
        }
    
        function ryampeiko(): Types.yakuhai{
            if(!hudi.menzen) return[]
            const shuntsu = hudi.shuntsu
            let beikou = shuntsu.m.concat(shuntsu.p).concat(shuntsu.s)
                            .map(x=>x>>1).reduce((a,b)=>a+b)
            if(beikou == 2) return [{name: "二盃口", hansu: 3, hojusha: null}]
            return []
        }
    
        function junchantaiyaochu(): Types.yakuhai{
            if(hudi.n_yaochu == 5 && hudi.n_shuntsu > 0 && hudi.n_jihai == 0)
                return [{name: "純全帯幺九", hansu: (hudi.menzen ? 3 : 2), hojusha: null}]
            return []
        }
    
        function honitsu(): Types.yakuhai{
            for(let s of ["m", "p", "s"]){
                const yise = new RegExp(`^[j${s}]`)
                if(str_mentsu.filter(m=>m.match(yise)).length == str_mentsu.length
                    && hudi.n_jihai > 0)
                        return [{name: "混一色", hansu: (hudi.menzen ? 3 : 2), hojusha: null}]
            }
            return []
        }
    
        function shosangen(): Types.yakuhai{
            const kotsu = hudi.kotsu
            if(kotsu.j[5] + kotsu.j[6] + kotsu.j[7] == 2
                && str_mentsu[0].match(/^j[567]/))
                    return [{name: "小三元", hansu: 2, hojusha: null}]
            return []
        }
    
        function honroto(): Types.yakuhai{
            if(str_mentsu.length != 13 && hudi.n_yaochu == str_mentsu.length
                && hudi.n_shuntsu == 0 && hudi.n_jihai > 0)
                    return [{name: "混老頭", hansu: 2, hojusha: null}]
            return []
        }
    
        function sanshokudoko(): Types.yakuhai{
            const kotsu = hudi.kotsu
            for(let n = 1; n <= 9; n++){
                if(kotsu.m[n] && kotsu.p[n] && kotsu.s[n])
                    return [{name: "三色同刻", hansu: 2, hojusha: null}]
            }
            return []
        }
    
        function sankantsu(): Types.yakuhai{
            if(hudi.n_kantsu == 3)
                return [{name: "三槓子", hansu: 2, hojusha: null}]
            return []
        }
    
        function sananko(): Types.yakuhai{
            if(hudi.n_ankotsu == 3)
                return [{name: "三暗刻", hansu: 2, hojusha: null}]
            return []
        }
    
        function toitoiho(): Types.yakuhai{
            if(hudi.n_kotsu == 4)
                return [{name: "対々和", hansu: 2, hojusha: null}]
            return []
        }
    
        function chitoitsu(): Types.yakuhai{
            if(str_mentsu.length == 7)
                return [{name: "七対子", hansu: 2, hojusha: null}]
            return []
        }
    
        function honchantaiyaochu(): Types.yakuhai{
            if(hudi.n_yaochu == 5 && hudi.n_shuntsu > 0 && hudi.n_jihai > 0)
                return [{name: "混全帯幺九", hansu: (hudi.menzen ? 2 : 1), hojusha: null}]
            return []
        }
    
        function ikkitsukan(): Types.yakuhai{
            const shuntsu = hudi.shuntsu
            for(const [s, number] of Object.entries(shuntsu)){
                if(number[1] && number[4] && number[7])
                    return [{name: "一気通貫", hansu: (hudi.menzen ? 2 : 1), hojusha: null}]
            }
            return []
        }
    
        function sanshokudojun(): Types.yakuhai{
            const shuntsu = hudi.shuntsu
            for(let n = 1; n <= 7; n++){
                if(shuntsu.m[n] && shuntsu.p[n] && shuntsu.s[n])
                    return [{name: "三色同順", hansu: (hudi.menzen ? 2 : 1), hojusha: null}]
            }
            return []
        }
    
        function ipeko(): Types.yakuhai{
            if(!hudi.menzen) return []
            const shuntsu = hudi.shuntsu
            let beikou = shuntsu.m.concat(shuntsu.p).concat(shuntsu.s)
                            .map(x=>x>>1).reduce((a,b)=>a+b)
            if(beikou == 1)
                return [{name: "一盃口", hansu: 1, hojusha: null}]
            return []
        }
    
        function tanyaochu(): Types.yakuhai{
            if(hudi.n_yaochu == 0)
                return [{name: "断幺九", hansu: 1, hojusha: null}]
            return []
        }
    
        function pinfu(): Types.yakuhai{
            if(hudi.pinfu)
                return [{name: "平和", hansu: 1, hojusha: null}]
            return []
        }
    
        function kazehai(): Types.yakuhai{
            let kaze = ["東", "南", "西", "北"]
            let kazehai_all = []
            if(hudi.kotsu.j[hudi.bakaze+1])
                kazehai_all.push({name: "場風 " + kaze[hudi.bakaze], hansu: 1, hojusha: null})
            if(hudi.kotsu.j[hudi.jikaze+1])
                kazehai_all.push({name: "自風 " + kaze[hudi.jikaze], hansu: 1, hojusha: null})
            if(hudi.kotsu.j[5]) kazehai_all.push({name: "翻牌 白", hansu: 1, hojusha: null})
            if(hudi.kotsu.j[6]) kazehai_all.push({name: "翻牌 發", hansu: 1, hojusha: null})
            if(hudi.kotsu.j[7]) kazehai_all.push({name: "翻牌 中", hansu: 1, hojusha: null})
            return kazehai_all
        }
    
        function menzenchintsumoho(): Types.yakuhai{
            if(hudi.menzen && hudi.tsumo)
                return [{name: "門前清自摸和", hansu: 1, hojusha: null}]
            return []
        }
    }

    private static get_pre_yakuhai(yakuhai: {[key in Types.yakuhai_type]: number | boolean}): Types.yakuhai{
        let pre_yakuhai: Types.yakuhai = []

        if(yakuhai.richi == 1) pre_yakuhai.push({name: "立直", hansu: 1, hojusha: null})
        if(yakuhai.richi == 2) pre_yakuhai.push({name: "ダブル立直", hansu: 2, hojusha: null})
        if(yakuhai.ippatsu) pre_yakuhai.push({name: "一発", hansu: 1, hojusha: null})
        if(yakuhai.haitei == 1) pre_yakuhai.push({name: "海底摸月", hansu: 1, hojusha: null})
        if(yakuhai.haitei == 2) pre_yakuhai.push({name: "河底撈魚", hansu: 1, hojusha: null})
        if(yakuhai.rinshan) pre_yakuhai.push({name: "嶺上開花", hansu: 1, hojusha: null})
        if(yakuhai.chankan) pre_yakuhai.push({name: "槍槓", hansu: 1, hojusha: null})

        if(yakuhai.tenho == 1) pre_yakuhai = [{name: "天和", hansu: "*", hojusha: null}]
        if(yakuhai.tenho == 2) pre_yakuhai = [{name: "地和", hansu: "*", hojusha: null}]
        
        return pre_yakuhai
    }

    private static get_hudi(mentsu: number[][], bakaze: Types.kaze_number, jikaze: Types.kaze_number): Types.hudi{

        const str_mentsu = this.toStrMentsu(mentsu)

        const re_tsumo = /[\+\=\-]\!/
        const re_menzen = /[\+\=\-](?!\!)/

        const re_tanki = /^[mpsj](\d)\1[\+\=\-\_]\!$/

        const re_yaochu = /^.*[j19].*$/
        const re_jihai = /^j.*$/

        const re_dorahai = new RegExp(`^j${bakaze+1}.*$`)
        const re_uradorahai = new RegExp(`^j${jikaze+1}.*$`)
        const re_sangempai = /^j[567].*$/

        const re_kotsu = /^[mpsj](\d)\1\1.*$/
        const re_ankotsu = /^[mpsj](\d)\1\1(?:\1|_\!)?$/
        const re_kantsu = /^[mpsj](\d)\1\1.*\1.*$/

        const re_kanchan = /^[mps]\d\d[\+\=\-\_]\!\d$/
        const re_penchan = /^[mps](123[\+\=\-\_]\!|7[\+\=\-\_]\!89)$/

        let hudi: Types.hudi = {
            fu: 20,
            menzen: true,
            tsumo: true,
            shuntsu: {
                m: [0,0,0,0,0,0,0,0],
                p: [0,0,0,0,0,0,0,0],
                s: [0,0,0,0,0,0,0,0],
            },
            kotsu: {
                m: [0,0,0,0,0,0,0,0,0,0],
                p: [0,0,0,0,0,0,0,0,0,0],
                s: [0,0,0,0,0,0,0,0,0,0],
                j: [0,0,0,0,0,0,0,0]
            },
            n_shuntsu: 0,
            n_kotsu: 0,
            n_ankotsu: 0,
            n_kantsu: 0,
            n_yaochu: 0,
            n_jihai: 0,
            tanki: false,
            pinfu: false,
            bakaze: bakaze,
            jikaze: jikaze
        }

        for(let m of str_mentsu){
            if(m.match(re_tsumo)) hudi.tsumo = false
            if(m.match(re_menzen)) hudi.menzen = false

            if(str_mentsu.length == 1) continue

            if(m.match(re_tanki)) hudi.tanki = true

            if(str_mentsu.length == 13) continue

            if(m.match(re_yaochu)) hudi.n_yaochu++
            if(m.match(re_jihai)) hudi.n_jihai++

            if(str_mentsu.length != 5) continue

            if(m == str_mentsu[0]){
                let fu = 0
                if(m.match(re_dorahai)) fu += 2
                if(m.match(re_uradorahai)) fu += 2
                if(m.match(re_sangempai)) fu += 2
                hudi.fu += fu
                if(hudi.tanki) hudi.fu += 2
            }else if(m.match(re_kotsu)){
                hudi.n_kotsu++
                let fu = 2
                if(m.match(re_yaochu)) fu *= 2
                if(m.match(re_ankotsu)) {
                    fu *= 2
                    hudi.n_ankotsu++
                }
                if(m.match(re_kantsu)){
                    fu *= 4
                    hudi.n_kantsu++
                }
                hudi.fu += fu
                if(m[0] == "m") hudi.kotsu["m"][Number(m[1])]++
                else if(m[0] == "p") hudi.kotsu["p"][Number(m[1])]++
                else if(m[0] == "s") hudi.kotsu["s"][Number(m[1])]++
                else if(m[0] == "j") hudi.kotsu["j"][Number(m[1])]++
            }else{
                hudi.n_shuntsu++
                if(m.match(re_kanchan)) hudi.fu += 2
                if(m.match(re_penchan)) hudi.fu += 2
                if(m[0] == "m") hudi.shuntsu["m"][Number(m[1])]++
                else if(m[0] == "p") hudi.shuntsu["p"][Number(m[1])]++
                else if(m[0] == "s") hudi.shuntsu["s"][Number(m[1])]++
            }
        }

        if(str_mentsu.length == 7){
            hudi.fu = 25
        }else if(str_mentsu.length == 5){
            hudi.pinfu = (hudi.menzen && hudi.fu == 20)
            if(hudi.tsumo){
                if(!hudi.pinfu) hudi.fu += 2
            }else{
                if(hudi.menzen) hudi.fu += 10
                else if(hudi.fu = 20) hudi.fu = 30
            }
            hudi.fu = Math.ceil(hudi.fu / 10) * 10
        }

        return hudi
    }

    private static hora_mentsu(furo: number[][], junhai: {[key in Types.junhai_type]: number[]}, tsumohai: number | number[], ronhai: number | null): number[][][]{
        let mentsu: number[][][] = []
        
        if(!tsumohai) return []
        if(Array.isArray(tsumohai)){
            return []
        }

        let horahai: number
        if(ronhai !== null){
            if(ronhai % 100 == 0){
                ronhai += 50
            }
            horahai = ronhai
        }else{
            if(tsumohai % 100 == 0){
                tsumohai += 50
            }
            horahai = tsumohai + 5//??
        }

        return mentsu
        .concat(this.hora_mentsu_ippan(furo, junhai, horahai))
        .concat(this.hora_mentsu_chitoi(furo, junhai, horahai))
        .concat(this.hora_mentsu_kokushi(furo, junhai, horahai))
        .concat(this.hora_mentsu_churen(furo, junhai, horahai))
    }

    private static hora_mentsu_churen(furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}, horahai: number): number[][][]{
        if(furo.length > 0) return []

        let s = Math.floor(horahai / 100) % 10
        if(s == 4) return []

        let mentsu: number[] = []
        let junhai: number[] = []
        if(s == 3) junhai = _junhai["s"]
        else if(s == 2) junhai = _junhai["p"]
        else if(s == 1) junhai = _junhai["m"]
        if(junhai == []) return []

        for(let n = 1; n <= 9; n++){
            if((n == 1 || n == 9) && junhai[n] < 3) return []
            if(junhai[n] == 0) return []
            let n_hai = (n == Math.floor(horahai / 10) % 10) ? junhai[n] - 1 : junhai[n]
            for(let i = 0; i < n_hai; i++){
                mentsu.push((n * 10) + (s * 100))
            }
        }
        if(mentsu.length != 13) return []
        mentsu.push(horahai + 1000)
        return [[mentsu]]
    }

    private static hora_mentsu_kokushi(furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}, horahai: number): number[][][]{
        if(furo.length > 0) return []

        let mentsu: number[][][] = [[]]
        let n_toitsu = 0

        for(const [s, junhai] of Object.entries(_junhai)){
            let sn
            if(s === "m") sn = 1
            else if(s === "p") sn = 2
            else if(s === "s") sn = 3
            else sn = 4
            let nn = (s == "j") ? [1,2,3,4,5,6,7] : [1,9]
            for(let n of nn){
                if(junhai[n] == 2){
                    let m: number[] = (n == Math.floor(horahai / 10) % 10) 
                        ? [(sn * 100) + (n * 10), (sn * 100) + (n * 10) + 1000]
                        : [(sn * 100) + (n * 10), (sn * 100) + (n * 10)]
                    mentsu[0].unshift(m)
                    n_toitsu++
                }
                else if(junhai[n] == 1){
                    let m: number[] = (n == Math.floor(horahai / 10) % 10)
                        ? [(sn * 100) + (n * 10) + 1000]
                        : [(sn * 100) + (n * 10)]
                    mentsu[0] = mentsu[0].concat(m)
                }
                else return[]
            }
        }
        return (n_toitsu == 1) ? mentsu : []
    }

    private static hora_mentsu_chitoi(furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}, horahai: number): number[][][]{
        if(furo.length > 0) return []
        
        let mentsu: number[][][] = [[]]

        for(const [s, junhai] of Object.entries(_junhai)){
            let sn
            if(s === "m") sn = 1
            else if(s === "p") sn = 2
            else if(s === "s") sn = 3
            else sn = 4
            for(let n = 1; n < junhai.length; n++){
                if(junhai[n] == 0) continue
                if(junhai[n] == 2){
                    let m: number[] = (n == Math.floor(horahai / 10) % 10)
                        ? [(sn * 100) + (n * 10), (sn * 100) + (n * 10) + 1000]
                        : [(sn * 100) + (n * 10), (sn * 100) + (n * 10)]
                    mentsu[0].push(m)
                }
                else return []
            }
        }
        return (mentsu[0].length == 7) ? mentsu : []
    }

    private static hora_mentsu_ippan(furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}, horahai: number): number[][][]{
        let mentsu: number[][][] = []

        for(const [s, junhai] of Object.entries(_junhai)){
            let sn
            if(s === "m") sn = 1
            else if(s === "p") sn = 2
            else if(s === "s") sn = 3
            else sn = 4
            for(let n = 1; n < junhai.length; n++){
                if(junhai[n] < 2) continue
                junhai[n] -= 2
                let jantohai: number[] = [(sn * 100) + (n * 10), (sn * 100) + (n * 10)]
                for(let mm of this.mentsu_all(furo, _junhai)){
                    mm.unshift(jantohai)
                    if(mm.length != 5) continue
                    mentsu = mentsu.concat(this.add_horahai(mm, horahai))
                }
                junhai[n] += 2
            }
        }
        return mentsu
    }

    private static add_horahai(mentsu: number[][], p: number): number[][][]{
        let new_mentsu: number[][][] = []

        for(let j = 0; j < mentsu.length; j++){
            for(let i = 0; i < mentsu[j].length; i++){
                if(Math.floor(mentsu[j][i] / 1) % 10 != 0) continue
                if(i > 0 && mentsu[j][i] == mentsu[j][i-1]) continue
                let m = mentsu[j][i]
                if(Math.floor(mentsu[j][i] / 100) % 10 == Math.floor(p / 100) % 10){
                    if(Math.floor(mentsu[j][i] / 10) % 10 == Math.floor(p / 10) % 10){
                        m = mentsu[j][i] + 1000 + Math.floor(p / 1) % 10
                    }
                }
                if(m == mentsu[j][i]) continue
                let tmp_mentsu: number[][] = mentsu.concat()
                tmp_mentsu[j][i] = m
                new_mentsu.push(tmp_mentsu)
            }
        }

        return new_mentsu
    }

    private static mentsu_all(_furo: number[][], _junhai: {[key in Types.junhai_type]: number[]}): number[][][]{
        let shupai_all: number[][][] = [[[]]]
        for(const [s, junhai] of Object.entries(_junhai)){
            if(s == "j") continue
            let new_mentsu = []
            let cache: number[][] = []
            for(let mm of shupai_all){
                cache = mm
                for(let nn of this.mentsu(s, junhai)){
                    cache = cache.concat([nn])
                }
                new_mentsu.push(cache)
            }
            shupai_all = new_mentsu
        }
        

        let jihai: number[] = []
        for(let n = 1; n <= 7; n++){
            if(_junhai["j"][n] == 0) continue
            if(_junhai["j"][n] != 3) return []
            jihai.push(400 + (n * 10), 400 + (n * 10), 400 + (n * 10))
        }

        let furo: number[][] = []
        for(let [key, value] of Object.entries(_furo)){
            value.map(m => {
                if(m % 100 == 0) m += 50
            })
            furo[Number(key)] = value
        }
        
        let map = shupai_all.map(shupai => shupai.concat([jihai]).concat(furo))
        if(map[0] !== undefined){
            map = [map[0].filter(n => n.length !== 0)]
        }
        return map
    }

    private static mentsu(s: string, junhai: number[], n = 1): number[][]{
        if(n > 9) return [[]]

        if(junhai[n] == 0) return this.mentsu(s, junhai, n+1)

        let sn: number = 0
        switch(s){
            case "m":
                sn = 100
                break;
            case "p":
                sn = 200
                break;
            case "s":
                sn = 300
                break;
            case "j":
                sn = 400
                break;
        }
        if(sn == 0) return []

        let shuntsu: number[][] = []
        if(n <= 7 && junhai[n] > 0 && junhai[n+1] > 0 && junhai[n+2] > 0){
            junhai[n]--
            junhai[n+1]--
            junhai[n+2]--
            shuntsu = this.mentsu(s, junhai, n)
            junhai[n]++
            junhai[n+1]++
            junhai[n+2]++

            //for(let s_mentsu of shuntsu){
            //    s_mentsu.unshift(sn + (n * 10), sn + ((n + 1) * 10), sn + ((n + 2) * 10))
            //}
            shuntsu.unshift([sn + (n * 10), sn + ((n + 1) * 10), sn + ((n + 2) * 10)])
        }

        let kotsu: number[][] = []
        if(junhai[n] >= 3){
            junhai[n] -= 3
            kotsu = this.mentsu(s, junhai, n)
            junhai[n] += 3
            //for(let k_mentsu of kotsu){
            //    k_mentsu.unshift(sn + (n * 10), sn + (n * 10), sn + (n * 10))
            //}
            kotsu.unshift([sn + (n * 10), sn + (n * 10), sn + (n * 10)])
        }
        let new_mentsu = shuntsu.concat(kotsu)
        if(new_mentsu !== undefined){
            new_mentsu = new_mentsu.filter(n => n.length !== 0)
        }
        return new_mentsu
    }

    private static shindorahai(p: number): number{
        const num = Math.floor(p / 10) % 10
        const s = Math.floor(p / 100) % 10
        let new_num = 0
        if(s !== 4){
            if(num === 0){
                new_num = 6
            }else if(num === 9){
                new_num = 1
            }else{
                new_num = num + 1
            }
        }else{
            if(num === 7){
                new_num = 1
            }else{
                new_num = num + 1
            }
        }

        return (s * 100) + (new_num * 10)
    }

    private static toStrMentsu(mentsu: number[][]): string[]{
        let str_mentsu: string[] = []
        for(const [key, m] of Object.entries(mentsu)){
            let info = {
                kami: false,
                toimen: false,
                simo: false,
                tsumo: false,
                horahai: false
            }
            let str_p = ""
            for(const [key, p] of Object.entries(m)){
                const sn = Math.floor(p / 100) % 10
                if(key == "0"){
                    if(sn == 1) str_p += "m"
                    else if(sn == 2) str_p += "p"
                    else if(sn == 3) str_p += "s"
                    else if(sn == 4) str_p += "j"
                }

                const num = Math.floor(p / 10) % 10
                str_p += num

                const n_info = Math.floor(p / 1) % 10
                const h_info = Math.floor(p / 1000) % 10
                if(n_info == 1) info.kami = true
                else if(n_info == 2) info.toimen = true
                else if(n_info == 3) info.simo = true
                if(n_info == 5) info.tsumo = true
                if(h_info == 1) info.horahai = true
            }
            if(info.kami) str_p += "+"
            else if(info.toimen) str_p += "="
            else if(info.simo) str_p += "-"
            if(info.tsumo) str_p += "_"
            if(info.horahai) str_p += "!"
            
            str_mentsu[Number(key)] = str_p
        }
        return str_mentsu
    }
}