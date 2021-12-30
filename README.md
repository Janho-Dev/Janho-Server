README.md 編集中...  

## Description
雀和(Janho) 用のサーバーソフトウェアです。  
・SSL通信対応  
・プラグイン対応(不完全)  
  
開発環境：Node.js v14.15.3  
ソースファイルからの起動では各自Node.jsを導入し、  
必要なモジュールをインストールしてから行ってください。  

## Settings
janho.json
```json
{
	"server": {
		"port": 3000,           # ポート番号
		"enable-https": false,  # ssl通信
		"key": "",              # 秘密鍵の絶対パス
		"cert": ""              # 証明書の絶対パス
	}
}
```

## Licensing information
This project is licensed under AGPL-3.0. Please see the [LICENSE](/LICENSE) file for details.  
