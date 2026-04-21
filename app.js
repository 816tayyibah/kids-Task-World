// ═══════════════════════════════════════════════════════════════
//  Kids Planner — app.js
//  Firebase 10 + Google Auth + Firestore global sync
//  All bugs fixed:
//    ✅ Child selector highlights correct child
//    ✅ Each child remembers their own selected day independently
//    ✅ Fatima's schedule double-nesting auto-flattened
//    ✅ Stars double-count guard + always credited to correct child
// ═══════════════════════════════════════════════════════════════

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ┌──────────────────────────────────────────────────────────────┐
// │  STEP 1 — Replace with YOUR Firebase config                  │
// │  Firebase Console → Project Settings → Your Apps → SDK      │
// └──────────────────────────────────────────────────────────────┘
const firebaseConfig = {
    apiKey: "AIzaSyDxJH52XYnaTUYLyr6XQD5-IbNbO5FQcdA",
    authDomain: "kids-planner-dbc5e.firebaseapp.com",
    projectId: "kids-planner-dbc5e",
    storageBucket: "kids-planner-dbc5e.firebasestorage.app",
    messagingSenderId: "947453162305",
    appId: "1:947453162305:web:5ec37298f0ee2f06a167c0",
    measurementId: "G-8ZNWEW0WHM"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ═══════════════════════════════════════════════════════════════
//  PLANNER CONFIG DATA
//  (default schedules & tasks shown to every new family)
// ═══════════════════════════════════════════════════════════════
const plannerData = {
  days: [
    { key: "sun", label: "Sun ☀️" },
    { key: "mon", label: "Mon" },
    { key: "tue", label: "Tue" },
    { key: "wed", label: "Wed" },
    { key: "thu", label: "Thu" },
    { key: "fri", label: "Fri" },
    { key: "sat", label: "Sat 🌤️" },
  ],
  tabs: ["Schedule", "Checklist", "My Stars"],
  defaultSchedule: {
    mon: [
      ["05:30","Fajr Namaz","A peaceful start to the day.","lavender"],
      ["07:15","Wake up for school","Stretch, smile, and get ready.","peach"],
      ["07:45","Go to school","Backpack, water bottle, big energy.","mint"],
      ["14:30","Lunch","Wash up, then enjoy your meal.","mint"],
      ["14:50","Zohar Namaz","Quiet prayer time.","lavender"],
      ["15:00","Sleep - Qailula","A short recharge nap.","sky"],
      ["16:45","Snack time","Snack and reset.","peach"],
      ["17:00","Study / Homework","Learning with focus.","sky"],
      ["18:15","Asr Namaz","Pause and pray.","rose"],
      ["19:15","Maghrib Namaz","Faith and reflection.","rose"],
      ["20:15","Dinner","Family table time.","mint"],
      ["20:45","Isha Namaz","A calm evening prayer.","rose"],
      ["21:45","Play time","Free fun after a great day.","peach"],
      ["22:45","Brush your teeth","Freshen up and get ready for bed.","sky"],
      ["23:00","Sleep","Good night and rest well.","lavender"],
    ],
    tue: [["05:30","Fajr Namaz","A peaceful start to the day.","lavender"],["07:15","Wake up for school","Stretch, smile, and get ready.","peach"],["07:45","Go to school","Backpack, water bottle, big energy.","mint"],["14:30","Lunch","Wash up, then enjoy your meal.","mint"],["14:50","Zohar Namaz","Quiet prayer time.","lavender"],["15:00","Sleep - Qailula","A short recharge nap.","sky"],["16:45","Snack time","Snack and reset.","peach"],["17:00","Study / Homework","Learning with focus.","sky"],["18:15","Asr Namaz","Pause and pray.","rose"],["19:15","Maghrib Namaz","Faith and reflection.","rose"],["20:15","Dinner","Family table time.","mint"],["20:45","Isha Namaz","A calm evening prayer.","rose"],["21:45","Play time","Free fun after a great day.","peach"],["22:45","Brush your teeth","Freshen up and get ready for bed.","sky"],["23:00","Sleep","Good night and rest well.","lavender"]],
    wed: [["05:30","Fajr Namaz","A peaceful start to the day.","lavender"],["07:15","Wake up for school","Stretch, smile, and get ready.","peach"],["07:45","Go to school","Backpack, water bottle, big energy.","mint"],["14:30","Lunch","Wash up, then enjoy your meal.","mint"],["14:50","Zohar Namaz","Quiet prayer time.","lavender"],["15:00","Sleep - Qailula","A short recharge nap.","sky"],["16:45","Snack time","Snack and reset.","peach"],["17:00","Study / Homework","Learning with focus.","sky"],["18:15","Asr Namaz","Pause and pray.","rose"],["19:15","Maghrib Namaz","Faith and reflection.","rose"],["20:15","Dinner","Family table time.","mint"],["20:45","Isha Namaz","A calm evening prayer.","rose"],["21:45","Play time","Free fun after a great day.","peach"],["22:45","Brush your teeth","Freshen up and get ready for bed.","sky"],["23:00","Sleep","Good night and rest well.","lavender"]],
    thu: [["05:30","Fajr Namaz","A peaceful start to the day.","lavender"],["07:15","Wake up for school","Stretch, smile, and get ready.","peach"],["07:45","Go to school","Backpack, water bottle, big energy.","mint"],["14:30","Lunch","Wash up, then enjoy your meal.","mint"],["14:50","Zohar Namaz","Quiet prayer time.","lavender"],["15:00","Sleep - Qailula","A short recharge nap.","sky"],["16:45","Snack time","Snack and reset.","peach"],["17:00","Study / Homework","Learning with focus.","sky"],["18:15","Asr Namaz","Pause and pray.","rose"],["19:15","Maghrib Namaz","Faith and reflection.","rose"],["20:15","Dinner","Family table time.","mint"],["20:45","Isha Namaz","A calm evening prayer.","rose"],["21:45","Play time","Free fun after a great day.","peach"],["22:45","Brush your teeth","Freshen up and get ready for bed.","sky"],["23:00","Sleep","Good night and rest well.","lavender"]],
    fri: [["05:30","Fajr Namaz","A peaceful start to the day.","lavender"],["07:15","Wake up for school","Stretch, smile, and get ready.","peach"],["07:45","Go to school","Backpack, water bottle, big energy.","mint"],["13:00","Bath","Freshen up and relax after school.","sky"],["13:30","Lunch","Quiet meal time.","mint"],["14:00","Jumma Namaz","Spiritual prayer time.","rose"],["14:45","Qailula (Nap)","Short recharge nap for energy.","sky"],["16:45","Snack Time","Snack and reset.","peach"],["17:00","Study / Homework","Learning with focus.","sky"],["18:15","Asr Namaz","Pause and pray.","rose"],["19:15","Maghrib Namaz","Faith and reflection.","rose"],["20:15","Dinner","Family table time.","mint"],["20:45","Isha Namaz","A calm evening prayer.","rose"],["21:45","Play Time","Free fun after a great day.","peach"],["22:45","Brush your teeth","Freshen up and get ready for bed.","sky"],["23:00","Sleep","Good night and rest well.","lavender"]],
    sat: [["05:30","Fajr Namaz","Happy weekend start","lavender"],["09:30","Wake up","Peaceful start","peach"],["10:00","Freshen up + Breakfast","Ready for a creative day","sky"],["10:30","Quran / Study","Learning with focus","mint"],["13:30","Zohar Namaz","Peaceful prayer","rose"],["14:00","Homework","Family support time","mint"],["14:30","Lunch","Healthy meal + rest","mint"],["17:30","Asr Namaz","Afternoon prayer","rose"],["18:00","Free Time / Play","Relax and enjoy","peach"],["19:15","Maghrib Namaz","Evening prayer","rose"],["19:25","Family Time","Talk & relax together","mint"],["21:00","Isha Namaz","End the day peacefully","lavender"],["22:45","Brush your teeth","Freshen up and get ready for bed.","sky"],["23:00","Sleep","Good night and rest well.","lavender"]],
    sun: [["05:30","Fajr Namaz","Happy weekend start","lavender"],["10:30","Wake up","Peaceful start to the day","peach"],["10:45","Breakfast","Get ready with energy","sky"],["11:00","House chores / Mom help","Help at home with care","mint"],["11:30","Bath","Fresh and clean start","sky"],["12:00","Quran / Study","Learning with focus","rose"],["14:00","Zohar Namaz","Midday prayer and peace","rose"],["14:30","Lunch","Healthy meal + rest","mint"],["15:00","Mobile Time","Short entertainment break","peach"],["16:00","Play time","Fun and relaxing time","peach"],["17:30","Asr Namaz","Evening prayer","rose"],["18:00","Family Time","Talk & relax together","mint"],["19:00","Maghrib Namaz","Evening prayer","lavender"],["21:30","Isha Namaz","End the day peacefully","lavender"],["22:45","Brush your teeth","Freshen up and get ready for bed.","sky"],["23:00","Sleep","Good night and rest well.","lavender"]],
  },
  defaultTasks: [
    ["Make your bed",          "2 stars"],
    ["Finish homework",        "3 stars"],
    ["Read for 15 minutes",    "2 stars"],
    ["Help set the table",     "1 star"],
    ["Complete namaz routine", "4 stars"],
  ],
  awards: [
    { id:"starter", icon:"🌟", title:"Shiny Starter",    goal:5,  text:"Earn 5 stars to unlock your first award." },
    { id:"helper",  icon:"🦸", title:"Helping Hero",     goal:12, text:"Finish kind helper jobs around the house." },
    { id:"focus",   icon:"🎯", title:"Focus Friend",     goal:20, text:"Stay with your checklist and timer." },
    { id:"champ",   icon:"👑", title:"Routine Champion", goal:30, text:"A whole week of strong routines." },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  APP STATE  (loaded per family from Firestore)
// ═══════════════════════════════════════════════════════════════
let state = {
  child:    null,
  dayByChild: {},   // BUG FIX: each child has their own selected day
  tab:      "Schedule",
  children: [],
  schedules:            {},  // { mon:[...], tue:[...], ... }
  starsByChild:         {},  // { childName: number }
  badgesByChild:        {},  // { childName: string[] }
  completedTasks:       {},  // { "child__date__day__index": true }
  completedScheduleStars: {}, // { lineKey: true }
  timer: { duration: 15 * 60, remaining: 15 * 60, intervalId: null },
};

// BUG FIX: state.day is a per-child getter/setter
Object.defineProperty(state, "day", {
  get() { return this.dayByChild[this.child] ?? "mon"; },
  set(v) { this.dayByChild[this.child] = v; },
});

let currentUser    = null;
let userDocRef     = null;
let saveTimeout    = null;
let unsubscribeFn  = null;
let deferredInstallPrompt = null;

// ═══════════════════════════════════════════════════════════════
//  DOM REFERENCES
// ═══════════════════════════════════════════════════════════════
const loadingScreen        = document.getElementById("loadingScreen");
const authScreen           = document.getElementById("authScreen");
const appScreen            = document.getElementById("appScreen");
const googleSignInBtn      = document.getElementById("googleSignInBtn");
const signOutBtn           = document.getElementById("signOutBtn");
const authError            = document.getElementById("authError");
const userAvatar           = document.getElementById("userAvatar");
const userAvatarPlaceholder= document.getElementById("userAvatarPlaceholder");
const userNameEl           = document.getElementById("userName");
const syncDot              = document.getElementById("syncDot");
const childSelector        = document.getElementById("childSelector");
const daySelector          = document.getElementById("daySelector");
const viewSelector         = document.getElementById("viewSelector");
const scheduleView         = document.getElementById("scheduleView");
const checklistView        = document.getElementById("checklistView");
const starsView            = document.getElementById("starsView");
const todayLabel           = document.getElementById("todayLabel");
const starCount            = document.getElementById("starCount");
const badgeCount           = document.getElementById("badgeCount");
const resetProgressBtn     = document.getElementById("resetProgressBtn");
const scheduleEditorModal  = document.getElementById("scheduleEditorModal");
const editorModalTitle     = document.getElementById("editorModalTitle");
const editorDaySelector    = document.getElementById("editorDaySelector");
const scheduleEditorContent= document.getElementById("scheduleEditorContent");
const closeScheduleEditorBtn = document.getElementById("closeScheduleEditorBtn");
const installAppBtn        = document.getElementById("installAppBtn");
let editorDay = "mon";

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════
googleSignInBtn.addEventListener("click", async () => {
  authError.style.display = "none";
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (err) {
    console.error(err);
    authError.style.display = "block";
  }
});

signOutBtn.addEventListener("click", async () => {
  if (unsubscribeFn) unsubscribeFn();
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    userDocRef  = doc(db, "families", user.uid);
    showUserInfo(user);
    await loadFamilyData();
    showApp();
  } else {
    currentUser = null;
    userDocRef  = null;
    showAuth();
  }
});

function showUserInfo(user) {
  userNameEl.textContent = user.displayName?.split(" ")[0] || "Family";
  if (user.photoURL) {
    userAvatar.src = user.photoURL;
    userAvatar.style.display = "block";
    userAvatarPlaceholder.style.display = "none";
  } else {
    userAvatarPlaceholder.textContent = (user.displayName || "F")[0].toUpperCase();
    userAvatarPlaceholder.style.display = "flex";
    userAvatar.style.display = "none";
  }
}

function showAuth() {
  loadingScreen.style.display = "none";
  authScreen.style.display    = "flex";
  appScreen.style.display     = "none";
}

function showApp() {
  loadingScreen.style.display = "none";
  authScreen.style.display    = "none";
  appScreen.style.display     = "block";
  renderChildManager();
  renderSelectors();
  renderAll();
  subscribeToRemoteChanges();
}

// ═══════════════════════════════════════════════════════════════
//  FIRESTORE — LOAD & SAVE
// ═══════════════════════════════════════════════════════════════
async function loadFamilyData() {
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const d = snap.data();
      state.children               = d.children               || [];
      state.starsByChild           = d.starsByChild           || {};
      state.badgesByChild          = d.badgesByChild          || {};
      state.completedTasks         = d.completedTasks         || {};
      state.completedScheduleStars = d.completedScheduleStars || {};
      state.dayByChild             = d.dayByChild             || {};

      // ✅ Clean nested arrays immediately on load
      state.schedules = ensureSharedSchedule(
        cleanSharedSchedules(d.schedules || {})
      );

      // ✅ Save the cleaned version back to Firestore right away
      await setDoc(userDocRef, buildPayload(), { merge: true });
      console.log("✅ Cleaned and re-saved schedules to Firestore");

    } else {
      state.children = [];
      state.dayByChild = {};
      state.starsByChild = {};
      state.badgesByChild = {};
      state.schedules = ensureSharedSchedule({});
      await setDoc(userDocRef, buildPayload());
    }
    state.child = state.children[0] ?? null;
  } catch (err) {
    console.error("Error loading family data:", err);
  }
}

