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


var websocketUrl = "http://localhost:3000/";
var socket = io.connect(websocketUrl);
var timer = null
var time = null
var emit_data = null
var kaze_n = null
var tsumo = null;
var tehai = null;
var cache = null;

socket.on("janho", function(data){
	new Promise((resolve, reject) => {
		setTimeout(() => {
			onReceive(data);

			const log = document.querySelector("#log");
			const logline = document.createElement("line");
			const date = new Date();
			const time = date.toLocaleTimeString();
			logline.innerHTML = `[${time}] REC ${data}<br>`;
			log.insertBefore(logline, log.firstChild);
		}, 1);
	}).catch(() => {
		console.error("Error: socket.io receive error.")
	})
});
function emit(data){
	new Promise((resolve, reject) => {
		setTimeout(() => {
			onEmit(data);

			emit_data = data;
			socket.emit("janho", data);

			const log = document.querySelector("#log");
			const logline = document.createElement("line");
			const date = new Date();
			const time = date.toLocaleTimeString();
			logline.innerHTML = `[${time}] EMIT ${data}<br>`;
			log.insertBefore(logline, log.firstChild);
		}, 1);
	}).catch(() => {
		console.error("Error: socket.io receive error.")
	})
}

function publishMessage(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	emit(msg);
	textInput.value = ""
}
function register(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	var data = JSON.stringify({"protocol": "register", "name": msg})
	emit(data);
	textInput.value = ""
}
function createRoom(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	var data = JSON.stringify({"protocol": "createRoom", "roomId": msg});
	emit(data);
	textInput.value = ""
}
function joinRoom(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	var data = JSON.stringify({"protocol": "joinRoom", "roomId": msg});
	emit(data);
	textInput.value = ""
}
function readyRoom(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	if(msg === "true"){
		var bmsg = true;
	}else{
		var bmsg = false;
	}
	var data = JSON.stringify({"protocol": "readyRoom", "bool": bmsg});
	emit(data);
	textInput.value = ""
}
function startRoom(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	if(msg === "true"){
		var bmsg = true;
	}else{
		var bmsg = false;
	}
	var data = JSON.stringify({"protocol": "startRoom", "bool": bmsg});
	emit(data);
	textInput.value = ""
}
function dahai(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	var data = JSON.stringify({"protocol": "dahai", "hai": Number(msg)});
	emit(data);
	textInput.value = ""
}
function furo(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	var hai = msg.split(",");
	for(var i = 1; i <= hai.length; i++){
		hai[i-1] = Number(hai[i-1])
	}
	var data = JSON.stringify({"protocol": "furo", "hai": hai});
	emit(data);
	textInput.value = ""
}
function hora(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	var data = JSON.stringify({"protocol": "hora", "hai": Number(msg)});
	emit(data);
	textInput.value = ""
}
function kaikan(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	var hai = msg.split(",");
	for(var i = 1; i <= hai.length; i++){
		hai[i-1] = Number(hai[i-1])
	}
	var data = JSON.stringify({"protocol": "kaikan", "hai": hai});
	emit(data);
	textInput.value = ""
}
function kan(){
	var textInput = document.querySelector("#msg_input");
	var msg = textInput.value;
	var hai = msg.split(",");
	for(var i = 1; i <= hai.length; i++){
		hai[i-1] = Number(hai[i-1])
	}
	var data = JSON.stringify({"protocol": "kan", "hai": hai});
	emit(data);
	textInput.value = ""
}
function skip(){
	var data = JSON.stringify({"protocol": "skip"});
	emit(data);
}
function alloya(){
	var S = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var N = 16;
	var data = JSON.stringify({"protocol": "register", "name": Array.from(crypto.getRandomValues(new Uint8Array(N))).map((n)=>S[n%S.length]).join("")});
	emit(data);
	data = JSON.stringify({"protocol": "createRoom", "roomId": "test"});
	emit(data);
	data = JSON.stringify({"protocol": "readyRoom", "bool": true});
	emit(data);
	data = JSON.stringify({"protocol": "startRoom", "bool": true});
	emit(data);
}
function allko(){
	var S = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var N = 16;
	var data = JSON.stringify({"protocol": "register", "name": Array.from(crypto.getRandomValues(new Uint8Array(N))).map((n)=>S[n%S.length]).join("")});
	emit(data);
	data = JSON.stringify({"protocol": "joinRoom", "roomId": "test"});
	emit(data);
	data = JSON.stringify({"protocol": "readyRoom", "bool": true});
	emit(data);
	data = JSON.stringify({"protocol": "startRoom", "bool": true});
	emit(data);
}

