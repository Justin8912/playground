# Introduction

We are going to be using the existing based of a joplin plugin to create a "Review" notes notebook. 

# Goal

When the user opens Joplin, the plugin will generate a "Review" note.

# Context

For now, we will not be sending off any data to an LLM, this is the first story of the feature and the main goal here is JUST to prove that we can create the review note when the user opens the application.

# Implementation guidelines

- Information about the data api can be found [here](https://joplinapp.org/help/api/references/rest_api/).
- Create this design keeping in mind that we will eventually want to send notes and resources to an LLM and generate the content depending on that output. 
- For now, we will just copy paste the contents of the notes to the new "Reviews" file.Creation of this review note should not be blocking to the user. IE the user should still be able to use Joplin while the review note is being generated.

# Acceptance criteria

- On load in of the plugin, I want to randomly select a note (in the future this "randomness" will be influenced by filters) and create a review note based on this material. 
    - For purposes of this story, just take all the information in the randomly selected note and paste it into the new note. 
- The plugin should look to see if a "Reviews" notebook is present at the top level, if not create it. 
- The plugin should follow the hierarchy that the note originates in. For example, if there is a note that the plugin targets called "123" that lives in the notebook "abc", then the plugin should create a nested notebook in the "Reviews" notebook called "abc" (if it doesnt already exist), and then create a review note inside that newly created notebook called "123".