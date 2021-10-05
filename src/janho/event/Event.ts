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

import { kaze_number, ryukyoku } from "../utils/Types"
import {EventEmitter} from "./EventEmitter"
import {EventPort} from "./EventPort"

export class Event{
    private readonly emitter: EventEmitter

    private readonly _event: EventPort<() => void>

    //socket
    private readonly _socketEvent: EventPort<(socketId: string) => void>
    private readonly _socketConnectEvent: EventPort<(socketId: string) => void>
    private readonly _socketDisconnectEvent: EventPort<(socketId: string) => void>
    private readonly _socketReceiveEvent: EventPort<(socketId: string, data: string) => void>

    //server
    private readonly _serverEvent: EventPort<() => void>
    private readonly _serverStopEvent: EventPort<() => void>
    private readonly _serverPreLoadEvent: EventPort<() => void>
    private readonly _serverLoadEvent: EventPort<() => void>
    private readonly _serverEmitEvent: EventPort<(socketId: string, data: string) => void>
    private readonly _serverReceiveEvent: EventPort<(socketId: string, data: string) => void>
    private readonly _roomAddEvent: EventPort<(roomId: string, hosterId: string) => void>
    private readonly _roomDeleteEvent: EventPort<(roomId: string) => void>

    //plugin
    private readonly _pluginEvent: EventPort<() => void>
    private readonly _pluginPreLoadEvent: EventPort<() => void>
    private readonly _pluginLoadEvent: EventPort<() => void>
    private readonly _pluginPreUnloadEvent: EventPort<() => void>
    private readonly _pluginUnloadEvent: EventPort<() => void>
    private readonly _pluginEnableEvent: EventPort<(name: string, json: any) => void>
    private readonly _pluginDisableEvent: EventPort<(name: string, json: any) => void>

    //user
    private readonly _userEvent: EventPort<(socketId: string, name: string) => void>
    private readonly _userAddEvent: EventPort<(socketId: string, name: string) => void>
    private readonly _userDeleteEvent: EventPort<(socketId: string, name: string) => void>
    private readonly _userDeadEvent: EventPort<(socketId: string, name: string) => void>

    //game
    private readonly _gameEvent: EventPort<(roomId: string) => void>
    private readonly _playerJoinEvent: EventPort<(roomId: string, socketId: string) => void>
    private readonly _playerReadyEvent: EventPort<(roomId: string, socketId: string, bool: boolean) => void>
    private readonly _playerLoadedEvent: EventPort<(roomId: string, socketId: string) => void>
    private readonly _gameStartEvent: EventPort<(roomId: string) => void>
    private readonly _gameRestartEvent: EventPort<(roomId: string) => void>
    private readonly _playerQuitEvent: EventPort<(roomId: string, socketId: string) => void>
    private readonly _playerDeadEvent: EventPort<(roomId: string, socketId: string) => void>
    private readonly _gameResetEvent: EventPort<(roomId: string) => void>

    //game/mahjoung
    private readonly _tsumoEvent: EventPort<(roomId: string, kaze: kaze_number) => void>
    private readonly _dahaiEvent: EventPort<(roomId: string, kaze: kaze_number, dahaiHai: number) => void>
    private readonly _ponEvent: EventPort<(roomId: string, kaze: kaze_number, furoHai: number, combi: number[]) => void>
    private readonly _chiEvent: EventPort<(roomId: string, kaze: kaze_number, furoHai: number, combi: number[]) => void>
    private readonly _kanEvent: EventPort<(roomId: string, kaze: kaze_number, kanHai: number, combi: number[]) => void>
    private readonly _ankanEvent: EventPort<(roomId: string, kaze: kaze_number, kanHai: number, combi: number[]) => void>
    private readonly _kakanEvent: EventPort<(roomId: string, kaze: kaze_number, kanHai: number, combi: number[]) => void>
    private readonly _kantsumoEvent: EventPort<(roomId: string, kaze: kaze_number) => void>
    private readonly _horaEvent: EventPort<(roomId: string, kaze: kaze_number, horaHai: number) => void>
    private readonly _richiEvent: EventPort<(roomId: string, kaze: kaze_number, richiHai: number) => void>
    private readonly _ryukyokuByPlayerEvent: EventPort<(roomId: string, kaze: kaze_number, type: ryukyoku) => void>
    private readonly _ryukyokuEvent: EventPort<(roomId: string, type: ryukyoku) => void>
    private readonly _skipEvent: EventPort<(roomId: string, kaze: kaze_number) => void>
    private readonly _endEvent: EventPort<(roomId: string) => void>
    private readonly _shukyokuEvent: EventPort<(roomId: string) => void>

