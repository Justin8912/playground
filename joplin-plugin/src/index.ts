import joplin from 'api';
import { initConfig } from './reviewNotes/configService';
import { generateReviewNote } from './reviewNotes/reviewService';

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
		// TODO: Remove after this has been tested.
		console.info('Review Notes Plugin started!', config.filterEnabled ? 'Note filtering enabled' : 'Note filtering disabled');

		generateReviewNoteInBackground();
		
		await joplin.commands.register({
			name: 'generateReviewNote',
			label: 'Generate Review Note',
			execute: async () => { generateReviewNoteInBackground();}
		});
		
		await joplin.views.menus.create('reviewNotesMenu', 'Review Notes', [
			{
				commandName: 'generateReviewNote',
				accelerator: 'CmdOrCtrl+Shift+R'
			}
		]);
	}
});
