'use strict';

const obsidian = require('obsidian');
const fs = require('fs');
const path = require('path');

class ClaudeSelectionPlugin extends obsidian.Plugin {
  async onload() {
    this.lastSelection = '';
    this.filePath = path.join(this.app.vault.adapter.basePath, '.claude-selection');

    // Keep selection highlight visible when editor loses focus
    this.selectionStyle = document.createElement('style');
    this.selectionStyle.textContent = `
      .cm-editor:not(.cm-focused) .cm-selectionBackground {
        background: rgba(100, 149, 237, 0.35) !important;
      }
    `;
    document.head.appendChild(this.selectionStyle);

    // Status bar — confirms the plugin is running
    this.statusBar = this.addStatusBarItem();
    this.statusBar.setText('claude: no selection');

    // Poll every 300ms — write file immediately when selection changes
    this.registerInterval(
      window.setInterval(() => this.checkSelection(), 300)
    );

    // Show popup when clicking into the terminal with an active selection
    this.registerDomEvent(document, 'mousedown', (e) => {
      if (!this.lastSelection) return;
      const editorEl = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView)?.containerEl;
      if (editorEl && editorEl.contains(e.target)) return; // clicked inside editor, ignore
      const lineCount = this.lastSelection.split('\n').length;
      new obsidian.Notice(`✦ ${lineCount} line${lineCount === 1 ? '' : 's'} of context active`, 3000);
    });
  }

  checkSelection() {
    const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
    if (!view) return;

    // Use native browser selection — works in all editor modes
    const domSel = window.getSelection();
    const sel = domSel && !domSel.isCollapsed ? domSel.toString() : '';

    if (!sel) {
      if (this.lastSelection !== '') {
        this.statusBar.setText('claude: no selection');
        this.lastSelection = '';
      }
      return;
    }

    if (sel === this.lastSelection) return; // unchanged

    this.lastSelection = sel;
    const lineCount = sel.split('\n').length;
    this.statusBar.setText(`claude: ${lineCount} line${lineCount === 1 ? '' : 's'} selected`);

    // Try to get line numbers from CM6 editor; fall back to unknown
    let lineRange = 'unknown';
    try {
      const from = view.editor.getCursor('from');
      const to = view.editor.getCursor('to');
      lineRange = (from.line + 1) + '-' + (to.line + 1);
    } catch (e) {}

    const content = [
      'file: ' + this.app.vault.adapter.basePath + '/' + view.file.path,
      'lines: ' + lineRange,
      '---',
      sel,
    ].join('\n');

    try {
      fs.writeFileSync(this.filePath, content, 'utf8');
      console.log('[claude-selection] wrote', lineCount, 'lines to', this.filePath);
    } catch (e) {
      new obsidian.Notice('[claude-selection] write error: ' + e.message);
      console.error('[claude-selection]', e);
    }
  }

  onunload() {
    if (this.selectionStyle) this.selectionStyle.remove();
  }
}

module.exports = ClaudeSelectionPlugin;
