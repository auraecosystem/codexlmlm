# Use Pinggy with AI Agents

> Install the Pinggy skill (npx skills add https://pinggy.io) or the Pinggy MCP server so AI coding agents like Claude Code, Cursor, Claude Desktop, VS Code, and Windsurf can create and manage tunnels.
> Source: https://pinggy.io/docs/ai_agents/


# Use Pinggy with AI Agents

Pinggy plugs into AI coding agents two ways. Install the **skill** to give an agent ready-made instructions for using Pinggy, or add the **MCP server** to let the agent create and manage tunnels directly through tool calls. Both can be installed together.

<div style="background-color:#eef3fe;border:1px solid #dce6fc;border-left:3px solid #3b6fe0;border-radius:14px;padding:1rem 1.25rem;margin:1.25rem 0;">
<p style="margin:0 0 0.5rem;font-size:0.8125rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#2f58b8;">Install the skill in any agent</p>
<div class="highlight"><pre tabindex="0" class="chroma"><code class="language-bash" data-lang="bash"><span class="line"><span class="cl">npx skills add https://pinggy.io
</span></span></code></pre></div>
</div>


| | Skill | MCP server |
|---|---|---|
| What it is | Packaged instructions and reference docs (SSH, CLI, SDK, every flag and tunnel type) | A running server that exposes Pinggy as live tools the agent can call |
| The agent can | Read how Pinggy works and run the commands itself | Start, stop, and inspect tunnels; share folders; manage tokens, without leaving the chat |
| Install with | `npx skills add https://pinggy.io` | `uvx` config per client (below) |
| Best for | Teaching an agent how Pinggy works | Letting an agent operate Pinggy directly |

If unsure, start with the skill. Add the MCP server when the agent should run tunnels on its own.

## Install the Pinggy skill

Skills are packaged instructions an agent loads on demand. The Pinggy skill is published under the [Agent Skills](https://github.com/vercel-labs/skills)
 standard at `https://pinggy.io/.well-known/skills/`. The `skills` CLI fetches the manifest, downloads the skill files, and drops them into the agent's skills directory. The only prerequisite is Node.js.

#### npx (any agent)

```bash
npx skills add https://pinggy.io
```

#### Claude Code and Cursor

The same command works. The CLI detects the agent and writes the skill to its skills directory, for example `~/.claude/skills/pinggy/` for Claude Code.

#### Manual

Download the files listed in `https://pinggy.io/.well-known/skills/index.json` from `https://pinggy.io/.well-known/skills/pinggy/` and place `SKILL.md` (with the `scripts/` and `references/` folders) in the agent's skills directory.

## Install the Pinggy MCP server

The MCP (Model Context Protocol) server lets agents like Claude Code, Claude Desktop, and Cursor create and control Pinggy tunnels in natural language.

**Prerequisites:** Python 3.10 or newer and [uv](https://docs.astral.sh/uv/). Install uv with:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Nothing is installed globally. Each client runs `uvx`, which fetches and runs `pinggy-mcp` on demand.

#### Claude Code

```bash
claude mcp add pinggy-mcp -- uvx --from git+https://github.com/Pinggy-io/pinggy_mcp.git pinggy-mcp
```

Verify it registered:

```bash
claude mcp list
```

#### Claude Desktop

Edit the Claude Desktop config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pinggy-mcp": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/Pinggy-io/pinggy_mcp.git",
        "pinggy-mcp"
      ]
    }
  }
}
```

Restart Claude Desktop. The `pinggy` server appears in the MCP indicator below the input box.

#### Cursor

Edit `~/.cursor/mcp.json` for a global config, or `.cursor/mcp.json` in a project root for a per-project config:

```json
{
  "mcpServers": {
    "pinggy-mcp": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/Pinggy-io/pinggy_mcp.git",
        "pinggy-mcp"
      ]
    }
  }
}
```

#### VS Code

Edit `~/.vscode/mcp.json` (global) or `.vscode/mcp.json` in a project root:

```json
{
  "servers": {
    "pinggy-mcp": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/Pinggy-io/pinggy_mcp.git",
        "pinggy-mcp"
      ]
    }
  }
}
```

Reload the window (**Developer: Reload Window** from the command palette).

#### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "pinggy-mcp": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/Pinggy-io/pinggy_mcp.git",
        "pinggy-mcp"
      ]
    }
  }
}
```

Restart Windsurf after saving.

## What you can do

Once the MCP server is installed, ask the agent in plain language:

- "Expose my dev server on port 3000."
- "Open a TCP tunnel to localhost:22."
- "Share my ~/Downloads folder over the internet."
- "Log in to Pinggy."
- "List my active tunnels."
- "Only allow traffic from 1.2.3.4 to my tunnel."
- "Stop the tunnel."

## Plain-text docs for LLMs

Every Pinggy doc page is also published as Markdown at the same path with an `index.md` suffix, for example [https://pinggy.io/docs/cli/index.md](https://pinggy.io/docs/cli/index.md). The site also serves a single overview at [https://pinggy.io/llms.txt](https://pinggy.io/llms.txt) that an agent can fetch to learn how Pinggy works.

## See also

- [Pinggy CLI](/docs/cli/)
- [Node.js SDK](https://pinggy-io.github.io/sdk-nodejs/) and [Python SDK](https://pypi.org/project/pinggy/)
- MCP server source and issues: [github.com/Pinggy-io/pinggy_mcp](https://github.com/Pinggy-io/pinggy_mcp) (early and experimental, feedback welcome)
