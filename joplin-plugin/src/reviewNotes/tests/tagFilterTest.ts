// This is a test file for verifying the tag filtering functionality
import { noteMatchesFilterCriteria, applyFilterCriteria } from '../filterUtils';
import { FilterCriteria, NoteInfo, NotebookInfo } from '../types';

/**
 * Test the tag exclusion functionality
 * This can be run manually to verify the feature works
 */
export const testTagExclusion = (): void => {
  console.log('Testing tag exclusion...');
  
  // Mock data setup with notes and tags
  const notebooks: NotebookInfo[] = [
    { id: 'notebook1', title: 'Notebook 1', parent_id: '' },
    { id: 'notebook2', title: 'Notebook 2', parent_id: '' },
  ];
  
  const notes: NoteInfo[] = [
    { 
      id: 'note1', 
      title: 'Note with no tags', 
      body: 'Content 1', 
      parent_id: 'notebook1',
      tags: []
    },
    { 
      id: 'note2', 
      title: 'Note with important tag', 
      body: 'Content 2', 
      parent_id: 'notebook1',
      tags: ['important']
    },
    { 
      id: 'note3', 
      title: 'Note with exclude tag', 
      body: 'Content 3', 
      parent_id: 'notebook1',
      tags: ['exclude-from-review']
    },
    { 
      id: 'note4', 
      title: 'Note with multiple tags', 
      body: 'Content 4', 
      parent_id: 'notebook2',
      tags: ['important', 'exclude-from-review']
    },
    { 
      id: 'note5', 
      title: 'Another note with no tags', 
      body: 'Content 5', 
      parent_id: 'notebook2',
      tags: []
    },
  ];
  
  // Test excluding notes with the "exclude-from-review" tag
  const filterCriteria: FilterCriteria = {
    excludeTags: ['exclude-from-review']
  };
  
  console.log('\nTesting with excluded tag "exclude-from-review":');
  const filteredNotes = applyFilterCriteria(notes, notebooks, filterCriteria);
  
  console.log('Notes that passed the filter:');
  filteredNotes.forEach(note => {
    console.log(`- ${note.title} (tags: ${note.tags?.join(', ') || 'none'})`);
  });
  
  console.log('\nNotes that were excluded:');
  const excludedNotes = notes.filter(note => !filteredNotes.some(fn => fn.id === note.id));
  excludedNotes.forEach(note => {
    console.log(`- ${note.title} (tags: ${note.tags?.join(', ') || 'none'})`);
  });
  
  // Verify that notes with the excluded tag were filtered out
  const correctTagFiltering = excludedNotes.every(note => 
    note.tags?.includes('exclude-from-review')
  );
  console.log(`\nCorrect tag filtering (only notes with excluded tag filtered out): ${correctTagFiltering}`);
  
  // Test case-insensitive tag matching
  const caseInsensitiveFilterCriteria: FilterCriteria = {
    excludeTags: ['EXCLUDE-from-review']
  };
  
  console.log('\nTesting case-insensitive tag matching:');
  const caseInsensitiveFilteredNotes = applyFilterCriteria(notes, notebooks, caseInsensitiveFilterCriteria);
  
  const correctCaseInsensitiveFiltering = notes.length - caseInsensitiveFilteredNotes.length === 
    excludedNotes.length;
  console.log(`Case-insensitive tag matching works correctly: ${correctCaseInsensitiveFiltering}`);
};
