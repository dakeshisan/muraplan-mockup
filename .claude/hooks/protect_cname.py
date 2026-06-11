"""PreToolUse guard for the root CNAME file.

CNAME binds the custom domain atlas.atamuragroup.kz to GitHub Pages.
Collaborators have no admin access to Settings -> Pages, so losing the file
means re-attaching the domain and waiting for a new TLS certificate.

Lexical guard against accidental edits, not a sandbox: file writes done
inside interpreters (python/node one-liners) cannot be caught here.
"""
import json
import os
import re
import shlex
import sys

MSG = (
    "BLOCKED: CNAME holds the custom-domain binding for atlas.atamuragroup.kz. "
    "Do not edit, overwrite, delete or move it. Restoring it requires re-attaching "
    "the domain and a new TLS certificate (collaborators have no repo admin). "
    "If the domain itself must change, get explicit confirmation from the user first."
)

READ_ONLY = {
    "cat", "head", "tail", "less", "more", "grep", "egrep", "fgrep",
    "ls", "stat", "file", "wc", "diff", "cmp", "od", "xxd", "nl",
    "md5sum", "shasum", "sha256sum", "echo", "printf", "test", "[",
}
GIT_BLOCKED_SUBCOMMANDS = {"rm", "mv", "clean"}
GIT_FLAGS_WITH_VALUE = {"-c", "-C", "--git-dir", "--work-tree", "--namespace"}
SEPARATORS = {"|", "||", "&&", ";", "&"}


def block():
    sys.stderr.write(MSG + "\n")
    sys.exit(2)


def canon(path):
    q = str(path).replace("\\", "/")
    # Git Bash drive form /c/... -> c:/... (Windows only; on POSIX it is a real path)
    if os.name == "nt" and len(q) >= 3 and q[0] == "/" and q[1].isalpha() and q[2] == "/":
        q = q[1] + ":" + q[2:]
    return os.path.normcase(os.path.normpath(q))


def is_protected(path):
    if not path:
        return False
    q = str(path).replace("\\", "/").rstrip("/")
    if q.split("/")[-1] != "CNAME":
        return False
    root = os.environ.get("CLAUDE_PROJECT_DIR")
    is_abs = q.startswith("/") or (len(q) > 1 and q[1] == ":")
    if root and is_abs:
        return canon(q) == canon(root + "/CNAME")
    return True


def token_refs_cname(token):
    if is_protected(token):
        return True
    # dd of=CNAME, --output=CNAME and similar key=value forms
    if "=" in token and is_protected(token.split("=", 1)[1]):
        return True
    return False


def redirect_target_protected(seg):
    for i, t in enumerate(seg):
        m = t.lstrip("0123456789")
        if not m.startswith(">"):
            continue
        rest = m.lstrip(">&")
        target = rest if rest else (seg[i + 1] if i + 1 < len(seg) else "")
        if is_protected(target):
            return True
    return False


def git_subcommand(seg):
    skip_next = False
    for t in seg[1:]:
        if skip_next:
            skip_next = False
            continue
        if t in GIT_FLAGS_WITH_VALUE:
            skip_next = True
            continue
        if t.startswith("-"):
            continue
        return t
    return ""


def check_bash(cmd):
    try:
        tokens = shlex.split(cmd, posix=True)
    except ValueError:
        tokens = cmd.split()

    segments, cur = [], []
    for t in tokens:
        if t in SEPARATORS:
            if cur:
                segments.append(cur)
            cur = []
        else:
            cur.append(t)
    if cur:
        segments.append(cur)

    for seg in segments:
        if redirect_target_protected(seg):
            block()
        refs = [i for i, t in enumerate(seg) if token_refs_cname(t)]
        if not refs:
            continue
        prog = os.path.basename(seg[0].replace("\\", "/")).lower()
        if prog in READ_ONLY:
            continue
        if prog == "git":
            if git_subcommand(seg) in GIT_BLOCKED_SUBCOMMANDS:
                block()
            continue
        if prog == "cp":
            # only overwriting CNAME (as destination = last arg) is destructive
            if refs[-1] == len(seg) - 1:
                block()
            continue
        block()


def main():
    raw = sys.stdin.read()
    try:
        data = json.loads(raw)
    except Exception:
        # Malformed input must not fail open for direct file writes.
        if re.search(r'"(file_path|notebook_path)"\s*:\s*"[^"]*CNAME"', raw):
            block()
        sys.exit(0)

    tool = data.get("tool_name") or ""
    tool_input = data.get("tool_input") or {}

    if tool in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
        path = tool_input.get("file_path") or tool_input.get("notebook_path")
        if is_protected(path):
            block()
    elif tool == "Bash":
        check_bash(tool_input.get("command") or "")

    sys.exit(0)


if __name__ == "__main__":
    main()
