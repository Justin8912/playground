import joplin from 'api';
import { generateReviewNote } from './reviewNotes/reviewService';

const generateReviewNoteInBackground = () => {
	console.log('Starting review note generation...');
	
	// Generate the review note in a non-blocking way
	generateReviewNote()
		.then(reviewNote => {
			if (reviewNote) {
				console.log(`Review note created successfully: ${reviewNote.title}`);
				
				joplin.views.dialogs.showMessageBox(`Review note "${reviewNote.title}" created! Opening it now...`)
					.then(() => {
						return joplin.commands.execute('openNote', reviewNote.id);
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
		console.info('Review Notes Plugin started!');

		setTimeout(() => {
			generateReviewNoteInBackground();
		}, 2000);
		
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
