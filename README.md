# 🎥 Screen Recorder

A simple and powerful Electron-based screen recording application that captures screen, webcam, and combined video. All recordings are saved with a UUID-named folder structure, and a completion UI allows users to access the saved folder with ease.

## 📽️ Demo
 https://drive.google.com/file/d/1QA0r9z62s2mHm-p9zBPHqDGHsC6VvVkW/view?usp=sharing

## 🚀 Features

- ✅ Record screen
- ✅ Record webcam
- ✅ Record both screen + webcam together
- ✅ Saves recordings in uniquely named (UUID) folders
- ✅ Simple and user-friendly interface

## 🛠️ Tech Stack

- **Electron.js** – Desktop application framework  
- **Node.js** – Backend logic  
- **JavaScript** – Application logic  
- **UUID** – To generate unique folder names  

## ⚠️ Limitations

While this screen recorder provides essential recording functionality, there are some known limitations:

- ❌ **No Audio Recording**: Currently, system audio and microphone input are not recorded. Support for audio input/output may require additional permission handling or native modules.
- 🎥 **No Recording Controls**: The app starts and stops recording automatically. Pause/resume or manual stop features are not yet implemented.
- 🖼️ **Limited UI/UX**: The user interface is minimal and lacks detailed configuration or customization options.
- 🔒 **Permission Handling**: On some systems (especially macOS), screen and webcam permissions must be manually granted in system settings.
- 🧪 **No Editing Tools**: There's no support for trimming, cropping, or editing the recordings post-capture.


## 🧪 Setup Instructions

```bash
# Clone the repository
git clone https://github.com/NandiniBure/electron-screen-recorder.git

# Install dependencies
npm install

# Run the application
npm start