// Real-time listener — keeps all devices in sync
function subscribeToRemoteChanges() {
  if (unsubscribeFn) unsubscribeFn();
  unsubscribeFn = onSnapshot(userDocRef, (snap) => {
    if (!snap.exists()) return;
    const d = snap.data();
    state.children               = d.children               || state.children;
    state.starsByChild           = d.starsByChild           || state.starsByChild;
    state.badgesByChild          = d.badgesByChild          || state.badgesByChild;
    state.completedTasks         = d.completedTasks         || state.completedTasks;
    state.completedScheduleStars = d.completedScheduleStars || state.completedScheduleStars;
    state.dayByChild             = d.dayByChild             || state.dayByChild;

    // ✅ Always clean on every snapshot received
    state.schedules = ensureSharedSchedule(
      cleanSharedSchedules(d.schedules || state.schedules)
    );

    if (!state.children.includes(state.child)) state.child = state.children[0] ?? null;
    renderChildManager();
    renderSelectors();
    renderAll();
  });
}

function removeNestedArrays(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => removeNestedArrays(item));
  } else if (typeof obj === "object" && obj !== null) {
    const newObj = {};
    for (let key in obj) {
      newObj[key] = removeNestedArrays(obj[key]);
    }
    return newObj;
  }
  return obj;
}

