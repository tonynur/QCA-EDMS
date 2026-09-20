// ============================================================
// STATE GLOBAL APLIKASI
// ============================================================

let sessionToken = null;
let currentUser = null;
let initData = null;

let documentsCache = {};
let approvalCache = {};
let usersCache = {};
let nfiCache_ = {};
let siteReportEntriesCache = {};
let recycleBinCache = { documents: [], nfiEntries: [] };
let myTasksCache = null;
let historyRevisionsCache_ = [];

let approvalView = 'pending';
let globalProjectFilter = '';
let nfiQuickContinueOnly = false;
let recycleBinView = 'docs';
let siteReportInitialized = false;
let nfiZoomLevel = 100;
const selectedApprovalIds = new Set();

let notifPollTimer = null;
let myTasksPollTimer = null;
let searchDebounceTimer = null;
let nfiSearchDebounce = null;

const NFI_ZOOM_MIN = 60, NFI_ZOOM_MAX = 200, NFI_ZOOM_STEP = 10;

const NFI_OPTIONAL_COLS = [
  'area','type','issued','location','inspdate','itr',
  'itp','repsub','compdate','pic','remark'
];
const NFI_COL_CHECKBOX_MAP = {
  area:'nfiColArea', type:'nfiColType', issued:'nfiColIssued',
  location:'nfiColLocation', inspdate:'nfiColInspDate', itr:'nfiColItr',
  itp:'nfiColItp', repsub:'nfiColRepSub', compdate:'nfiColCompDate',
  pic:'nfiColPicAei', remark:'nfiColRemark'
};
