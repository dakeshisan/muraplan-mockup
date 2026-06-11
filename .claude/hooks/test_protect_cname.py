"""Test matrix for protect_cname.py. Run: python test_protect_cname.py"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
GUARD = os.path.join(HERE, "protect_cname.py")

BLOCK, ALLOW = 2, 0

CASES = [
    # (expected, tool_name, tool_input, project_dir, label)
    (BLOCK, "Write", {"file_path": "C:\\muraplan-mockup\\CNAME", "content": "x"}, "C:\\muraplan-mockup", "Write root CNAME, win root"),
    (BLOCK, "Write", {"file_path": "C:\\muraplan-mockup\\CNAME", "content": "x"}, "/c/muraplan-mockup", "Write root CNAME, posix root"),
    (BLOCK, "Edit", {"file_path": "/c/muraplan-mockup/CNAME", "old_string": "a", "new_string": "b"}, "/c/muraplan-mockup", "Edit root CNAME, posix path"),
    (BLOCK, "Edit", {"file_path": "/c/muraplan-mockup/CNAME", "old_string": "a", "new_string": "b"}, "C:\\muraplan-mockup", "Edit posix path, win root"),
    (BLOCK, "Write", {"file_path": "CNAME", "content": "x"}, "C:\\muraplan-mockup", "Write relative CNAME"),
    (ALLOW, "Write", {"file_path": "C:\\muraplan-mockup\\index.html", "content": "see CNAME docs"}, "C:\\muraplan-mockup", "html mentioning CNAME"),
    (ALLOW, "Write", {"file_path": "C:\\muraplan-mockup\\CNAME.bak", "content": "x"}, "C:\\muraplan-mockup", "CNAME.bak"),
    (ALLOW, "Write", {"file_path": "C:\\muraplan-mockup\\docs\\CNAME", "content": "x"}, "C:\\muraplan-mockup", "non-root docs/CNAME"),
    (ALLOW, "Write", {"file_path": "C:\\other\\CNAME", "content": "x"}, "C:\\muraplan-mockup", "CNAME in other repo"),
    (BLOCK, "Bash", {"command": "rm CNAME"}, "C:\\muraplan-mockup", "rm"),
    (BLOCK, "Bash", {"command": "rm -f ./CNAME"}, "C:\\muraplan-mockup", "rm -f ./"),
    (BLOCK, "Bash", {"command": "mv CNAME old"}, "C:\\muraplan-mockup", "mv away"),
    (BLOCK, "Bash", {"command": "mv old CNAME"}, "C:\\muraplan-mockup", "mv onto"),
    (BLOCK, "Bash", {"command": "sed -i s/a/b/ CNAME"}, "C:\\muraplan-mockup", "sed -i"),
    (BLOCK, "Bash", {"command": "perl -i -pe s/a/b/ CNAME"}, "C:\\muraplan-mockup", "perl -i"),
    (BLOCK, "Bash", {"command": "dd if=/dev/null of=CNAME"}, "C:\\muraplan-mockup", "dd of="),
    (BLOCK, "Bash", {"command": "truncate -s0 CNAME"}, "C:\\muraplan-mockup", "truncate"),
    (BLOCK, "Bash", {"command": "tee CNAME"}, "C:\\muraplan-mockup", "tee"),
    (BLOCK, "Bash", {"command": "echo x > CNAME"}, "C:\\muraplan-mockup", "redirect spaced"),
    (BLOCK, "Bash", {"command": "echo x >CNAME"}, "C:\\muraplan-mockup", "redirect glued"),
    (BLOCK, "Bash", {"command": "cat foo >> CNAME"}, "C:\\muraplan-mockup", "append"),
    (BLOCK, "Bash", {"command": "cp foo CNAME"}, "C:\\muraplan-mockup", "cp onto"),
    (BLOCK, "Bash", {"command": "git rm CNAME"}, "C:\\muraplan-mockup", "git rm"),
    (BLOCK, "Bash", {"command": "git mv CNAME x"}, "C:\\muraplan-mockup", "git mv"),
    (ALLOW, "Bash", {"command": "cat CNAME"}, "C:\\muraplan-mockup", "cat"),
    (ALLOW, "Bash", {"command": "grep -r CNAME ."}, "C:\\muraplan-mockup", "grep"),
    (ALLOW, "Bash", {"command": 'git commit -m "mv CNAME section to top of docs"'}, "C:\\muraplan-mockup", "commit msg with mv"),
    (ALLOW, "Bash", {"command": 'git commit -m "rm stale CNAME redirect config"'}, "C:\\muraplan-mockup", "commit msg with rm"),
    (ALLOW, "Bash", {"command": "git restore CNAME"}, "C:\\muraplan-mockup", "git restore"),
    (ALLOW, "Bash", {"command": "git checkout -- CNAME"}, "C:\\muraplan-mockup", "git checkout"),
    (ALLOW, "Bash", {"command": "git add CNAME"}, "C:\\muraplan-mockup", "git add"),
    (ALLOW, "Bash", {"command": "cp CNAME CNAME.backup"}, "C:\\muraplan-mockup", "cp backup (read)"),
    (ALLOW, "Bash", {"command": "echo build done > CNAME.log"}, "C:\\muraplan-mockup", "redirect to CNAME.log"),
    (ALLOW, "Bash", {"command": "mv old.html new-CNAME-page.html"}, "C:\\muraplan-mockup", "mv unrelated CNAME-ish name"),
    (ALLOW, "Bash", {"command": "ls -la"}, "C:\\muraplan-mockup", "plain bash"),
    (ALLOW, "Read", {"file_path": "C:\\muraplan-mockup\\CNAME"}, "C:\\muraplan-mockup", "Read CNAME"),
]

MALFORMED = [
    (BLOCK, '{"tool_name":"Write","tool_input":{"file_path":"C:\\muraplan-mockup\\CNAME"}}', "malformed JSON targeting CNAME fails closed"),
    (ALLOW, '{"tool_name":"Write","tool_input":{"file_path":"C:\\muraplan-mockup\\index.html"}}', "malformed JSON for other file allowed"),
]


def run_case(payload, project_dir):
    env = dict(os.environ, CLAUDE_PROJECT_DIR=project_dir)
    proc = subprocess.run(
        [sys.executable, GUARD], input=payload,
        capture_output=True, text=True, env=env,
    )
    return proc.returncode


def main():
    failures = 0
    for expected, tool, tool_input, root, label in CASES:
        payload = json.dumps({"tool_name": tool, "tool_input": tool_input})
        rc = run_case(payload, root)
        ok = rc == expected
        failures += 0 if ok else 1
        print(("PASS  " if ok else "FAIL  rc=%d want=%d  " % (rc, expected)) + label)
    for expected, payload, label in MALFORMED:
        rc = run_case(payload, "C:\\muraplan-mockup")
        ok = rc == expected
        failures += 0 if ok else 1
        print(("PASS  " if ok else "FAIL  rc=%d want=%d  " % (rc, expected)) + label)
    total = len(CASES) + len(MALFORMED)
    print("\n%d/%d passed" % (total - failures, total))
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
