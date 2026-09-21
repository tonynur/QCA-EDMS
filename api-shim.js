// ============================================================================
// SUPABASE SHIM — google.script.run → Supabase
// ============================================================================

var SUPABASE_URL = 'https://hbbnysvjssovyvxxrf.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYnlueXN2anNzb3Z5eHZ4eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDg4ODIsImV4cCI6MjEwNTQ4NDg4Mn0.ySIReCcPYo2gaMxIRrek32OELT_WklS9-LmY9Ioi5mU';

var sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── API FUNCTIONS ─────────────────────────────────────────────────────────
var API_FUNCTIONS = {

  // ===== AUTH =====
  login: async function (email, password) {
    var res = await sbClient.auth.signInWithPassword({ email: email, password: password });
    if (res.error) return { success: false, message: res.error.message };
    var profile = await sbClient.from('users').select('*').eq('id', res.data.user.id).single();
    return {
      success: true,
      sessionToken: res.data.session.access_token,
      user: {
        userId: res.data.user.id,
        email: res.data.user.email,
        fullName: (profile.data && profile.data.full_name) || email,
        role: (profile.data && profile.data.role) || 'Inspector',
        status: (profile.data && profile.data.status) || 'Active',
        canApprove: (profile.data && profile.data.can_approve) || false
      }
    };
  },

  registerUser: async function (p) {
    var res = await sbClient.auth.signUp({
      email: p.email,
      password: p.password,
      options: { data: { full_name: p.fullName, role: p.role } }
    });
    if (res.error) return { success: false, message: res.error.message };
    if (res.data.user) {
      await sbClient.from('users').insert({
        id: res.data.user.id,
        email: p.email,
        full_name: p.fullName,
        role: p.role,
        status: 'Active'
      });
    }
    return { success: true, message: 'Pendaftaran berhasil. Silakan login.' };
  },

  logout: async function () {
    await sbClient.auth.signOut();
    return { success: true };
  },

  getSessionUser: async function (token) {
    var res = await sbClient.auth.getUser(token);
    if (res.error || !res.data.user) return { success: false };
    var profile = await sbClient.from('users').select('*').eq('id', res.data.user.id).single();
    return {
      success: true,
      user: {
        userId: res.data.user.id,
        email: res.data.user.email,
        fullName: (profile.data && profile.data.full_name) || res.data.user.email,
        role: (profile.data && profile.data.role) || 'Inspector',
        canApprove: (profile.data && profile.data.can_approve) || false
      }
    };
  },

  // ===== PLACEHOLDER — Fungsi lain menyusul di Sesi 5 =====
  getInitData: async function () {
    return {
      success: true, companyName: 'QC-CMS',
      canUpload: true, canApprove: true, isAdmin: true,
      canCreateTransmittal: true, canViewReports: true, canArchive: true,
      canManageNfi: true, rootFolderConfigured: true,
      projects: [], disciplines: [], documentTypes: [],
      inspectionResults: ['Pass', 'Fail'],
      transmittalPurposes: [],
      nfiTypeOfInspection: [],
      nfiResultOptions: ['Pass', 'Fail', 'Continue', 'Pending', 'N/A'],
      nfiStatusOptions: ['Open', 'In Progress', 'Closed', 'Cancelled'],
      siteStatusOptions: ['ACC (Accepted)', 'Reject / Repair', 'On Progress'],
      unreadNotificationCount: 0, defaultRetentionYears: 5
    };
  },
  getDocumentList: async function () { return []; },
  getStatusCounts: async function () { return { Pending: 0, Approved: 0, Rejected: 0, Superseded: 0 }; },
  getDashboardStats: async function () {
    return { totalPending: 0, totalApproved: 0, totalRejected: 0, rfiOverdueCount: 0,
             mrirPassRate: null, avgApprovalDays: null, byType: [], pendingByProject: [] };
  },
  getEnhancedDashboardStats: async function () {
    return { success: true, trend: [], topProjects: [], byDiscipline: [], alerts: [], totalActive: 0 };
  },
  getExecutiveDashboard: async function () {
    return { success: true,
      totals: { total: 0, open: 0, closed: 0, canceled: 0, other: 0, totalNFI: 0,
        totalITR: 0, itrEmpty: 0, projects: 0, projectsActive: 0, projectsInactive: 0,
        projectsAll: 0, projectsCritical: 0 },
      projects: [], disciplines: [], lastUpdate: new Date().toISOString() };
  },
  getPendingApprovals: async function () { return []; },
  getApprovalHistory: async function () { return []; },
  getNFILogList: async function () { return []; },
  getProjectsListForUI: async function () { return { success: true, items: [] }; },
  getMyTasks: async function () {
    return { success: true, userName: 'User',
      summary: { grandTotal: 0, totalApprovals: 0, totalPending: 0, totalRejected: 0, totalNfiOpen: 0 },
      pendingApprovals: [], myPendingDocs: [], myRejectedDocs: [], myOpenNfi: [], canApprove: false };
  },
  getMyNotifications: async function () { return []; }
};

// ─── PROXY google.script.run ──────────────────────────────────────────────
(function () {
  function makeChain(successFn, failureFn) {
    return new Proxy({}, {
      get: function (target, prop) {
        if (prop === 'withSuccessHandler') return function (fn) { return makeChain(fn, failureFn); };
        if (prop === 'withFailureHandler') return function (fn) { return makeChain(successFn, fn); };
        if (prop === 'withUserObject') return function () { return makeChain(successFn, failureFn); };
        return function () {
          var args = Array.prototype.slice.call(arguments);
          var fn = API_FUNCTIONS[String(prop)];
          if (!fn) {
            console.warn('[API] Not implemented:', prop);
            if (successFn) successFn({ success: false, message: 'Not implemented: ' + prop });
            return;
          }
          Promise.resolve(fn.apply(null, args))
            .then(function (res) { if (successFn) successFn(res); })
            .catch(function (err) { if (failureFn) failureFn(err); else console.error(err); });
        };
      }
    });
  }
  window.google = window.google || {};
  window.google.script = { run: makeChain(null, null) };
})();
