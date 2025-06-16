import joplin from 'api';

export const createDialog = async (notebookHierarchy, excludedNotebookIds) => {
    const viewHandle = await joplin.views.dialogs.create('reviewNotesPanel');
    await joplin.views.dialogs.addScript(viewHandle, './ui/helper.css')

    // To prevent the dialog from shrinking to fit the content
    await joplin.views.dialogs.setFitToContent(viewHandle, false);

    // Generate the HTML for the dialog
    await setDialogHtml(viewHandle, notebookHierarchy, excludedNotebookIds);
    return viewHandle;
}

const createHtmlHierarchy = (notebookHierarchy, excludedNotebookIds) => {
    const createHtmlList = (items, isExcluded) => {
        const shouldBeExcluded = excludedNotebookIds.includes(item.id) || isExcluded;
        return `
            <ul>
                ${items.map(item => `
                    <li>
                        <label>
                            <input type="checkbox" name="${item.id}" ${ shouldBeExcluded ? 'checked' : ''}/>
                            ${item.title}
                        </label>
                        ${item.children ? createHtmlList(item.children, shouldBeExcluded) : ''}
                    </li>
                `).join('')}
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
    await setDialogHtml(viewHandle, notebookHierarchy, excludedNotebookIds)
}