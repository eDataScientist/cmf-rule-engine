import type { TreeNode } from '../types/tree';

interface ParsedLine {
  level: number;
  content: string;
}

export function parseFIGS(text: string): { title: string; root: TreeNode }[] {
  const treeStrings = text
    .split(/^\s*\+\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);

  const trees: { title: string; root: TreeNode }[] = [];

  for (const treeString of treeStrings) {
    const lines: ParsedLine[] = treeString
      .split('\n')
      .map((line) => {
        const indentMatch = line.match(/^\t*/);
        const level = indentMatch ? indentMatch[0].length : 0;
        const content = line.trim();
        return { level, content };
      })
      .filter((line) => line.content);

    if (lines.length === 0) continue;

    const titleMatch = lines[0].content.match(/\((Tree #\d+.*?)\)/);
    const title = titleMatch ? titleMatch[1] : 'Tree';

    const linesCopy = [...lines];
    const root = buildTreeRecursive(linesCopy, 0);

    if (root) {
      trees.push({ title, root });
    }
  }

  return trees;
}

function buildTreeRecursive(lines: ParsedLine[], currentLevel: number): TreeNode | null {
  if (!lines.length || lines[0].level < currentLevel) {
    return null;
  }

  const currentLine = lines.shift()!;

  if (currentLine.content.startsWith('Val:')) {
    const value = parseFloat(currentLine.content.replace('Val:', '').trim());
    return { value };
  }

  const condition = currentLine.content.replace(/\((split|root)\)/, '').trim();

  const true_branch = buildTreeRecursive(lines, currentLevel + 1);
  const false_branch = buildTreeRecursive(lines, currentLevel);

  if (!true_branch || !false_branch) {
    throw new Error(`Invalid tree structure at condition: ${condition}`);
  }

  return {
    condition,
    true_branch,
    false_branch,
  };
}