    constructor(){
        this.emitter = new EventEmitter()

        this._event = new EventPort("event", this.emitter)

        //socket
        this._socketEvent = new EventPort("socket", this.emitter)
        this._socketConnectEvent = new EventPort("socketConnect", this.emitter)
        this._socketDisconnectEvent = new EventPort("socketDisconnect", this.emitter)
        this._socketReceiveEvent = new EventPort("socketReceive", this.emitter)

        //server
        this._serverEvent = new EventPort("server", this.emitter)
        this._serverStopEvent = new EventPort("serverStop", this.emitter)
        this._serverPreLoadEvent = new EventPort("serverPreLoad", this.emitter)
        this._serverLoadEvent = new EventPort("serverLoad", this.emitter)
        this._serverEmitEvent = new EventPort("serverEmit", this.emitter)
        this._serverReceiveEvent = new EventPort("serverReceive", this.emitter)
        this._roomAddEvent = new EventPort("roomAdd", this.emitter)
        this._roomDeleteEvent = new EventPort("roomDelete", this.emitter)

        //plugin
        this._pluginEvent = new EventPort("plugin", this.emitter)
        this._pluginPreLoadEvent = new EventPort("pluginPreLoad", this.emitter)
        this._pluginLoadEvent = new EventPort("pluginLoad", this.emitter)
        this._pluginPreUnloadEvent = new EventPort("pluginPreUnload", this.emitter)
        this._pluginUnloadEvent = new EventPort("pluginUnload", this.emitter)
        this._pluginEnableEvent = new EventPort("pluginEnable", this.emitter)
        this._pluginDisableEvent = new EventPort("pluginDisable", this.emitter)

        //user
        this._userEvent = new EventPort("user", this.emitter)
        this._userAddEvent = new EventPort("userAdd", this.emitter)
        this._userDeleteEvent = new EventPort("userDelete", this.emitter)
        this._userDeadEvent = new EventPort("userDead", this.emitter)

        //game
        this._gameEvent = new EventPort("game", this.emitter)
        this._playerJoinEvent = new EventPort("playerJoin", this.emitter)
        this._playerReadyEvent = new EventPort("playerReady", this.emitter)
        this._playerLoadedEvent = new EventPort("playerLoaded", this.emitter)
        this._gameStartEvent = new EventPort("gameStart", this.emitter)
        this._gameRestartEvent = new EventPort("gameRestart", this.emitter)
        this._playerQuitEvent = new EventPort("playerQuit", this.emitter)
        this._playerDeadEvent = new EventPort("playerDead", this.emitter)
        this._gameResetEvent = new EventPort("gameReset", this.emitter)

        //game/mahjoung
        this._tsumoEvent = new EventPort("tsumo", this.emitter)
        this._dahaiEvent = new EventPort("dahai", this.emitter)
        this._ponEvent = new EventPort("pon", this.emitter)
        this._chiEvent = new EventPort("chi", this.emitter)
        this._kanEvent = new EventPort("kan", this.emitter)
        this._ankanEvent = new EventPort("ankan", this.emitter)
        this._kakanEvent = new EventPort("kakan", this.emitter)
        this._kantsumoEvent = new EventPort("kantsumo", this.emitter)
        this._horaEvent = new EventPort("hora", this.emitter)
        this._richiEvent = new EventPort("richi", this.emitter)
        this._ryukyokuByPlayerEvent = new EventPort("ryukyokuByPlayer", this.emitter)
        this._ryukyokuEvent = new EventPort("ryukyoku", this.emitter)
        this._skipEvent = new EventPort("skip", this.emitter)
        this._endEvent = new EventPort("end", this.emitter)
        this._shukyokuEvent = new EventPort("shukyoku", this.emitter)
    }

    //event
    public get Event(){ return this._event }
    public event(){
        this.emitter.emit(this._event)
    }

    //socket
    public get socketEvent(){ return this._socketEvent }
    public socket(socketId: string){
        this.emitter.emit(this._socketEvent, socketId)
    }

    public get socketConnectEvent(){ return this._socketConnectEvent }
    public socketConnect(socketId: string): boolean{
        return this.emitter.emit(this._socketConnectEvent, socketId)
    }
    public get socketDisconnectEvent(){ return this._socketDisconnectEvent }
    public socketDisconnect(socketId: string): boolean{
        return this.emitter.emit(this._socketDisconnectEvent, socketId)
    }
    public get socketReceiveEvent(){ return this._socketReceiveEvent }
    public socketReceive(socketId: string, data: string): boolean{
        return this.emitter.emit(this._socketReceiveEvent, socketId, data)
    }