function onReceive(data){
	const parsed = JSON.parse(data);
	if("protocol" in parsed){
		response(data);
		if(parsed["protocol"] === "timein"){
			if("time" in parsed){
				if(typeof parsed["time"] === "number"){
					time = parsed["time"];
					timer = setInterval(() => 
					{
						document.getElementById("timer").innerText = `Time: ${time - 1}`;
						time = time - 1;
						if(time === 0){
							clearInterval(timer);
							time = null;
							timer = null;
							document.getElementById("timer").innerText = `Time: -`;
							document.getElementById("tsumohai").src = "";
						}
					}, 1000);
				}
			}
		}else if(parsed["protocol"] === "haipai"){
			if("kaze" in parsed){
				kaze_n = parsed["kaze"];
				switch(kaze_n){
					case 0:
						document.getElementById("kaze").innerText = "東"
						break;
					case 1:
						document.getElementById("kaze").innerText = "南"
						break;
					case 2:
						document.getElementById("kaze").innerText = "西"
						break;
					case 3:
						document.getElementById("kaze").innerText = "北"
						break;
				}
			}
			if("hai" in parsed){
				tehai = parsed["hai"];
				updateTehai(parsed["hai"]);
			}
		}else if(parsed["protocol"] === "tsumo"){
			if("hai" in parsed){
				tsumo = parsed["hai"];
				const hai_s = Math.floor(parsed["hai"] / 100) % 10;
				const hai_n = hai_s * 10 + Math.floor(parsed["hai"] / 10) % 10;
				document.getElementById("tsumohai").src = path_list[hai_s] + path_list_f[0] + img_list[hai_n];
				document.getElementById("tsumohai").onclick = function () {
					var data = JSON.stringify({"protocol": "dahai", "hai": tsumo});
					emit(data);
				}
			}
		}else if(parsed["protocol"] === "dahai"){
			if("hai" in parsed){
				if(!("kaze" in parsed)) return;
				const hai_s = Math.floor(parsed["hai"] / 100) % 10;
				const hai_n = hai_s * 10 + Math.floor(parsed["hai"] / 10) % 10;
				const img = document.createElement("img");
				img.src = path_list[hai_s] + path_list_f[0] + img_list[hai_n];
				img.className = "littlehai";
				var kaze;
				switch(parsed["kaze"]){
					case 0:
						kaze = "tonsute";
						break;
					case 1:
						kaze = "nansute";
						break;
					case 2:
						kaze = "shasute";
						break;
					case 3:
						kaze = "peisute";
						break;
				}
				const kaze_element = document.getElementById(kaze);
				if(kaze_element.getElementsByTagName("img").length % 6 === 0) 
					kaze_element.appendChild(document.createElement("br"));
				kaze_element.appendChild(img);
			}
			if("result" in parsed){
				if(parsed["result"]){
					const hai_s = Math.floor(dahai / 100) % 10;
					const hai_n = hai_s * 10 + Math.floor(dahai / 10) % 10;
					const img = document.createElement("img");
					img.src = path_list[hai_s] + path_list_f[0] + img_list[hai_n];
					img.className = "littlehai";
					var kaze;
					switch(kaze_n){
						case 0:
							kaze = "tonsute";
							break;
						case 1:
							kaze = "nansute";
							break;
						case 2:
							kaze = "shasute";
							break;
						case 3:
							kaze = "peisute";
							break;
					}
					const kaze_element = document.getElementById(kaze);
					if(kaze_element.getElementsByTagName("img").length % 6 === 0) 
						kaze_element.appendChild(document.createElement("br"));
					kaze_element.appendChild(img);
					if(dahai !== tsumo){
						tehai.push(tsumo);
						tehai.splice(tehai.indexOf(dahai), 1);
						updateTehai(tehai);
					}
					dahai = null;
				}
			}
		}else if(parsed["protocol"] === "timeout"){
			if("event" in parsed){
				if("protocol" in parsed["event"]){
					if(parsed["event"]["protocol"] === "dahai"){
						if("hai" in parsed["event"]){
							const hai_s = Math.floor(parsed["event"]["hai"] / 100) % 10;
							const hai_n = hai_s * 10 + Math.floor(parsed["event"]["hai"] / 10) % 10;
							const img = document.createElement("img");
							img.src = path_list[hai_s] + path_list_f[0] + img_list[hai_n];
							img.className = "littlehai";
							var kaze;
							switch(kaze_n){
								case 0:
									kaze = "tonsute";
									break;
								case 1:
									kaze = "nansute";
									break;
								case 2:
									kaze = "shasute";
									break;
								case 3:
									kaze = "peisute";
									break;
							}
							const kaze_element = document.getElementById(kaze);
							if(kaze_element.getElementsByTagName("img").length % 6 === 0) 
								kaze_element.appendChild(document.createElement("br"));
							kaze_element.appendChild(img);
						}
					}
				}
			}
		}else if(parsed["protocol"] === "furo"){
			if("hai" in parsed){
				//todo
			}
			if("result" in parsed){
				//todo
			}
		}
	}
}