function buildPayload() {
  const cleanSchedules = {};

  plannerData.days.forEach(({ key }) => {
    cleanSchedules[key] = flattenEntries(
      state.schedules[key] ?? []
    ).map(scheduleEntryToObject).filter(Boolean);
  });

  // Convert all keys to plain objects (Firestore safe)
  return {
    children:               [...state.children],
    schedules:              cleanSchedules,
    starsByChild:           { ...state.starsByChild },
    badgesByChild:          { ...state.badgesByChild },
    completedTasks:         { ...state.completedTasks },
    completedScheduleStars: { ...state.completedScheduleStars },
    dayByChild:             { ...state.dayByChild },
    updatedAt:              new Date().toISOString(),
  };
}
function flattenEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return [];

  // Recursively unwrap until we get a flat list of string-tuples
  function unwrap(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return [];

    const first = arr[0];

    // Case 1: first item is a string → this IS a single entry, wrap it
    if (typeof first === "string") return [arr];

    // Case 2: first item is array whose first item is a STRING
    // → arr is already [ ["05:30", "Fajr", ...], ["07:15", ...] ]
    if (Array.isArray(first) && typeof first[0] === "string") return arr;

    // Case 2b: first item is a plain object like { time, title, detail, color }
    // → arr is already Firestore-safe and only needs normalization
    if (first && typeof first === "object" && !Array.isArray(first)) return arr;

    // Case 3: first item is array whose first item is ALSO an array
    // → arr is wrapped one extra level, unwrap and retry
    if (Array.isArray(first) && Array.isArray(first[0])) return unwrap(first);

    return [];
  }

  const unwrapped = unwrap(entries);

  return unwrapped
    .map(normalizeScheduleEntry)
    .filter(Boolean);
}
function cleanSharedSchedules(schedulesObj) {
  if (!schedulesObj || typeof schedulesObj !== "object") return {};
  const clean = {};

  plannerData.days.forEach(({ key }) => {
    let sourceEntries = schedulesObj[key];

    if (!sourceEntries) {
      for (const maybeChild in schedulesObj) {
        if (schedulesObj[maybeChild] && typeof schedulesObj[maybeChild] === "object") {
          const nestedEntries = schedulesObj[maybeChild][key];
          if (flattenEntries(nestedEntries ?? []).length > 0) {
            sourceEntries = nestedEntries;
            break;
          }
        }
      }
    }

    const cleaned = flattenEntries(sourceEntries ?? []);
    console.log(`📅 shared ${key}: ${cleaned.length} entries`);
    clean[key] = cleaned;
  });

  return clean;
}

