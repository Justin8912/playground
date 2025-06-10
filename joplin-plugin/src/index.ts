import joplin from 'api';
import { generateReviewNote } from './reviewNotes/reviewService';

/**
 * Generates a review note in the background
 */
const generateReviewNoteInBackground = () => {
	console.log('Starting review note generation...');
	
	// Generate the review note in a non-blocking way
	generateReviewNote()
		.then(reviewNote => {
			if (reviewNote) {
				console.log(`Review note created successfully: ${reviewNote.title}`);
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
		// eslint-disable-next-line no-console
		console.info('Review Notes Plugin started!');

		// Generate review note when the application opens (after a short delay)
		setTimeout(() => {
			generateReviewNoteInBackground();
		}, 2000); // Wait 2 seconds to ensure app is fully loaded
		
		// Add a command that can be triggered from Tools menu to manually generate a review note
		await joplin.commands.register({
			name: 'generateReviewNote',
			label: 'Generate Review Note',
			execute: async () => {
				console.log('Generating review note...');
				try {
					const reviewNote = await generateReviewNote();
					if (reviewNote) {
						await joplin.views.dialogs.showMessageBox(`Review note created: ${reviewNote.title}`);
					} else {
						await joplin.views.dialogs.showMessageBox('Failed to create review note. See console for details.');
					}
				} catch (error) {
					console.error('Error generating review note:', error);
					await joplin.views.dialogs.showMessageBox('An error occurred while generating the review note.');
				}
			}
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
