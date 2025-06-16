import joplin from 'api';
import { initConfig, getConfig } from './reviewNotes/configService';
import { generateReviewNote } from './reviewNotes/reviewService';
import { createDialog, manageNotebooks, updateDialogHtml } from './ui/createDialog';
import { MenuItemLocation } from 'api/types';
import { getAllNotebooks } from './reviewNotes/dataApi';

const generateReviewNoteInBackground = () => {
	console.log('Starting review note generation...');
	
	// Generate the review note in a non-blocking way
	generateReviewNote()
		.then(reviewNote => {
			if (reviewNote) {
				console.log(`Review note created successfully: ${reviewNote.title}`);
				
				joplin.views.dialogs.showMessageBox(`Review note "${reviewNote.title}" created! Open it now?`)
					.then((selection) => {
						if (selection === 0) { // 0 is the index for "OK"
							console.log('User acknowledged the creation of the review note. Opening the note...');
							return joplin.commands.execute('openNote', reviewNote.id);
						} else {
							console.log('User dismissed the message box. Not opening the note.');
						}
					})
					.catch(error => console.error('Error navigating to note:', error));
			} else {
				console.log('No review note was created');
			}
		})
		.catch(error => {
			console.error('Error generating review note:', error);
		});
	
	console.log('Review note generation initiated in background');
};

joplin.plugins.register({
	onStart: async function() {
		// Initialize config with enhanced settings
		const config = await initConfig();

		generateReviewNoteInBackground();
		
		const viewHandle = await createDialog((await getConfig()).filterCriteria.excludeNotebookIds);

		await joplin.commands.register({
			name: 'generateReviewNote',
			label: 'Generate Review Note',
			execute: async () => { generateReviewNoteInBackground();}
		});

		await joplin.commands.register({
			name: 'filterConfigurationView',
			label: 'Configure Filter Criteria',
			execute: async () => {
				await updateDialogHtml(viewHandle, (await getConfig()).filterCriteria.excludeNotebookIds);
				const result = await joplin.views.dialogs.open(viewHandle );
				const inputValue = result?.formData?.notebookExclusionForm;
				if (inputValue) {
					const selectedNotebookIds = Object.keys(inputValue).filter((key) => {
						if (inputValue[key].toLowerCase() === "on") return true
					}).map(key=>key)

					await joplin.settings.setValue('excludedNotebooks', selectedNotebookIds.join(','));

					await joplin.data.post(['notes'], null, {
						title: 'Debug Log',
						body: `Form result: ${JSON.stringify((await getAllNotebooks()).map(notebook => JSON.stringify(notebook)))}`,
					});
				}
			}
		});
		
		await joplin.views.menus.create('reviewNotesMenu', 'Review Notes', [
			{
				commandName: 'generateReviewNote',
				accelerator: 'CmdOrCtrl+Shift+R'
			},
			{
				commandName: 'filterConfigurationView'
			}
		], MenuItemLocation.Tools);



	}
});
