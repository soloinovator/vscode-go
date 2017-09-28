'use strict';

import vscode = require('vscode');
import cp = require('child_process');
import { getGoRuntimePath } from './goPath';
import { getImportPath } from './util';
import { outputChannel } from './goStatus';

export function goGetPackage() {
	const editor = vscode.window.activeTextEditor;
	const selection = editor.selection;
	const selectedText = editor.document.lineAt(selection.active.line).text;

	const importPath = getImportPath(selectedText);
	if (importPath === '') {
		vscode.window.showErrorMessage('No import path to get');
		return;
	}

	const goRuntimePath = getGoRuntimePath();
	if (!goRuntimePath) {
		return vscode.window.showErrorMessage('Could not locate Go binaries. Make sure you have Go installed');
	}

	cp.execFile(goRuntimePath, ['get', '-v', importPath], (err, stdout, stderr) => {
		// go get -v uses stderr to write output regardless of success or failure
		if (stderr !== '') {
			outputChannel.show();
			outputChannel.clear();
			outputChannel.appendLine(stderr);

			return;
		}

		// go get -v doesn't write anything when the package already exists
		vscode.window.showInformationMessage(`Package already exists: ${importPath}`);
	});
};
