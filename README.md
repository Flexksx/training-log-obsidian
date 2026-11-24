# Training Log

Training Log is an Obsidian plugin for recording gym sets in your notes and viewing your activity over time. Your notes remain the source of truth. The dashboard shows consistency, weekly time and calories, muscle volume, and exercise progress.

## Get started

1. Install and enable Training Log from Obsidian's community plugins.
2. In the plugin settings, enter the folder containing your activity notes. Leave it empty to use the whole vault. Subfolders are included.
3. Open the training dashboard using the dumbbell ribbon icon. Select **Start today's workout** to create a workout note, then add exercises and log sets in the note.

Workout notes use the `workout` type and a date property. The dashboard also recognises notes with the `capoeira` type. Add `duration` and `kcal` properties to activity notes to include their time and calories in the dashboard.

## Development

Install Nix and enter the project environment with `nix develop`. Run `just lint`, `just test all`, and `just build all` to check and build the plugin. Run `just start training-log` to rebuild on changes.
