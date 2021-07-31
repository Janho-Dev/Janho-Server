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

export class Hora {

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

    static hora(tehai: number[], tsumohai: number | number[], ronhai: number | null, param: Types.hora_info){
        let max

        let pre_yakuhai = this.get_pre_yakuhai(param.yakuhai)
        let post_yakuhai = this.get_post_yakuhai("?", param.dora, param.uradora)

        for(let mentsu of this.hora_mentsu(tsumohai, ronhai)){}
    }

    static get_point(fu: number, yakuhai: ["?"], ronhai: number, param: Types.hora_info){//TODO
    }

    static get_post_yakuhai(paistr: string, dorahai: number[], uradorahai: number[]){
    }

    static get_yakuhai(mentsu: ["?"], hudi: ["?"], post_yakuhai: ["?"]){//TODO
        function churempoto(){
        }
    
        function sukantsu(){
        }
    
        function chinroto(){
        }
    
        function ryuiso(){
        }
    
        function tsuiso(){
        }
    
        function sushiho(){
        }
    
        function daisangen(){
        }
    
        function suanko(){
        }
    
        function kokushimuso(){
        }
    
        function chinitsu(){
        }
    
        function ryampeiko(){
        }
    
        function junchantaiyaochu(){
        }
    
        function honitsu(){
        }
    
        function shosangen(){
        }
    
        function honroto(){
        }
    
        function sanshokudoko(){
        }
    
        function sankantsu(){
        }
    
        function sananko(){
        }
    
        function toitoiho(){
        }
    
        function chitoitsu(){
        }
    
        function honchantaiyaochu(){
        }
    
        function ikkitsukan(){
        }
    
        function sanshokudojun(){
        }
    
        function ipeko(){
        }
    
        function tanyaochu(){
        }
    
        function pinfu(){
        }
    
        function kazehai(){
        }
    
        function menzenchintsumoho(){
        }
    }

    static get_pre_yakuhai(yakuhai: {[key in Types.yakuhai_type]: number | boolean}): {name: string, hansu: number} | []{//TODO
        return []
    }

    static get_hudi(mentsu: ["?"], bakaze: Types.kaze_number, jikaze: Types.kaze_number){//TODO
    }

    static hora_mentsu(tsumohai: number | number[], ronhai: number | null): number[]{
        if(!tsumohai) return []
        if(Array.isArray(tsumohai)){
            //if(tsumohai.length > 2) return []
            return []
        }

        let horahai: number
        if(ronhai !== null){
            //replace 5 to 0
            horahai = ronhai
        //}else if(tsumohai !== []){
        }else{
            //replace 5 to 0
            horahai = tsumohai
        }

        return []
    }

    static hora_mentsu_churen(tehai: number[], horahai: number){
    }

    static hora_mentsu_kokushi(tehai: number[], horahai: number){
    }

    static hora_mentsu_chitoi(tehai: number[], horahai: number){
    }

    static hora_mentsu_ippan(tehai: number[], horahai: number){
    }

    static add_horahai(mentsu: ["?"], p: number){//TODO
    }

    static mentsu_all(tehai: number[]){
    }

    static mentsu(s: string, junhai: {[key in Types.junhai_type]: number[]}, n = 1){
    }
}