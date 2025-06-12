// This is a test file for verifying the notebook hierarchy filtering functionality
import { noteMatchesFilterCriteria, applyFilterCriteria } from '../filterUtils';
import { FilterCriteria, NoteInfo, NotebookInfo } from '../types';

/**
 * Test the notebook hierarchy exclusion functionality
 * This can be run manually to verify the feature works
 */
export const testNotebookHierarchyExclusion = (): void => {
  console.log('Testing notebook hierarchy exclusion...');
  
  // Mock data setup
  const notebooks: NotebookInfo[] = [
    { id: 'root1', title: 'Root Notebook 1', parent_id: '' },
    { id: 'root2', title: 'Root Notebook 2', parent_id: '' },
    { id: 'child1', title: 'Child Notebook 1', parent_id: 'root1' },
    { id: 'child2', title: 'Child Notebook 2', parent_id: 'root1' },
    { id: 'grandchild1', title: 'Grandchild Notebook 1', parent_id: 'child1' },
  ];
  
  const notes: NoteInfo[] = [
    { id: 'note1', title: 'Note in Root 1', body: 'Content 1', parent_id: 'root1' },
    { id: 'note2', title: 'Note in Root 2', body: 'Content 2', parent_id: 'root2' },
    { id: 'note3', title: 'Note in Child 1', body: 'Content 3', parent_id: 'child1' },
    { id: 'note4', title: 'Note in Child 2', body: 'Content 4', parent_id: 'child2' },
    { id: 'note5', title: 'Note in Grandchild 1', body: 'Content 5', parent_id: 'grandchild1' },
  ];
  
  // Test excluding a parent notebook (root1)
  const filterCriteria: FilterCriteria = {
    excludeNotebookIds: ['root1']
  };
  
  console.log('\nTesting with excluded parent notebook (root1):');
  const filteredNotes = applyFilterCriteria(notes, notebooks, filterCriteria);
  
  console.log('Notes that passed the filter:');
  filteredNotes.forEach(note => {
    const notebook = notebooks.find(nb => nb.id === note.parent_id);
    console.log(`- ${note.title} (in notebook: ${notebook?.title})`);
  });
  
  console.log('\nNotes that were excluded:');
  const excludedNotes = notes.filter(note => !filteredNotes.some(fn => fn.id === note.id));
  excludedNotes.forEach(note => {
    const notebook = notebooks.find(nb => nb.id === note.parent_id);
    console.log(`- ${note.title} (in notebook: ${notebook?.title})`);
  });
  
  // Verify that notes in child notebooks are excluded
  const childNotesExcluded = excludedNotes.some(note => note.parent_id === 'child1' || note.parent_id === 'child2');
  console.log(`\nNotes in child notebooks excluded: ${childNotesExcluded}`);
  
  // Verify that notes in grandchild notebooks are excluded
  const grandchildNotesExcluded = excludedNotes.some(note => note.parent_id === 'grandchild1');
  console.log(`Notes in grandchild notebooks excluded: ${grandchildNotesExcluded}`);
  
  // Test excluding only a child notebook
  const childFilterCriteria: FilterCriteria = {
    excludeNotebookIds: ['child1']
  };
  
  console.log('\nTesting with excluded child notebook (child1):');
  const childFilteredNotes = applyFilterCriteria(notes, notebooks, childFilterCriteria);
  
  console.log('Notes that passed the filter:');
  childFilteredNotes.forEach(note => {
    const notebook = notebooks.find(nb => nb.id === note.parent_id);
    console.log(`- ${note.title} (in notebook: ${notebook?.title})`);
  });
  
  console.log('\nNotes that were excluded:');
  const childExcludedNotes = notes.filter(note => !childFilteredNotes.some(fn => fn.id === note.id));
  childExcludedNotes.forEach(note => {
    const notebook = notebooks.find(nb => nb.id === note.parent_id);
    console.log(`- ${note.title} (in notebook: ${notebook?.title})`);
  });
  
  // Verify only child1 and grandchild1 notes are excluded (not the parent's notes)
  const onlyChildAndGrandchildExcluded = childExcludedNotes.every(note => 
    note.parent_id === 'child1' || note.parent_id === 'grandchild1');
  console.log(`\nOnly child and grandchild notebooks excluded (parent unaffected): ${onlyChildAndGrandchildExcluded}`);
};
