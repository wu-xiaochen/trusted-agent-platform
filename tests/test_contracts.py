import copy
import unittest
from scripts.task_validator import validate_task


def task():
    return {
        'schemaVersion': '0.1.0', 'id': 'maintenance.spare-request', 'version': '0.1.0',
        'title': '维修备件申请', 'lifecycle': 'published',
        'sources': [{'id': 'inventory', 'kind': 'http', 'verification': 'verified'}],
        'objects': [{'id': 'inventory.part', 'sourceId': 'inventory'}],
        'rules': [{'id': 'request.quantity', 'status': 'confirmed', 'owner': 'business-owner'}],
        'actions': [{'id': 'inventory.request-spare', 'sourceId': 'inventory', 'objectId': 'inventory.part',
                     'enabled': True, 'mode': 'confirm', 'ruleIds': ['request.quantity'],
                     'idempotency': 'source-key', 'reconciliation': 'source-query', 'approval': 'human-confirmation'}],
        'views': [{'id': 'request', 'components': [
            {'kind': 'form', 'objectId': 'inventory.part', 'actionId': 'inventory.request-spare'},
            {'kind': 'action-confirmation', 'actionId': 'inventory.request-spare'}]}]
    }


class ContractTests(unittest.TestCase):
    def assert_code(self, value, code):
        self.assertIn(code, {e['code'] for e in validate_task(value)})

    def test_valid_declaration_does_not_assert_runtime_authorization(self):
        self.assertEqual(validate_task(task()), [])

    def test_unknown_source(self):
        value = task(); value['actions'][0]['sourceId'] = 'missing'
        self.assert_code(value, 'UNKNOWN_SOURCE')

    def test_unknown_ui_action(self):
        value = task(); value['views'][0]['components'][0]['actionId'] = 'hidden.write'
        self.assert_code(value, 'UNKNOWN_ACTION')

    def test_unconfirmed_rule_blocks_dependent_enabled_action(self):
        value = task(); value['rules'][0]['status'] = 'unknown'
        self.assert_code(value, 'UNCONFIRMED_RULE')

    def test_unrelated_unknown_rule_does_not_block(self):
        value = task(); value['rules'].append({'id': 'future.ordering', 'status': 'unknown'})
        self.assertEqual(validate_task(value), [])

    def test_draft_cannot_enable_commands(self):
        value = task(); value['lifecycle'] = 'draft'
        self.assert_code(value, 'DRAFT_EXECUTION')

    def test_auto_needs_explicit_policy_reference(self):
        value = task(); value['actions'][0].update(mode='auto', approval='policy')
        self.assert_code(value, 'MISSING_AUTOMATION_POLICY')

    def test_disabled_draft_can_retain_unknowns(self):
        value = task(); value['lifecycle'] = 'draft'; value['actions'][0]['enabled'] = False
        value['rules'][0]['status'] = 'unknown'; value['views'][0]['components'] = []
        self.assertEqual(validate_task(value), [])

    def test_confirmation_widget_required(self):
        value = task(); value['views'][0]['components'].pop()
        self.assert_code(value, 'MISSING_CONFIRMATION_COMPONENT')

    def test_duplicate_ids_are_rejected(self):
        value = task(); value['actions'].append(copy.deepcopy(value['actions'][0]))
        self.assert_code(value, 'DUPLICATE_ID')

    def test_arbitrary_ui_scripts_rejected(self):
        value = task(); value['views'][0]['components'].append({'kind': 'script', 'code': 'arbitrary-code'})
        self.assert_code(value, 'SCHEMA_INVALID')

    def test_secrets_not_allowed_in_task_declaration(self):
        value = task(); value['sources'][0]['password'] = 'not-a-real-secret'
        self.assert_code(value, 'SCHEMA_INVALID')

    def test_incomplete_task_rejected(self):
        self.assert_code({'id': 'partial'}, 'SCHEMA_INVALID')

    def test_enabled_source_must_be_declared_verified(self):
        value = task(); value['sources'][0]['verification'] = 'unverified'
        self.assert_code(value, 'UNVERIFIED_SOURCE')

    def test_confirmed_rule_has_owner(self):
        value = task(); del value['rules'][0]['owner']
        self.assert_code(value, 'MISSING_RULE_OWNER')

    def test_non_deduplicated_writes_need_manual_reconciliation(self):
        value = task(); value['actions'][0]['idempotency'] = 'none'
        self.assert_code(value, 'UNSAFE_RETRY_CONTRACT')


if __name__ == '__main__':
    unittest.main()