function normalizeScheduleEntry(entry) {
  if (Array.isArray(entry) && typeof entry[0] === "string") {
    return [
      String(entry[0] ?? ""),
      String(entry[1] ?? ""),
      String(entry[2] ?? ""),
      String(entry[3] ?? "peach"),
    ];
  }

  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    return [
      String(entry.time ?? ""),
      String(entry.title ?? ""),
      String(entry.detail ?? ""),
      String(entry.color ?? "peach"),
    ];
  }

  return null;
}

function scheduleEntryToObject(entry) {
  const normalized = normalizeScheduleEntry(entry);
  if (!normalized) return null;

  const [time, title, detail, color] = normalized;
  return { time, title, detail, color };
}

function ensureSharedSchedule(schedulesObj) {
  const safeSchedules = { ...schedulesObj };

  plannerData.days.forEach(({ key }) => {
    const cleanedEntries = flattenEntries(safeSchedules[key] ?? []);
    safeSchedules[key] = cleanedEntries.length > 0
      ? cleanedEntries
      : JSON.parse(JSON.stringify(plannerData.defaultSchedule[key] ?? []));
  });

  return safeSchedules;
}

// Debounced save — batches rapid changes into one Firestore write
function scheduleSave() {
  syncDot.classList.add("saving");
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await setDoc(userDocRef, buildPayload(), { merge: true });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      syncDot.classList.remove("saving");
    }
  }, 800);
}

// ═══════════════════════════════════════════════════════════════
//  CHILD MANAGER
// ═══════════════════════════════════════════════════════════════
function renderChildManager() {
  const container = document.getElementById("childManager");
  if (!container) return;
  container.innerHTML = `
    <div class="child-manager">
      <div class="child-manager-title">👧 Manage Children</div>
      <div class="child-manager-list">
        ${state.children.map(child => `
          <div class="child-tag">
            <span>${child}</span>
            <button class="remove-child-btn" type="button" data-child="${child}" aria-label="Remove ${child}">✕</button>
          </div>
        `).join("") || `<span style="color:#aaa;font-size:.82rem">No children added yet.</span>`}
      </div>
      <div class="child-manager-add">
        <input id="newChildNameInput" class="child-name-input" type="text" placeholder="Child's name…" maxlength="30" />
        <button id="addChildBtn" class="add-child-btn" type="button">+ Add</button>
      </div>
    </div>`;

  document.getElementById("addChildBtn").addEventListener("click", addChild);
  document.getElementById("newChildNameInput").addEventListener("keydown", e => {
    if (e.key === "Enter") addChild();
  });
  container.querySelectorAll(".remove-child-btn").forEach(btn =>
    btn.addEventListener("click", () => removeChild(btn.dataset.child))
  );
}

