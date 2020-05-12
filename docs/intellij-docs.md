# Codio Intellij

## Getting Started

TODO!
## Architecture

The Codio Intellij plugin consists of three separate parts:

- [Codio Format Player/Recorder](#codio-format-playerrecorder)

- [User Interface](#user-interface)

- [Filesystem Handler](#filesystem)



## Codio Format Player/Recorder

### Overview

**Recorder**

The Codio recorder records intellij events, such as textChanged, cursorPositionChanged etc, as well as audio, using ffmpeg. Those events save any relevant data for the event (e.g where and how the text was changed, what the selection range is, etc.) and the time the event happened. Those events are saved in a timeline - an array of editor events.

Once the recording ends, the timeline of events is serialized and saved into a codio.json file, the audio recording is saved into an audio.mp3 file, and also a meta.json file is saved, which contains the codio name and metadata. Those files are then zipped into codio zip file.

**Player**

The Codio player starts with unzipping and deserializing the codio timeline. The player can then run through the timeline. When running through the timeline, a timer is created for every event. Each event goes through the event dispatcher, where it is applied to the intellij IDE using the intellij platform API (e.g a textChanged event will change the text of a document using the intellij API).

**Lets see some code...**

The Codio player and recorder are the core of how Codio works. Their logic is separated into several modules:

* Codio Events
* Timeline
* Frame
* Player
* Recorder

Fred Brooks once said: *"Show me your code and conceal your data structures and I shall continue to be mystified. Show me your data structures, and I won't usually need your code. It'll be obvious"* <sup>1</sup>

With this in mind, we will start with the data structures:

### Timeline

The [Codio timeline](../codio-intellij/src/main/kotlin/com/wix/codio/CodioTimeline.kt) is composed of an array of codio events and the initial frame of the IDE (more about [frame](#codio-frame) soon).

The same file currently includes the Timeline utils as well.

### Codio Events
Codio is a recording of editor events and audio. The editor events are recorded by listening to the intellij API event listeners and by creating Codio events from that data. On the player side, we take those Codio events and dispatch them, using the intellij API, to emulate the same change we listened to.

The codioEvents package contains:
- The [Codio Events Data Structure Classes](../codio-intellij/src/main/kotlin/com/wix/codio/codioEvents/CodioEvents.kt)

  - The Definition of the codio events data structures.
  - Currently this includes 5 different events.

- A Codio [Event Dispatcher](../codio-intellij/src/main/kotlin/com/wix/codio/codioEvents/CodioEventsDispatcher.kt)

  - The event dispatcher takes a codio event and applies it to the editor.

- A Codio [Event Creator]((../codio-intellij/src/main/kotlin/com/wix/codio/codioEvents/CodioEventsCreator.kt))
  - The event creator takes raw data from intellij API listeners (e.g documentListener, selectionListener) and creates codio events.

### Codio Frame

### Player

[The player](../codio-intellij/src/main/kotlin/com/wix/codio/Player.kt) is the play controller - the glue that holds together the audio player, the event dispatcher moving into frames, and time. It also serves as an interface with functions such as play, rewind, forward, playFrom, and pause.

### Recorder

## FileSystem

### What happens on Save Codio

### What happens on Load Codio

## User Interface

### Tool Window

### Codio Notifier






<sup>1</sup>
He Actually used "flowcharts" and "tables", but the point is the same. Credit goes to Eric S. Reymond, The Cathedral and The Bazaar.