function onEmit(data){
	const parsed = JSON.parse(data);
	if("protocol" in parsed){
		if(parsed["protocol"] === "dahai"){
			if("hai" in parsed){
				dahai = parsed["hai"];
			}
		}
	}
}

function response(data){
	const parsed = JSON.parse(data);
	if("result" in parsed){
		if(parsed["result"]) clearTimer(); 
	}
}

function clearTimer(){
	clearInterval(timer);
	time = null;
	timer = null;
	document.getElementById("timer").innerText = `Time: -`;
	document.getElementById("tsumohai").src = "";
}

function haiSort(hai){
	return hai.sort((a,b) => {return a - b})
}

function updateTehai(hai){
	new_hai = haiSort(hai);
	for(var i = 0; i <= new_hai.length - 1; i++){
		const hai_s = Math.floor(new_hai[i] / 100) % 10;
		const hai_f = Math.floor(new_hai[i] / 1) % 10;
		const hai_n = hai_s * 10 + Math.floor(hai[i] / 10) % 10;
		if(hai_f){
			document.getElementById("hai" + (i+1)).src = path_list[hai_s] + path_list_f[1] + img_list_f[hai_n];
		}else{
			document.getElementById("hai" + (i+1)).src = path_list[hai_s] + path_list_f[0] + img_list[hai_n];
		}
		const v_hai = new_hai[i];
		document.getElementById("hai" + (i+1)).onclick = function () {
			var data = JSON.stringify({"protocol": "dahai", "hai": v_hai});
			emit(data);
		}
	}
}

const img_list = 
{
	10: "akahai12.gif", 11: "man1s.gif", 12: "man2s.gif", 13: "man3s.gif", 14: "man4s.gif",
	15: "man5s.gif", 16: "man6s.gif", 17: "man7s.gif", 18: "man8s.gif", 19: "man9s.gif",
	20: "akahai7.gif", 21: "pin1s.gif", 22: "pin2s.gif", 23: "pin3s.gif", 24: "pin4s.gif",
	25: "pin5s.gif", 26: "pin6s.gif", 27: "pin7s.gif", 28: "pin8s.gif", 29: "pin9s.gif",
	30: "akahai5.gif", 31: "so1s.gif", 32: "so2s.gif", 33: "so3s.gif", 34: "so4s.gif",
	35: "so5s.gif", 36: "so6s.gif", 37: "so7s.gif", 38: "so8s.gif", 39: "so9s.gif",
	41: "ma1s.gif", 42: "ma2s.gif", 43: "ma3s.gif", 44: "ma4s.gif", 45: "ma5s.gif",
	46: "ma6s.gif", 47: "ma7s.gif"
};
const img_list_f = 
{
	10: "akahai12.gif", 11: "many1s.gif", 12: "many2s.gif", 13: "many3s.gif", 14: "many4s.gif",
	15: "many5s.gif", 16: "many6s.gif", 17: "many7s.gif", 18: "many8s.gif", 19: "many9s.gif",
	20: "akahai7.gif", 21: "piny1s.gif", 22: "piny2s.gif", 23: "piny3s.gif", 24: "piny4s.gif",
	25: "piny5s.gif", 26: "piny6s.gif", 27: "piny7s.gif", 28: "piny8s.gif", 29: "piny9s.gif",
	30: "akahai5.gif", 31: "soy1s.gif", 32: "soy2s.gif", 33: "soy3s.gif", 34: "soy4s.gif",
	35: "soy5s.gif", 36: "soy6s.gif", 37: "soy7s.gif", 38: "soy8s.gif", 39: "soy9s.gif",
	41: "may1s.gif", 42: "may2s.gif", 43: "may3s.gif", 44: "may4s.gif", 45: "may5s.gif",
	46: "may6s.gif", 47: "may7s.gif"
};
const path_list = 
{
	1: "./img/m/", 2: "./img/p/", 3: "./img/s/", 4: "./img/j/"
};
const path_list_f =
{
	0: "sm/", 1: "sms/"
}