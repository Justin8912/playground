import joplin from 'api';
import { generateReviewNote } from './reviewNotes/reviewService';

/**
 * Generates a review note in the background and navigates to it
 */
const generateReviewNoteInBackground = () => {
	console.log('Starting review note generation...');
	
	// Generate the review note in a non-blocking way
	generateReviewNote()
		.then(reviewNote => {
			if (reviewNote) {
				console.log(`Review note created successfully: ${reviewNote.title}`);
				
				// Show notification that the review note was created
				joplin.views.dialogs.showMessageBox(`Review note "${reviewNote.title}" created! Opening it now...`)
					.then(() => {
						// Navigate to the newly created note
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
	
	// Don't await the promise to keep it non-blocking
	console.log('Review note generation initiated in background');
};

joplin.plugins.register({
	onStart: async function() {
		console.info('Review Notes Plugin started!');

		setTimeout(() => {
			generateReviewNoteInBackground();
		}, 2000);
		
		// Add a command that can be triggered from Tools menu to manually generate a review note
		await joplin.commands.register({
			name: 'generateReviewNote',
			label: 'Generate Review Note',
			execute: async () => { generateReviewNoteInBackground();}
		});
		
		// Add the command to the Tools menu
		await joplin.views.menus.create('reviewNotesMenu', 'Review Notes', [
			{
				commandName: 'generateReviewNote',
				accelerator: 'CmdOrCtrl+Shift+R'
			}
		]);
	}
});
