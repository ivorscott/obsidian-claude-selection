# Claude Selection

Highlight text in Obsidian. Ask Claude Code about it — no copy-pasting.

A Claude Code hook reads your active selection and injects it as context into every prompt, along with the source file path and line numbers. Switch to the terminal and ask Claude Code about any passage in your notes without leaving your flow.

**Requires:** Obsidian 1.0.0+ · Desktop only · [Claude Code](https://claude.ai/code) CLI

## Installation

**Option 3 is the quickest.** Options 1 and 2 require completing the [Setup](#setup) section afterwards; Option 3 automates it.

### Option 1 — Via BRAT (recommended)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from the Obsidian community plugins browser
2. Open BRAT settings and click **Add Beta Plugin**
3. Paste `https://github.com/ivorscott/obsidian-claude-selection`
4. Enable **Claude Selection** in Settings > Community Plugins

Then complete the [Setup](#setup) section below.

### Option 2 — Manual

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/ivorscott/obsidian-claude-selection/releases)
2. Copy both files to `.obsidian/plugins/claude-selection/` inside your vault
3. Enable **Claude Selection** in Settings > Community Plugins

Then complete the [Setup](#setup) section below.

### Option 3 — Via Claude Code

Automates the full setup — no manual steps required.

Install the [cc-marketplace](https://github.com/ivorscott/cc-marketplace) plugin and run one command from your vault directory:

```
/plugin marketplace add ivorscott/cc-marketplace
/plugin install learner@cc-marketplace
/install-obsidian
```

This installs BRAT, obsidian-terminal, and the Claude Code hook files automatically.
Restart Obsidian after — BRAT will download and enable this plugin on startup.

## Setup

> **Skip this section if you used Option 3** — it was handled automatically.

The hook requires two files inside your vault:

**1. Create `.claude/hooks/inject-selection.py`:**

<details>
<summary><strong>inject-selection.py</strong></summary>

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

</details>

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

## Usage

Open Claude Code from your vault root. Highlight any text in Obsidian — the status bar confirms the selection is active:

- `claude: no selection` — nothing highlighted
- `claude: 3 lines selected` — context will be injected into your next prompt

## License

MIT
