# Codio Spec - Alpha Version
note: this is subject to change as we progress.

A codio file is a zip of:

- An audio.mp3 file.
- A meta.json file.
- a workspace folder.
- A codio.json file.

#### audio.mp3
The audio file is the audio recording part of codio.

#### meta.json
The meta.json file contains the following meta data about the codio:

* *name*: The name of the codio recording - string.
* *length*: The length of the codio recording in milliseconds - number.
* *date - optional*: the time the codio was created - unix time in milliseconds.

Here's an example of a meta.json file:
```
{
  name: "How to use forEach",
  length: 24422,
}
```

#### codio.json

codio.json is where the magic happens. It includes:
* *length*
* *actions*

actions are an array of codio actions.
Each codio action includes:
* Relative file path - the file where the action was performed - marked as *filePath*
* Relative time from the beginning in milliseconds - when the operation should be done - marked as *time*

#### codio actions
There are 5 types of codio actions:
* textChanged - marked as text
* selectionChanged - marked as selection
* textEditorChanged - marked as editorChanged
* visibleRangeChanged - marked as visible

and experimental:
* *execution* - marked as execution



#### workspace folder

The workspace folder includes the files to and in which Codio will perform its actions.