function addChild() {
  const input = document.getElementById("newChildNameInput");
  const name  = input.value.trim();
  if (!name) return;
  if (state.children.includes(name)) { alert(`"${name}" is already added.`); return; }

  state.children.push(name);
  state.starsByChild[name]  = 0;
  state.badgesByChild[name] = [];
  state.dayByChild[name]    = "mon";
  state.child = name;
  input.value = "";

  scheduleSave();
  renderChildManager();
  renderSelectors();
  renderAll();
}

function removeChild(name) {
  if (state.children.length <= 1) { alert("You need at least one child."); return; }
  if (!confirm(`Remove "${name}" and all their data?`)) return;

  state.children = state.children.filter(c => c !== name);
  delete state.starsByChild[name];
  delete state.badgesByChild[name];
  delete state.dayByChild[name];

  Object.keys(state.completedTasks).forEach(k => {
    if (k.startsWith(`${name}__`)) delete state.completedTasks[k];
  });
  Object.keys(state.completedScheduleStars).forEach(k => {
    if (k.startsWith(`${name}__`)) delete state.completedScheduleStars[k];
  });

  state.child = state.children[0];
  scheduleSave();
  renderChildManager();
  renderSelectors();
  renderAll();
}

// ═══════════════════════════════════════════════════════════════
//  SELECTORS
//  BUG FIX: capture activeChild/activeDay at render time so
//  picker buttons always compare against the correct value
// ═══════════════════════════════════════════════════════════════
function renderSelectors() {
  if (!state.child && state.children.length > 0) state.child = state.children[0];

  const activeChild = state.child;   // capture NOW
  const activeDay   = state.day;     // capture NOW (per-child getter)
  const activeTab   = state.tab;

  renderPicker(
    childSelector,
    state.children.map(c => ({ label: c, value: c })),
    activeChild,
    value => { state.child = value; renderSelectors(); renderAll(); }
  );

  renderPicker(
    daySelector,
    plannerData.days.map(d => ({ label: d.label, value: d.key })),
    activeDay,
    value => { state.day = value; scheduleSave(); renderSelectors(); renderAll(); }
  );

  renderPicker(
    viewSelector,
    plannerData.tabs.map(t => ({ label: t, value: t })),
    activeTab,
    value => { state.tab = value; renderSelectors(); renderAll(); }
  );
}

function renderPicker(container, items, activeItem, onPick) {
  container.innerHTML = "";
  items.forEach(item => {
    const btn = document.createElement("button");
    btn.type      = "button";
    btn.className = `picker-button${item.value === activeItem ? " active" : ""}`;
    btn.textContent = item.label;
    btn.disabled  = Boolean(item.disabled);
    btn.addEventListener("click", () => { if (!item.disabled) onPick(item.value); });
    container.appendChild(btn);
  });
}

// ═══════════════════════════════════════════════════════════════
//  RENDER ALL
// ═══════════════════════════════════════════════════════════════
function renderAll() {
  if (!state.child) {
    scheduleView.innerHTML = `<div class="empty-state"><strong>Welcome! 👋</strong><span>Add a child above to get started.</span></div>`;
    checklistView.innerHTML = "";
    starsView.innerHTML = "";
    [scheduleView, checklistView, starsView].forEach(p => p.classList.remove("active"));
    scheduleView.classList.add("active");
    return;
  }

  todayLabel.textContent     = new Intl.DateTimeFormat("en-GB", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  }).format(new Date());
  starCount.textContent  = getCurrentStars();
  badgeCount.textContent = getCurrentBadges().length;
  resetProgressBtn.textContent = `Reset ${state.child}`;

  renderSchedule();
  renderChecklist();
  renderStars();

  [scheduleView, checklistView, starsView].forEach(p => p.classList.remove("active"));
  if (state.tab === "Schedule")  scheduleView.classList.add("active");
  if (state.tab === "Checklist") checklistView.classList.add("active");
  if (state.tab === "My Stars")  starsView.classList.add("active");
}

