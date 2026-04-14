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

### Manual

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/ivorscott/obsidian-claude-selection/releases)
2. Copy both files to `.obsidian/plugins/claude-selection/` inside your vault
3. Enable **Claude Selection** in Settings > Community Plugins

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

## Setup

The hook requires two files inside your vault:

**1. Create `.claude/hooks/inject-selection.py`:**

```python
#!/usr/bin/env python3
import sys, os

selection_file = os.path.join(os.getcwd(), '.claude-selection')

if not os.path.isfile(selection_file):
    sys.exit(0)

try:
    with open(selection_file, 'r', encoding='utf-8') as f:
        content = f.read().strip()
except Exception as e:
    print(f'claude-selection hook error: {e}', file=sys.stderr)
    sys.exit(0)

if not content:
    sys.exit(0)

parts = content.split('---\n', 1)
selected_text = parts[1].strip() if len(parts) > 1 else content
line_count = len(selected_text.splitlines())
sys.stderr.write(f'> {line_count} line{"s" if line_count != 1 else ""} of Obsidian context\n')

print(f'The user has selected the following text from their Obsidian notes:\n\n{content}')
```

**2. Create or update `.claude/settings.json`:**

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/inject-selection.py"
          }
        ]
      }
    ]
  }
}
```

Open Claude Code from your vault root so the hook can locate `.claude-selection` correctly.

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
