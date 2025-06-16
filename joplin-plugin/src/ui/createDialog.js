import joplin from 'api';
import {getNotebook,getAllNotebooks} from '../reviewNotes/dataApi';
import {getConfig} from '../reviewNotes/configService';


export const createDialog = async (excludedNotebookIds) => {
    const viewHandle = await joplin.views.dialogs.create('reviewNotesPanel');
    // await joplin.views.dialogs.setHtml(viewHandle, `
    //     <div>
    //         <h1><strong>Review Notes Configuration</strong></h1>
    //     </div>
    // ` );
    await manageNotebooks(viewHandle, excludedNotebookIds);
    return viewHandle;
}

export const manageNotebooks = async (viewHandle, excludedNotebookIds = []) => {
    const notebooks = await getAllNotebooks();
    await joplin.data.post(['notes'], null, {
        title: 'Debug Log - createDialog',
        body: `${JSON.stringify(excludedNotebookIds.join(', '))}\n${await joplin.settings.value('excludedNotebooks')}`,
    });
    await joplin.views.dialogs.setHtml(viewHandle, `
        <div>
            <h1><strong>Manage Notebooks</strong></h1>
            <p>Here you can manage your notebooks.</p>
            <form name="notebookExclusionForm">
                ${notebooks.map(notebook =>  `
                    <label for="notebookName">
                        <input type="checkbox" name="${notebook.id}" ${excludedNotebookIds.includes(notebook.id) ? 'checked' : ''}/>
                        ${getNotebook(notebook.parent_id).title ? `${getNotebook(notebook.parent_id).title}/` : ''}${notebook.title}
                    </label>
                `).join('')}
            </form>            
        </div>
    ` );

    // await joplin.views.dialogs.onClose(viewHandle, () => {
    //     console.log('Dialog closed');
    // });

    // await joplin.views.dialogs.onButtonClicked(viewHandle, 'closeButton', async () => {
    //     await joplin.views.dialogs.close(viewHandle);
    // });

    await joplin.views.dialogs.addScript(viewHandle, './ui/helper.js')
    await joplin.views.dialogs.addScript(viewHandle, './ui/helper.css')
}

export const updateDialogHtml = async (viewHandle, excludedNotebookIds) => {
    await manageNotebooks(viewHandle, excludedNotebookIds)
}