// ═══════════════════════════════════════════════════════════════
//  SCHEDULE RENDER
//  BUG FIX: capture renderChild/renderDay in closure so star
//  buttons always credit the correct child even if state changes
// ═══════════════════════════════════════════════════════════════
function renderSchedule() {
  const renderChild = state.child;  // captured for closures below
  const renderDay   = state.day;
  const dayLabel    = plannerData.days.find(d => d.key === renderDay)?.label || renderDay;

  const header = `
    <div class="schedule-head">
      <div>
        <h2 class="panel-title">${dayLabel} Schedule</h2>
        <p class="panel-note">Showing the shared family schedule for ${renderChild}. Tap <strong>+⭐ Add</strong> only during that activity's live time slot.</p>
      </div>
      <button id="openScheduleEditorBtn" class="open-editor-btn" type="button">Edit Schedule</button>
    </div>`;

  const entries = getScheduleEntries(renderChild, renderDay);

  if (entries.length === 0) {
    scheduleView.innerHTML = `${header}
      <div class="empty-state">
        <strong>No schedule yet.</strong>
        <span>Tap "Edit Schedule" to add the ${dayLabel} family routine.</span>
      </div>`;
    attachScheduleViewEvents();
    return;
  }

  const list     = document.createElement("div");
  list.className = "schedule-list";
  const template = document.getElementById("scheduleItemTemplate");

  entries.forEach(([time, titleText, detail, color], index) => {
    const node    = template.content.firstElementChild.cloneNode(true);
    const lineKey = buildScheduleLineKey(renderChild, renderDay, time, titleText);
    const nextTime = entries[index + 1]?.[0] ?? null;
    const ls      = getScheduleLineState(renderDay, time, nextTime, lineKey);

    node.dataset.color = color;
    node.querySelector(".time-chip").textContent = time;
    node.querySelector("h3").textContent         = titleText;
    node.querySelector("p").textContent          = detail;
    if (titleText.toLowerCase().includes("namaz")) node.classList.add("namaz");

    const btn = node.querySelector(".mini-star");
    btn.disabled    = ls.disabled;   // BUG FIX: set BEFORE attaching listener
    btn.textContent = ls.label;
    node.classList.toggle("schedule-earned", ls.completed);
    node.classList.toggle("schedule-locked",  ls.expired || ls.notToday);

    btn.addEventListener("click", () => {
      if (ls.disabled) return;
      if (state.completedScheduleStars[lineKey]) return; // BUG FIX: double-click guard
      state.completedScheduleStars[lineKey] = true;
      addStarsForChild(renderChild, 1);               // BUG FIX: use captured child
      scheduleSave();
      renderAll();
      launchConfetti();
    });

    list.appendChild(node);
  });

  scheduleView.innerHTML = header;
  scheduleView.appendChild(list);
  attachScheduleViewEvents();
}

function getScheduleEntries(child, day) {
  const raw = state.schedules[day] ?? [];
  return flattenEntries(raw);
}
function attachScheduleViewEvents() {
  document.getElementById("openScheduleEditorBtn")?.addEventListener("click", () => {
    editorDay = state.day;
    openScheduleEditor();
  });
}

// ═══════════════════════════════════════════════════════════════
//  CHECKLIST RENDER
// ═══════════════════════════════════════════════════════════════
function renderChecklist() {
  const tasks     = plannerData.defaultTasks;
  const capturedChild = state.child;
  const capturedDay   = state.day;

  const taskList = document.createElement("div");
  taskList.className = "task-list";
  const template = document.getElementById("taskItemTemplate");

  tasks.forEach(([task, stars], index) => {
    const key  = `${capturedChild}__${getTodayDateKey()}__${capturedDay}__${index}`;
    const done = Boolean(state.completedTasks[key]);
    const node = template.content.firstElementChild.cloneNode(true);

    node.classList.toggle("done", done);
    node.querySelector("input").checked      = done;
    node.querySelector("strong").textContent = task;
    node.querySelector("small").textContent  = done ? "Completed. Great job!" : "Ready for today";
    node.querySelector(".task-points").textContent = stars;

    node.querySelector("input").addEventListener("change", () => {
      toggleTask(key, node, stars, capturedChild);
    });
    taskList.appendChild(node);
  });

  checklistView.innerHTML = `
    <div class="checklist-grid">
      <section class="task-panel">
        <h2 class="panel-title">Checklist</h2>
        <p class="panel-note">Finish little missions and collect stars.</p>
      </section>
      <aside class="side-panel">
        <div class="focus-card">
          <h3>Focus Timer</h3>
          <p>15 minutes of superhero concentration.</p>
          <div class="timer-ring" id="timerRing">
            <div class="timer-value" id="timerValue">${formatTime(state.timer.remaining)}</div>
          </div>
          <div class="focus-buttons">
            <button class="start-btn" type="button" id="startTimerBtn">${state.timer.intervalId ? "Pause" : "Start"}</button>
            <button class="reset-btn" type="button" id="resetTimerBtn">Reset</button>
          </div>
        </div>
      </aside>
    </div>`;

  checklistView.querySelector(".task-panel").appendChild(taskList);
  checklistView.querySelector("#startTimerBtn").addEventListener("click", toggleTimer);
  checklistView.querySelector("#resetTimerBtn").addEventListener("click", resetTimer);
  updateTimerVisual();
}

function toggleTask(key, node, stars, childName) {
  const starVal     = parseInt(stars);
  const alreadyDone = Boolean(state.completedTasks[key]);

  if (alreadyDone) {
    delete state.completedTasks[key];
    node.classList.remove("done");
    node.querySelector("small").textContent = "Ready for today";
    addStarsForChild(childName, -starVal);
  } else {
    state.completedTasks[key] = true;
    node.classList.add("done");
    node.querySelector("small").textContent = "Completed. Great job!";
    addStarsForChild(childName, starVal);
    launchConfetti();
  }

  scheduleSave();
  renderAll();
}