    //server
    public get serverEvent(){ return this._serverEvent }
    public server(){
        this.emitter.emit(this._serverEvent)
    }

    public get serverStopEvent(){ return this._serverStopEvent }
    public serverStop(): boolean{
        return this.emitter.emit(this._serverStopEvent)
    }
    public get serverPreLoadEvent(){ return this._serverPreLoadEvent }
    public serverPreLoad(): boolean{
        return this.emitter.emit(this._serverPreLoadEvent)
    }
    public get serverLoadEvent(){ return this._serverLoadEvent }
    public serverLoad(): boolean{
        return this.emitter.emit(this._serverLoadEvent)
    }
    public get serverEmitEvent(){ return this._serverEmitEvent }
    public serverEmit(socketId: string, data: string): boolean{
        return this.emitter.emit(this._serverEmitEvent, socketId, data)
    }
    public get serverReceiveEvent(){ return this._serverReceiveEvent }
    public serverReceive(socketId: string, data: string): boolean{
        return this.emitter.emit(this._serverReceiveEvent, socketId, data)
    }
    public get roomAddEvent(){ return this._roomAddEvent }
    public roomAdd(roomId: string, hosterId: string): boolean{
        return this.emitter.emit(this._roomAddEvent, roomId, hosterId)
    }
    public get roomDeleteEvent(){ return this._roomDeleteEvent }
    public roomDelete(roomId: string): boolean{
        return this.emitter.emit(this._roomDeleteEvent, roomId)
    }

    //plugin
    public get pluginEvent(){ return this._pluginEvent }
    public plugin(){
        this.emitter.emit(this._pluginEvent)
    }

    public get pluginPreLoadEvent() { return this._pluginPreLoadEvent }
    public pluginPreLoad(): boolean{
        return this.emitter.emit(this._pluginPreLoadEvent)
    }
    public get pluginLoadEvent() { return this._pluginLoadEvent }
    public pluginLoad(): boolean{
        return this.emitter.emit(this._pluginLoadEvent)
    }
    public get pluginPreUnloadEvent() { return this._pluginPreUnloadEvent }
    public pluginPreUnload(): boolean{
        return this.emitter.emit(this._pluginPreUnloadEvent)
    }
    public get pluginUnloadEvent() { return this._pluginUnloadEvent }
    public pluginUnload(): boolean{
        return this.emitter.emit(this._pluginUnloadEvent)
    }
    public get pluginEnableEvent() { return this._pluginEnableEvent }
    public pluginEnable(name: string, json: any): boolean{
        return this.emitter.emit(this._pluginEnableEvent, name, json)
    }
    public get pluginDisableEvent() { return this._pluginDisableEvent }
    public pluginDisable(name: string, json: any): boolean{
        return this.emitter.emit(this._pluginDisableEvent, name, json)
    }

    //user
    public get userEvent(){ return this._userEvent }
    public user(socketId: string, name: string){
        this.emitter.emit(this._userEvent, socketId, name)
    }

    public get userAddEvent(){ return this._userAddEvent }
    public userAdd(socketId: string, name: string): boolean{
        return this.emitter.emit(this._userAddEvent, socketId, name)
    }
    public get userDeleteEvent(){ return this._userDeleteEvent }
    public userDelete(socketId: string, name: string): boolean{
        return this.emitter.emit(this._userDeleteEvent, socketId, name)
    }
    public get userDeadEvent(){ return this._userDeadEvent }
    public userDead(socketId: string, name: string): boolean{
        return this.emitter.emit(this._userDeadEvent, socketId, name)
    }

    //game
    public get gameEvent(){ return this._gameEvent }
    public game(roomId: string){
        this.emitter.emit(this._gameEvent, roomId)
    }

