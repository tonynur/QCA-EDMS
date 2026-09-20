// ============================================================
// KONSTANTA STRING
// ============================================================

const STATUS = Object.freeze({
  PENDING:    'Pending',
  APPROVED:   'Approved',
  REJECTED:   'Rejected',
  SUPERSEDED: 'Superseded'
});

const LIFECYCLE = Object.freeze({
  DRAFT:      'Draft',
  IN_REVIEW:  'In Review',
  APPROVED:   'Approved',
  REJECTED:   'Rejected',
  SUPERSEDED: 'Superseded',
  ARCHIVED:   'Archived',
  OBSOLETE:   'Obsolete',
  DELETED:    'Deleted'
});

const ROLE = Object.freeze({
  ADMIN:     'Admin',
  MANAGER:   'Manager',
  QAQC:      'QA/QC Engineer',
  INSPECTOR: 'Inspector',
  CLIENT:    'Client/Konsultan'
});

const USER_STATUS = Object.freeze({
  ACTIVE:   'Active',
  PENDING:  'Pending',
  INACTIVE: 'Inactive'
});

const NFI_RESULT = Object.freeze({
  PASS:     'Pass',
  FAIL:     'Fail',
  CONTINUE: 'Continue',
  PENDING:  'Pending',
  NA:       'N/A'
});

const NFI_STATUS = Object.freeze({
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  CLOSED:      'Closed',
  CANCELLED:   'Cancelled'
});

const CONF = Object.freeze({
  PUBLIC:       'Public',
  INTERNAL:     'Internal',
  CONFIDENTIAL: 'Confidential',
  RESTRICTED:   'Restricted'
});

const TRANSMITTAL_STATUS = Object.freeze({
  SENT:         'Sent',
  ACKNOWLEDGED: 'Acknowledged',
  CLOSED:       'Closed'
});

const SITE_STATUS = Object.freeze({
  ACC:      'ACC (Accepted)',
  REJECT:   'Reject / Repair',
  PROGRESS: 'On Progress'
});

const TOAST = Object.freeze({
  SUCCESS: 'success',
  ERROR:   'error'
});

const THEME = Object.freeze({
  LIGHT: 'light',
  DARK:  'dark'
});

const ROLE_OPTIONS = [ROLE.ADMIN, ROLE.MANAGER, ROLE.QAQC, ROLE.INSPECTOR, ROLE.CLIENT];