// ═══════════════════════════════════════════════════════════════
//  STARS RENDER
// ═══════════════════════════════════════════════════════════════
function renderStars() {
  const stars    = getCurrentStars();
  const unlocked = plannerData.awards.filter(a => stars >= a.goal).map(a => a.id);
  state.badgesByChild[state.child] = unlocked;
  badgeCount.textContent = unlocked.length;

  const cards = plannerData.awards.map(award => {
    const ok = unlocked.includes(award.id);
    return `
      <article class="badge-card${ok ? "" : " locked"}">
        <div class="badge-icon">${award.icon}</div>
        <h3>${award.title}</h3>
        <p>${award.text}</p>
        <p><strong>${ok ? "Unlocked! 🎉" : award.goal + " stars needed"}</strong></p>
      </article>`;
  }).join("");

  starsView.innerHTML = `
    <div class="stars-grid">
      <section class="task-panel">
        <h2 class="panel-title">My Stars</h2>
        <p class="panel-note">${state.child} has earned <strong>${stars}</strong> shiny stars so far.</p>
        <div class="badge-grid">${cards}</div>
      </section>
      <aside class="side-panel">
        <div class="focus-card">
          <h3>Reward Chest</h3>
          <p>Every 10 stars = one fun reward choice.</p>
          <div class="streak-row">
            <div class="streak-bubble">${Math.floor(stars/10)} reward${Math.floor(stars/10)===1?"":"s"}</div>
            <div class="streak-bubble">${10 - (stars % 10 || 10)} to next</div>
          </div>
        </div>
        <div class="reward-banner">
          <div>
            <strong>Today's prize idea</strong>
            <span>Pick from stickers, extra play time, drawing time, or a family treat.</span>
          </div>
          <div class="badge-icon">🎁</div>
        </div>
      </aside>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
//  SCHEDULE EDITOR MODAL
// ═══════════════════════════════════════════════════════════════
function openScheduleEditor()  { scheduleEditorModal.hidden = false; renderScheduleEditorModal(); }
function closeScheduleEditor() { scheduleEditorModal.hidden = true; }

closeScheduleEditorBtn.addEventListener("click", closeScheduleEditor);
scheduleEditorModal.addEventListener("click", e => {
  if (e.target?.dataset?.closeEditor === "true") closeScheduleEditor();
});
window.addEventListener("keydown", e => {
  if (e.key === "Escape" && !scheduleEditorModal.hidden) closeScheduleEditor();
});

function renderScheduleEditorModal() {
  const dayLabel = plannerData.days.find(d => d.key === editorDay)?.label || editorDay;
  editorModalTitle.textContent = `Edit ${state.child}'s ${dayLabel} schedule`;

  renderPicker(
    editorDaySelector,
    plannerData.days.map(d => ({ label: d.label, value: d.key })),
    editorDay,
    v => { editorDay = v; renderScheduleEditorModal(); }
  );

  const entries = getScheduleEntries(state.child, editorDay);
  const rows = entries.length > 0
    ? entries.map(([t, title, detail, color]) => buildEditorRow(t, title, detail, color)).join("")
    : buildEditorRow("07:00", "", "", "peach");

  scheduleEditorContent.innerHTML = `
    <div class="schedule-editor">
      <div class="schedule-editor-head">
        <h3>Edit ${state.child}'s ${dayLabel} routine</h3>
        <p>Changes sync instantly to all devices.</p>
      </div>
      <div id="scheduleEditorRows" class="editor-rows">${rows}</div>
      <div class="editor-actions">
        <button id="addScheduleRowBtn"   class="editor-add-btn"   type="button">Add Line</button>
        <button id="saveScheduleBtn"     class="editor-save-btn"  type="button">Save</button>
        <button id="resetScheduleDayBtn" class="editor-reset-btn" type="button">Reset Day</button>
      </div>
    </div>`;

  const rowsEl = document.getElementById("scheduleEditorRows");
  document.getElementById("addScheduleRowBtn").addEventListener("click", () => {
    rowsEl.insertAdjacentHTML("beforeend", buildEditorRow("07:00","","","peach"));
    attachRemoveHandlers(rowsEl);
  });
  document.getElementById("saveScheduleBtn").addEventListener("click", saveScheduleEditor);
  document.getElementById("resetScheduleDayBtn").addEventListener("click", resetScheduleDay);
  attachRemoveHandlers(rowsEl);
}

function buildEditorRow(time, title, detail, color) {
  const colorOptions = ["lavender","peach","mint","sky","rose"]
    .map(c => `<option value="${c}"${c===color?" selected":""}>${c[0].toUpperCase()+c.slice(1)}</option>`)
    .join("");
  return `<div class="editor-row">
    <input data-field="time"   type="time"  value="${time}">
    <input data-field="title"  type="text"  value="${escAttr(title)}"  placeholder="Activity title">
    <input data-field="detail" type="text"  value="${escAttr(detail)}" placeholder="Detail">
    <select data-field="color">${colorOptions}</select>
    <button class="editor-remove-btn" type="button">Remove</button>
  </div>`;
}

function attachRemoveHandlers(container) {
  container.querySelectorAll(".editor-remove-btn").forEach(btn => {
    btn.onclick = () => {
      const row = btn.closest(".editor-row");
      if (container.children.length === 1) {
        row.querySelectorAll("input").forEach(i => i.value = i.type==="time"?"07:00":"");
        return;
      }
      row.remove();
    };
  });
}

function saveScheduleEditor() {
  let entries = Array.from(document.querySelectorAll("#scheduleEditorRows .editor-row"))
    .map(row => {
      const time   = row.querySelector('[data-field="time"]').value;
      const title  = row.querySelector('[data-field="title"]').value.trim();
      const detail = row.querySelector('[data-field="detail"]').value.trim();
      const color  = row.querySelector('[data-field="color"]').value;

      if (!time || !title) return null;

      return {
        time,
        title,
        detail: detail || "Daily routine.",
        color
      };
    })
    .filter(Boolean);

  // 🔥 IMPORTANT: convert to NORMAL flat array (NO nested arrays)
  const flatEntries = entries.map(e => [
    e.time,
    e.title,
    e.detail,
    e.color
  ]);

  state.schedules[editorDay] = flatEntries;

  scheduleSave();
  renderAll();
  renderScheduleEditorModal();
}

