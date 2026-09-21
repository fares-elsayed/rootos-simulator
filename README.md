# RootOS Simulator

A React desktop simulation built as an individual first-year university project by **Fares Elsayed Ali**, with AI assistance.

RootOS brings together desktop ideas inspired by macOS visuals, Linux customization and Windows-style shortcuts in one interface. It simulates operating-system concepts inside an application; it does not boot or combine real operating-system kernels.

## Features

- Desktop, dock and draggable windows with minimize/maximize controls.
- Virtual files and directories with create, read, edit, rename and delete operations.
- Browser-local file persistence through `localStorage`.
- Simulated processes with PIDs, priorities, sleep/wake and termination controls.
- In-app terminal, file manager and text editor.
- Simulated CPU, memory, storage, energy and device views.
- An Electron entry point for desktop development and packaging.

## Run locally

Install Node.js and npm, then run:

```sh
npm ci
npm start
```

Open `http://localhost:3000` and let the simulated boot sequence finish. Double-click a desktop app or select it from the dock.

For a production browser build:

```sh
npm run build
```

The output is in `build/`. Serve this directory with a static web server.

For Electron development:

```sh
npm run electron-dev
```

To open a built version in Electron:

```sh
npm run build
npm run electron
```

`npm run dist` contains desktop packaging configuration. Platform installers have not been validated as part of the portfolio preparation.

## Try the terminal

```text
pwd
mkdir demo
touch demo/note.txt
echo hello > demo/note.txt
cat demo/note.txt
nano demo/note.txt
ps
```

The editor supports Ctrl+S/Ctrl+O to save and Ctrl+X to close. Terminal Up/Down arrows recall command history. Commands operate on the application's virtual state, not the host shell.

## Structure

```text
src/SystemCore.js   Virtual filesystem, process lifecycle and simulated metrics
src/RootOS.jsx      Desktop, windows, applications and terminal UI
src/index.js       React entry point
public/            HTML shell and desktop wallpaper
electron/main.js   Electron window and development/production loading
core.test.cjs      Filesystem persistence and process lifecycle smoke tests
```

## Validation

```sh
npm test
npm run build
```

During portfolio preparation, the core smoke checks passed and a production build completed using the available installed dependencies. The build reported two existing lint warnings: a missing default switch case and an unused `notify` function. A fresh dependency installation, a full interactive UI walkthrough and desktop installers were not validated in that environment.

## Simulation boundaries

CPU, RAM and energy values are simulated, including random changes; they are not measurements of the user's machine. The scheduling behavior uses energy thresholds to sleep/wake processes. A `round-robin` label in the model is not a full implementation of that algorithm. File paths and terminal commands implement a limited educational model rather than a POSIX-compatible shell/filesystem. Clearing the application's browser storage removes saved virtual files.

## Development context

This was an individual university project developed with AI assistance. Portfolio preparation added documentation and core smoke checks, aligned the terminal help with implemented commands, and adjusted Electron loading and asset paths. The project is presented as an educational simulation, not a production operating system.
