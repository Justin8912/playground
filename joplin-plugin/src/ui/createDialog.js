import joplin from 'api';

export const createDialog = async (notebookHierarchy, excludedNotebookIds) => {
    const viewHandle = await joplin.views.dialogs.create('reviewNotesPanel');
    await joplin.views.dialogs.setFitToContent(viewHandle, false);
    await joplin.views.dialogs.addScript(viewHandle, './ui/helper.css')

    // Generate the HTML for the dialog
    await setDialogHtml(viewHandle, notebookHierarchy, excludedNotebookIds);
    return viewHandle;
}

const createHtmlHierarchy = (notebookHierarchy, excludedNotebookIds) => {
    const createHtmlList = (items, isParentExcluded) => {
        return `
            <ul>
                ${items.map(item => {
                    const isItemExcluded = excludedNotebookIds.includes(item.id) || isParentExcluded;
                    return `
                    <li>
                        <label>
                            <input type="checkbox" name="${item.id}" ${isItemExcluded? 'checked' : ''}/>
                            ${item.title}
                        </label>
                        ${item.children ? createHtmlList(item.children, isItemExcluded) : ''}
                    </li>
                `}).join('')}
            </ul>
        `;
    };

    return createHtmlList(notebookHierarchy);
}
export const setDialogHtml = async (viewHandle, notebookHierarchy,  excludedNotebookIds = []) => {
    const dialogHtml = `
        <div id="scroll-container">
            <h1><strong>Manage Notebooks</strong></h1>
            <p>Here you can manage which notesbooks will be excluded from review summaries.</p>
            <form name="notebookExclusionForm">
                ${createHtmlHierarchy(notebookHierarchy, excludedNotebookIds)}
            </form>            
        </div>
    `;

    await joplin.views.dialogs.setHtml(viewHandle, dialogHtml)
}

export const updateDialogHtml = async (viewHandle, notebookHierarchy, excludedNotebookIds) => {
    await setDialogHtml
(viewHandle, notebookHierarchy, excludedNotebookIds)
}