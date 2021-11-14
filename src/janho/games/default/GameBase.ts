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

import * as janho from "../../Server"
import { kaze_number, ryukyoku } from "../../utils/Types"
import { PlayerJoinEvent } from "../../event/game/PlayerJoinEvent"
import { PlayerReadyEvent } from "../../event/game/PlayerReadyEvent"
import { PlayerLoadedEvent } from "../../event/game/PlayerLoadedEvent"
import { GameStartEvent } from "../../event/game/GameStartEvent"
import { GameRestartEvent } from "../../event/game/GameRestartEvent"
import { PlayerQuitEvent } from "../../event/game/PlayerQuitEvent"
import { PlayerDeadEvent } from "../../event/game/PlayerDeadEvent"
import { GameResetEvent } from "../../event/game/GameResetEvent"
import { TsumoEvent } from "../../event/game/mahjong/TsumoEvent"
import { DahaiEvent } from "../../event/game/mahjong/DahaiEvent"
import { PonEvent } from "../../event/game/mahjong/PonEvent"
import { ChiEvent } from "../../event/game/mahjong/ChiEvent"
import { KanEvent } from "../../event/game/mahjong/KanEvent"
import { AnkanEvent } from "../../event/game/mahjong/AnkanEvent"
import { KakanEvent } from "../../event/game/mahjong/KakanEvent"
import { KantsumoEvent } from "../../event/game/mahjong/KantsumoEvent"
import { HoraEvent } from "../../event/game/mahjong/HoraEvent"
import { RichiEvent } from "../../event/game/mahjong/RichiEvent"
import { RyukyokuEvent } from "../../event/game/mahjong/RyukyokuEvent"
import { SkipEvent } from "../../event/game/mahjong/SkipEvent"
import { EndEvent } from "../../event/game/mahjong/EndEvent"
import { ShukyokuEvent } from "../../event/game/mahjong/ShukyokuEvent"
import { RyukyokuByPlayerEvent } from "../../event/game/mahjong/RyukyokuByPlayerEvent"

export abstract class GameBase{
    protected readonly server: janho.Server
    protected readonly roomId: string

    constructor(server: janho.Server, roomId: string){
        this.server = server
        this.roomId = roomId
    }

    public join(socketId: string){
        new PlayerJoinEvent(this.server.getEvent(), this.roomId, socketId).emit()
    }
    public ready(socketId: string, bool: boolean){
        new PlayerReadyEvent(this.server.getEvent(), this.roomId, socketId, bool).emit()
    }
    public loaded(socketId: string){
        new PlayerLoadedEvent(this.server.getEvent(), this.roomId, socketId).emit()
    }
    public start(){
        new GameStartEvent(this.server.getEvent(), this.roomId).emit()
    }
    public restart(){
        new GameRestartEvent(this.server.getEvent(), this.roomId).emit()
    }
    public quit(socketId: string){
        new PlayerQuitEvent(this.server.getEvent(), this.roomId, socketId).emit()
    }
    public dead(socketId: string){
        new PlayerDeadEvent(this.server.getEvent(), this.roomId, socketId).emit()
    }
    public reset(){
        new GameResetEvent(this.server.getEvent(), this.roomId).emit()
    }
    public onTsumo(kaze: kaze_number){
        new TsumoEvent(this.server.getEvent(), this.roomId, kaze).emit()
    }
    public onDahai(kaze: kaze_number, dahaiHai: number, isRichi: boolean){
        new DahaiEvent(this.server.getEvent(), this.roomId, kaze, dahaiHai, isRichi).emit()
    }
    public onPon(kaze: kaze_number, furoHai: number, combi: number[]){
        new PonEvent(this.server.getEvent(), this.roomId, kaze, furoHai, combi).emit()
    }
    public onChi(kaze: kaze_number, furoHai: number, combi: number[]){
        new ChiEvent(this.server.getEvent(), this.roomId, kaze, furoHai, combi).emit()
    }
    public onKan(kaze: kaze_number, kanHai: number, combi: number[]){
        new KanEvent(this.server.getEvent(), this.roomId, kaze, kanHai, combi).emit()
    }
    public onAnkan(kaze: kaze_number, kanHai: number, combi: number[]){
        new AnkanEvent(this.server.getEvent(), this.roomId, kaze, kanHai, combi).emit()
    }
    public onKakan(kaze: kaze_number, kanHai: number, combi: number[]){
        new KakanEvent(this.server.getEvent(), this.roomId, kaze, kanHai, combi).emit()
    }
    public onKantsumo(kaze: kaze_number){
        new KantsumoEvent(this.server.getEvent(), this.roomId, kaze).emit()
    }
    public onHora(kaze: kaze_number, horaHai: number){
        new HoraEvent(this.server.getEvent(), this.roomId, kaze, horaHai).emit()
    }
    public onRichi(kaze: kaze_number, richiHai: number){
        new RichiEvent(this.server.getEvent(), this.roomId, kaze, richiHai).emit()
    }
    public onRyukyokuByPlayer(kaze: kaze_number, type: ryukyoku){
        new RyukyokuByPlayerEvent(this.server.getEvent(), this.roomId, kaze, type).emit()
    }
    public onRyukyoku(type: ryukyoku){
        new RyukyokuEvent(this.server.getEvent(), this.roomId, type).emit()
    }
    public onSkip(kaze: kaze_number){
        new SkipEvent(this.server.getEvent(), this.roomId, kaze).emit()
    }
    public onEnd(){
        new EndEvent(this.server.getEvent(), this.roomId).emit()
    }
    public onShukyoku(){
        new ShukyokuEvent(this.server.getEvent(), this.roomId).emit()
    }
}