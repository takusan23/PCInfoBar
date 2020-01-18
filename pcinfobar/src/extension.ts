// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { setInterval } from 'timers';
import { userInfo, totalmem } from 'os';
import { stat } from 'fs';

// CPU使用率取得など
const osu = require('node-os-utils');
const systemInfomation = require('systeminformation');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "pcinfobar" is now active!');

	// 起動コマンド
	const command = "extension.pcinfo";
	// ユーザー設定
	// 更新周期
	const interval = Number(vscode.workspace.getConfiguration('pcinfobar').get('interval'));


	let disposable = vscode.commands.registerCommand(command, () => {
		vscode.window.showInformationMessage('起動するね!');
	});
	context.subscriptions.push(disposable);

	let batteryLevel = '';
	let clockSpeed = '';
	let cpuUsage = '';
	let cpuName = '';
	let ramUsage = '';
	let ramTotal = '';
	let isCharging = false;

	// ステータスバー追加
	// CPU 使用率
	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	context.subscriptions.push(statusBar);
	// CPU 速度など
	setInterval(() => {
		systemInfomation.cpu().then((data: any) => {
			cpuName = data.brand;
		});
		systemInfomation.cpuCurrentspeed().then((speed: any) => {
			clockSpeed = speed.avg;
		});
		osu.cpu.usage().then((cpuPercentage: any) => {
			cpuUsage = cpuPercentage;
		});

		// RAM
		systemInfomation.mem().then((ram: any) => {
			ramUsage = (Number(ram.used) / 1024 / 1024 / 1024).toFixed(2);
			ramTotal = (Number(ram.total) / 1024 / 1024 / 1024).toFixed(2);
		});

		// Battery
		systemInfomation.battery().then((battery: any) => {
			batteryLevel = battery.percent;
			isCharging = battery.ischarging;				
		});

		// 表示
		let plugIcon = 'plug';
		if(isCharging){
			plugIcon = 'plug~spin';
		}
		statusBar.text = `$(dashboard) ${clockSpeed} GHz $(pulse) ${cpuUsage} % $(package) ${ramUsage} GB / ${ramTotal} GB $(${plugIcon}) ${batteryLevel} %`;
		statusBar.tooltip = 'CPU平均速度 / CPU使用率 / メモリ使用量 (メモリ搭載量) / 電池残量';
		statusBar.show();

	}, interval);


}

export function deactivate() { }