    public get playerJoinEvent() { return this._playerJoinEvent }
    public playerJoin(roomId: string, socketId: string): boolean{
        return this.emitter.emit(this._playerJoinEvent, roomId, socketId)
    }
    public get playerReadyEvent() { return this._playerReadyEvent }
    public playerReady(roomId: string, socketId: string, bool: boolean): boolean{
        return this.emitter.emit(this._playerReadyEvent, roomId, socketId, bool)
    }
    public get playerLoadedEvent() { return this._playerLoadedEvent }
    public playerLoaded(roomId: string, socketId: string): boolean{
        return this.emitter.emit(this._playerLoadedEvent, roomId, socketId)
    }
    public get gameStartEvent() { return this._gameStartEvent }
    public gameStart(roomId: string): boolean{
        return this.emitter.emit(this._gameStartEvent, roomId)
    }
    public get gameRestartEvent() { return this._gameRestartEvent }
    public gameRestart(roomId: string): boolean{
        return this.emitter.emit(this._gameRestartEvent, roomId)
    }
    public get playerQuitEvent() { return this._playerQuitEvent }
    public playerQuit(roomId: string, socketId: string): boolean{
        return this.emitter.emit(this._playerQuitEvent, roomId, socketId)
    }
    public get playerDeadEvent() { return this._playerDeadEvent }
    public playerDead(roomId: string, socketId: string): boolean{
        return this.emitter.emit(this._playerDeadEvent, roomId, socketId)
    }
    public get gameResetEvent() { return this._gameResetEvent }
    public gameReset(roomId: string): boolean{
        return this.emitter.emit(this._gameResetEvent, roomId)
    }

    //game/mahjoung
    public get tsumoEvent() { return this._tsumoEvent }
    public tsumo(roomId: string, kaze: kaze_number): boolean{
        return this.emitter.emit(this._tsumoEvent, roomId, kaze)
    }
    public get dahaiEvent() { return this._dahaiEvent }
    public dahai(roomId: string, kaze: kaze_number, dahaiHai: number): boolean{
        return this.emitter.emit(this._dahaiEvent, roomId, kaze, dahaiHai)
    }
    public get ponEvent() { return this._ponEvent }
    public pon(roomId: string, kaze: kaze_number, furoHai: number, combi: number[]): boolean{
        return this.emitter.emit(this._ponEvent, roomId, kaze, furoHai, combi)
    }
    public get chiEvent() { return this._chiEvent }
    public chi(roomId: string, kaze: kaze_number, furoHai: number, combi: number[]): boolean{
        return this.emitter.emit(this._chiEvent, roomId, kaze, furoHai, combi)
    }
    public get kanEvent() { return this._kanEvent }
    public kan(roomId: string, kaze: kaze_number, kanHai: number, combi: number[]): boolean{
        return this.emitter.emit(this._kanEvent, roomId, kaze, kanHai, combi)
    }
    public get ankanEvent() { return this._ankanEvent }
    public ankan(roomId: string, kaze: kaze_number, kanHai: number, combi: number[]): boolean{
        return this.emitter.emit(this._ankanEvent, roomId, kaze, kanHai, combi)
    }
    public get kakanEvent() { return this._kakanEvent }
    public kakan(roomId: string, kaze: kaze_number, kanHai: number, combi: number[]): boolean{
        return this.emitter.emit(this._kakanEvent, roomId, kaze, kanHai, combi)
    }
    public get kantsumoEvent() { return this._kantsumoEvent }
    public kantsumo(roomId: string, kaze: kaze_number): boolean{
        return this.emitter.emit(this._kantsumoEvent, roomId, kaze)
    }
    public get horaEvent() { return this._horaEvent }
    public hora(roomId: string, kaze: kaze_number, horaHai: number): boolean{
        return this.emitter.emit(this._horaEvent, roomId, kaze, horaHai)
    }
    public get richiEvent() { return this._richiEvent }
    public richi(roomId: string, kaze: kaze_number, richiHai: number): boolean{
        return this.emitter.emit(this._richiEvent, roomId, kaze, richiHai)
    }
    public get ryukyokuByPlayerEvent() { return this._ryukyokuByPlayerEvent }
    public ryukyokuByPlayer(roomId: string, kaze: kaze_number, type: ryukyoku): boolean{
        return this.emitter.emit(this._ryukyokuByPlayerEvent, roomId, kaze, type)
    }
    public get ryukyokuEvent() { return this._ryukyokuEvent }
    public ryukyoku(roomId: string, type: ryukyoku): boolean{
        return this.emitter.emit(this._ryukyokuEvent, roomId, type)
    }
    public get skipEvent() { return this._skipEvent }
    public skip(roomId: string, kaze: kaze_number): boolean{
        return this.emitter.emit(this._skipEvent, roomId, kaze)
    }
    public get endEvent() { return this._endEvent }
    public end(roomId: string): boolean{
        return this.emitter.emit(this._endEvent, roomId)
    }
    public get shukyokuEvent() { return this._shukyokuEvent }
    public shukyoku(roomId: string): boolean{
        return this.emitter.emit(this._shukyokuEvent, roomId)
    }
}