function resetScheduleDay() {
  if (!confirm(`Reset ${state.child}'s ${editorDay.toUpperCase()} schedule to default?`)) return;
  state.schedules[editorDay] = JSON.parse(JSON.stringify(plannerData.defaultSchedule[editorDay] ?? []));
  scheduleSave();
  renderAll();
  renderScheduleEditorModal();
}

// ═══════════════════════════════════════════════════════════════
//  TIMER
// ═══════════════════════════════════════════════════════════════
function toggleTimer() {
  if (state.timer.intervalId) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
    renderChecklist();
    return;
  }
  state.timer.intervalId = setInterval(() => {
    state.timer.remaining -= 1;
    updateTimerVisual();
    if (state.timer.remaining <= 0) {
      clearInterval(state.timer.intervalId);
      state.timer.intervalId = null;
      state.timer.remaining  = 0;
      updateTimerVisual();
      addStarsForChild(state.child, 3);
      scheduleSave();
      renderAll();
      launchConfetti();
    }
  }, 1000);
  renderChecklist();
}

function resetTimer() {
  clearInterval(state.timer.intervalId);
  state.timer.intervalId = null;
  state.timer.remaining  = state.timer.duration;
  renderChecklist();
}

function updateTimerVisual() {
  const val  = document.getElementById("timerValue");
  const ring = document.getElementById("timerRing");
  if (!val || !ring) return;
  val.textContent = formatTime(state.timer.remaining);
  const pct = 100 - (state.timer.remaining / state.timer.duration) * 100;
  ring.style.setProperty("--progress", String(pct));
}

// ═══════════════════════════════════════════════════════════════
//  SCHEDULE LINE STATE
// ═══════════════════════════════════════════════════════════════
function buildScheduleLineKey(child, day, time, title) {
  return `${child}__${getTodayDateKey()}__${day}__${time}__${title}`;
}

function getScheduleLineState(day, time, nextTime, lineKey) {
  const todayKey  = getTodayWeekdayKey();
  const completed = Boolean(state.completedScheduleStars[lineKey]);
  const notToday  = day !== todayKey;
  const curMin    = getCurrentMinutes();
  const startMin  = timeToMinutes(time);
  const nextMin   = nextTime ? timeToMinutes(nextTime) : 24 * 60;
  const upcoming  = !notToday && curMin < startMin;
  const expired   = !notToday && curMin >= nextMin;

  if (completed) return { disabled:true,  completed:true,  expired:false, notToday:false, label:"⭐ Earned" };
  if (notToday)  return { disabled:true,  completed:false, expired:false, notToday:true,  label:"⭐ Not today" };
  if (upcoming)  return { disabled:true,  completed:false, expired:false, notToday:false, label:"⭐ Wait" };
  if (expired)   return { disabled:true,  completed:false, expired:true,  notToday:false, label:"⭐ Closed" };
  return           { disabled:false, completed:false, expired:false, notToday:false, label:"+⭐ Add" };
}

// ═══════════════════════════════════════════════════════════════
//  STARS HELPERS
// ═══════════════════════════════════════════════════════════════
function getCurrentStars()  { return state.starsByChild[state.child] ?? 0; }
function getCurrentBadges() { return state.badgesByChild[state.child] ?? []; }

function addStarsForChild(child, amount) {
  state.starsByChild[child] = Math.max(0, (state.starsByChild[child] ?? 0) + amount);
}

resetProgressBtn.addEventListener("click", () => {
  if (!confirm(`Reset all stars, badges, and tasks for ${state.child}?`)) return;
  state.starsByChild[state.child]  = 0;
  state.badgesByChild[state.child] = [];
  Object.keys(state.completedTasks).forEach(k => {
    if (k.startsWith(`${state.child}__`)) delete state.completedTasks[k];
  });
  Object.keys(state.completedScheduleStars).forEach(k => {
    if (k.startsWith(`${state.child}__`)) delete state.completedScheduleStars[k];
  });
  clearInterval(state.timer.intervalId);
  state.timer.intervalId = null;
  state.timer.remaining  = state.timer.duration;
  scheduleSave();
  renderAll();
});

// ═══════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════
function getTodayDateKey()    { return new Date().toISOString().slice(0,10); }
function getTodayWeekdayKey() { return ["sun","mon","tue","wed","thu","fri","sat"][new Date().getDay()]; }
function getCurrentMinutes()  { const n = new Date(); return n.getHours()*60+n.getMinutes(); }
function timeToMinutes(t)     { const [h,m]=String(t).split(":"); return Number(h)*60+Number(m); }
function formatTime(s)        { return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }
function escAttr(v)           {
  return String(v)
    .replaceAll("&","&amp;")
    .replaceAll('"',"&quot;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function launchConfetti() {
  const colors = ["#f7c84b","#9ed9c6","#f3a8c2","#a8c8f5","#c4b5fd"];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("span");
    p.className = "confetti";
    p.style.left = `${Math.random()*100}vw`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random()*.2}s`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}

// ═══════════════════════════════════════════════════════════════
//  PWA INSTALL
// ═══════════════════════════════════════════════════════════════
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  installAppBtn.style.display = "inline-block";
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installAppBtn.style.display = "none";
});
installAppBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome !== "accepted") installAppBtn.style.display = "inline-block";
  deferredInstallPrompt = null;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js").catch(() => {})
  );
}



console.log("working")
