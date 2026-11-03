import json
import sys
from pathlib import Path
from scripts.task_validator import ROOT, validate_task


def main():
    paths = [Path(p) for p in sys.argv[1:]] or sorted((ROOT / 'examples').glob('*/task.json'))
    if not paths:
        print('FAIL: no task declarations found', file=sys.stderr)
        return 1
    invalid = False
    for path in paths:
        try:
            task = json.loads(path.read_text())
            errors = validate_task(task)
        except (OSError, ValueError) as error:
            print(f'FAIL: {path}: {error}', file=sys.stderr)
            invalid = True
            continue
        if errors:
            print(f'FAIL: {path}\n{json.dumps(errors, ensure_ascii=False, indent=2)}', file=sys.stderr)
            invalid = True
        else:
            print(f'PASS: {path.name} — static declaration only; no runtime authorization or readiness asserted.')
    return int(invalid)


if __name__ == '__main__':
    raise SystemExit(main())
