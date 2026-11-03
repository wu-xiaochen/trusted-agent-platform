"""Static declarations only. This does not grant permissions or verify sources."""
import json
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT / 'contracts/business-task.schema.json').read_text())
Draft202012Validator.check_schema(SCHEMA)
VALIDATOR = Draft202012Validator(SCHEMA)


def validate_task(task):
    errors = [{'code': 'SCHEMA_INVALID', 'path': '/'.join(map(str, e.absolute_path)), 'message': e.message}
              for e in VALIDATOR.iter_errors(task)]
    if errors:
        return errors

    def add(code, path, message):
        errors.append({'code': code, 'path': path, 'message': message})

    for group in ['sources', 'objects', 'rules', 'actions', 'views']:
        ids = set()
        for item in task[group]:
            if item['id'] in ids:
                add('DUPLICATE_ID', group, item['id'])
            ids.add(item['id'])
    sources = {s['id']: s for s in task['sources']}
    objects = {o['id'] for o in task['objects']}
    rules = {r['id']: r for r in task['rules']}
    actions = {a['id'] for a in task['actions']}
    for obj in task['objects']:
        if obj['sourceId'] not in sources:
            add('UNKNOWN_SOURCE', obj['id'], obj['sourceId'])
    for rule in task['rules']:
        if rule['status'] == 'confirmed' and not rule.get('owner', '').strip():
            add('MISSING_RULE_OWNER', rule['id'], 'Confirmed rules need an identified owner')
    for view in task['views']:
        for component in view['components']:
            if 'objectId' in component and component['objectId'] not in objects:
                add('UNKNOWN_OBJECT', view['id'], component['objectId'])
            if 'actionId' in component and component['actionId'] not in actions:
                add('UNKNOWN_ACTION', view['id'], component['actionId'])
    for action in task['actions']:
        aid = action['id']; source = sources.get(action['sourceId'])
        if source is None:
            add('UNKNOWN_SOURCE', aid, action['sourceId'])
        if action['objectId'] not in objects:
            add('UNKNOWN_OBJECT', aid, action['objectId'])
        for rule_id in action['ruleIds']:
            if rule_id not in rules:
                add('UNKNOWN_RULE', aid, rule_id)
            elif action['enabled'] and rules[rule_id]['status'] != 'confirmed':
                add('UNCONFIRMED_RULE', aid, rule_id)
        if not action['enabled']:
            continue
        if task['lifecycle'] != 'published' or action['mode'] == 'draft-only':
            add('DRAFT_EXECUTION', aid, 'Drafts cannot enable commands')
        if source is not None and source['verification'] != 'verified':
            add('UNVERIFIED_SOURCE', aid, source['id'])
        if action['mode'] == 'auto' and (not action.get('automationPolicyRef') or action['approval'] != 'policy'):
            add('MISSING_AUTOMATION_POLICY', aid, 'Auto mode needs a server-resolved policy reference')
        if action['mode'] == 'confirm':
            if action['approval'] == 'policy':
                add('INVALID_APPROVAL_MODE', aid, 'Confirmation mode requires human confirmation or business approval')
            found = any(c['kind'] == 'action-confirmation' and c.get('actionId') == aid
                        for v in task['views'] for c in v['components'])
            if not found:
                add('MISSING_CONFIRMATION_COMPONENT', aid, 'Bind a trusted confirmation component')
        if action['idempotency'] == 'none' and (action['reconciliation'] != 'manual' or action['mode'] == 'auto'):
            add('UNSAFE_RETRY_CONTRACT', aid, 'Non-deduplicated writes require manual reconciliation and cannot be automatic')
    return errors
