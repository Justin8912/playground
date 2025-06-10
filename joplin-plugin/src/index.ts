import joplin from 'api';

joplin.plugins.register({
	onStart: async function() {
		// eslint-disable-next-line no-console
		console.info('Hello world. Test plugin started!');
		console.log("Hello this is a test plugin for joplin.");
		
		// Add a visible notification to verify plugin is running
		await joplin.views.dialogs.showMessageBox('The LLM Study Guide Plugin has started successfully!');
		
		// Add a command that can be triggered from Tools menu
		await joplin.commands.register({
			name: 'testPluginCommand',
			label: 'Test LLM Study Guide Plugin',
			execute: async () => {
				console.log('Test command executed!');
				await joplin.views.dialogs.showMessageBox('Command executed successfully!');
			}
		});
		
		// Add the command to the Tools menu
		await joplin.views.menus.create('testPluginMenu', 'Test Plugin', [
			{
				commandName: 'testPluginCommand',
				accelerator: 'CmdOrCtrl+Shift+T'
			}
		]);
	},
});
