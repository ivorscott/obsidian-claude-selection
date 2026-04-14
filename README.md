# Claude Selection

An [Obsidian](https://obsidian.md) plugin that captures your text selection and makes it available to [Claude Code](https://claude.ai/code) as context.

## How it works

When you highlight text in Obsidian, the plugin writes the selection to a `.claude-selection` file at the root of your vault. A Claude Code hook reads that file and injects the selected text — along with the source file path and line numbers — into your Claude Code session automatically.

This lets you highlight a passage in your notes, switch to the terminal, and ask Claude Code about it without any copy-pasting.

## Installation

### Via BRAT (recommended)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from the Obsidian community plugins browser
2. Open BRAT settings and click **Add Beta Plugin**
3. Paste `https://github.com/ivorscott/obsidian-claude-selection`
4. Enable **Claude Selection** in Settings > Community Plugins

### Via Claude Code

Install the [cc-marketplace](https://github.com/ivorscott/cc-marketplace) plugin
and run one command from your vault directory:

```
/plugin marketplace add ivorscott/cc-marketplace
/plugin install learner@cc-marketplace
/install-obsidian
```

This installs BRAT, obsidian-terminal, and configures everything automatically.
Restart Obsidian after — BRAT will download and enable this plugin on startup.

### Manual

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/ivorscott/obsidian-claude-selection/releases)
2. Copy both files to `.obsidian/plugins/claude-selection/` inside your vault
3. Enable **Claude Selection** in Settings > Community Plugins

## Setup

Add a `UserPromptSubmit` hook to your Claude Code `settings.json` to inject the selection automatically:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=\"$VAULT/.claude-selection\"; [ -f \"$FILE\" ] && echo \"<system-reminder>\\nThe user has selected the following text from their Obsidian notes:\\n\\n$(cat \"$FILE\")\\n</system-reminder>\" || true'"
          }
        ]
      }
    ]
  }
}
```

Replace `$VAULT` with the absolute path to your vault.

## Status bar

The plugin adds an indicator to the Obsidian status bar:

- `claude: no selection` — nothing highlighted
- `claude: 3 lines selected` — active selection being tracked

## Requirements

- Obsidian 1.0.0+
- Desktop only
- Claude Code CLI

## License

MIT
