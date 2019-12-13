# Codio Spec - Alpha Version
note: this is subject to change as we progress.

A codio file is a zip of:

- An audio.mp3 file.
- A meta.json file.
- a workspace folder.
- A codio.json file.

#### audio.mp3
The audio file is, unsuprisingly, the audio recording part of codio.

#### meta.json
The meta.json file contains the following meta data about the codio:

* *name*: The name of the codio recording - a string.
* *length*: The length of the codio recording in milliseconds - a number.
* *date - an optional*: the time the codio was created - unix time in milliseconds.

Here is an example of a meta.json file:
```
{
  name: "How to use forEach",
  length: 24422,
}
```

#### codio.json

codio.json is where the  magic happens.

the codio.json file includes:
* *length*
* *actions*

actions are an array of codio actions.
Each codio actions includes:
* Relative file path - the file on which the action was performed - marked as *filePath*
* Relative time from beginning in milliseconds - when the operation should be done - marked as *time*

#### codio actions
There are 5 types of codio actions:
* textChanged - marked as text
* selectionChanged - marked as selection
* textEditorChanged - marked as editorChanged
* visibleRangeChanged - marked as visible

and experimental:
* *execution* - marked as execution



#### workspace folder

The workspace folder is includes the files on which the codio will perform its actions.
