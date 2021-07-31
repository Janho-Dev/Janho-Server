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

export type kaze_number = 0 | 1 | 2 | 3
export type yama_type = "rinshan" | "tsumo"
export type yamahai_type = "hai"
export type dorahai_type = "hai" | "enable"
export type tehai_type = "hai" | "sute"
export type info_type = "bakaze" | "kyoku" | "homba" | "richi" | "yama"
export type richi_type = "bool" | "double" | "ippatu"
export type game_status = "wait" | "ready" | "game"
export type player_status = "wait" | "ready" | "loaded" | "game" | "dead"
export type dora_type = "dora" | "uradora"
export type junhai_type = "m" | "p" | "s" | "j"
export type hora_number = 0 | 1 | 2
export type yakuhai_type = "richi" | "ippatsu" | "chankan" | "rinshan" | "haitei" | "tenho"
export type kyotaku_type = "tsumibo" | "richibo"
export type level_type = "debug" | "info" | "notice" | "warning" | "error" | "success"
export type hora_info = {
    "bakaze": kaze_number, "jikaze": kaze_number, 
    "yakuhai": {"richi": hora_number, "ippatsu": boolean, "chankan": boolean, "rinshan": boolean, "haitei": hora_number, "tenho": hora_number}, 
    "dora": number[], "uradora": number[], 
    "kyotaku": {"tsumibo": number, "richibo": number}
}
export type log_id = ""
export type log_exception = {[key in log_id]: boolean}

export type hudi = {
    fu: number, menzen: boolean, tsumo: boolean,
    shuntsu: {m: number[], p: number[], s: number[]},
    kotsu: {m: number[], p: number[], s: number[], j: number[]},
    n_shuntsu: number, n_kotsu: number, n_ankotsu: number, n_kantsu: number, n_yaochu: number, n_jihai: number,
    tanki: boolean, pinfu: boolean, bakaze: kaze_number, jikaze: kaze_number
}

export type yakuhai = {name: string, hansu: number | "*" | "**", hojusha: string | null}[]

export type point = {
    yakuhai: yakuhai,
    fu: number,
    hansu: number,
    yakuman: number,
    point: number,
    bumpai: number[]
}

export type event =  "tsumo" | "dahai" | "furo" | "kan" | "kantsumo" | "hora" | "ryukyoku" | "shukyoku"
export type ryukyoku = "荒牌平局" | "九種九牌" | "四家立直" | "三家和" | "四風連打" | "四槓散了"

export type candidated = {[key in "chi" | "pon" | "kan" | "kakan"]: number[][]}
export type pre_candidate = {"junhai": {[key in junhai_type]: number[]}, "furo": number[][], "hai": number}