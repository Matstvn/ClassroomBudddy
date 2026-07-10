(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={success:`<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,error:`<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,warning:`<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,info:`<svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`},t={success:`bg-emerald-500`,error:`bg-rose-500`,warning:`bg-amber-500`,info:`bg-indigo-500`},n=null;function r(){return n||(n=document.createElement(`div`),n.className=`fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0`,document.body.appendChild(n)),n}function i(n,i=`info`,a=4e3){let o=r(),s=document.createElement(`div`);s.className=`relative flex items-start gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 shadow-lg hover:shadow-xl rounded-xl p-4 transform translate-x-full opacity-0 transition-all duration-300 ease-out pointer-events-auto overflow-hidden group cursor-pointer`,s.innerHTML=`
    <div class="flex-shrink-0 mt-0.5">${e[i]}</div>
    <div class="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 pr-4 leading-relaxed">${n}</div>
    <button class="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    <div class="absolute bottom-0 left-0 h-1 ${t[i]} w-full transition-all ease-linear" style="transition-duration: ${a}ms; width: 100%;"></div>
  `;let c=s.querySelector(`.absolute`);o.appendChild(s),requestAnimationFrame(()=>{s.classList.remove(`translate-x-full`,`opacity-0`)}),requestAnimationFrame(()=>{c&&(c.style.width=`0%`)});let l=setTimeout(()=>u(),a);function u(){s.classList.add(`translate-x-full`,`opacity-0`),s.addEventListener(`transitionend`,()=>{s.remove()})}s.addEventListener(`click`,()=>{clearTimeout(l),u()})}function a(e){let t=e.toLowerCase();return t.includes(`error`)||t.includes(`failed`)||t.includes(`unable`)||t.includes(`invalid`)||t.includes(`enter`)||t.includes(`select`)||t.includes(`fill`)?`error`:t.includes(`success`)||t.includes(`saved`)||t.includes(`added`)||t.includes(`updated`)||t.includes(`imported`)||t.includes(`done`)?`success`:t.includes(`warn`)||t.includes(`careful`)||t.includes(`attention`)?`warning`:`info`}window.alert=e=>{let t=String(e);i(t,a(t))};function o(e,t={}){return new Promise(n=>{let r=t.title||`Confirm Action`,i=t.confirmText||`Confirm`,a=t.cancelText||`Cancel`,o=t.isDestructive!==!1,s=document.createElement(`div`);s.className=`fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 opacity-0 pointer-events-auto`,s.innerHTML=`
      <div class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 scale-95 opacity-0 duration-200 ease-out">
        <div>
          ${o?`<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30"><svg class="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg></div>`:`<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30"><svg class="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg></div>`}
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-base font-semibold leading-6 text-slate-900 dark:text-white" id="modal-title">${r}</h3>
            <div class="mt-2">
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">${e}</p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button type="button" id="confirm-ok-btn" class="${o?`inline-flex w-full justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition-all sm:col-start-2 sm:mt-0`:`inline-flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all sm:col-start-2 sm:mt-0`}">${i}</button>
          <button type="button" id="confirm-cancel-btn" class="mt-3 inline-flex w-full justify-center rounded-xl bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 sm:col-start-1 sm:mt-0 transition-all">
            ${a}
          </button>
        </div>
      </div>
    `;let c=s.firstElementChild;document.body.appendChild(s),requestAnimationFrame(()=>{s.classList.add(`opacity-100`),c.classList.remove(`scale-95`,`opacity-0`),c.classList.add(`scale-100`,`opacity-100`)});let l=e=>{s.classList.remove(`opacity-100`),c.classList.remove(`scale-100`,`opacity-100`),c.classList.add(`scale-95`,`opacity-0`),s.addEventListener(`transitionend`,()=>{s.remove(),n(e)})};s.querySelector(`#confirm-ok-btn`).addEventListener(`click`,()=>l(!0)),s.querySelector(`#confirm-cancel-btn`).addEventListener(`click`,()=>l(!1)),s.addEventListener(`click`,e=>{e.target===s&&l(!1)})})}var s=class{element;contentArea;constructor(){this.element=document.createElement(`div`),this.element.className=`flex flex-row h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden`;let e=document.createElement(`aside`);e.className=`w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col h-full text-slate-300 shrink-0`,e.innerHTML=`
      <!-- Brand Header -->
      <div class="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <svg class="w-8 h-8 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        <span class="font-bold text-lg text-slate-100 tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Buddy</span>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <a href="#/daily-log" class="nav-item group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <span>Daily Log</span>
        </a>
        <a href="#/learners" class="nav-item group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
          </svg>
          <span>Learners</span>
        </a>
        <a href="#/grades" class="nav-item group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          <span>Grade Entry</span>
        </a>
        <a href="#/computed-grades" class="nav-item group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <span>Computed Grades</span>
        </a>
        <a href="#/classroom" class="nav-item group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <span>Monitoring</span>
        </a>
      </nav>

      <!-- User Profile section at the bottom -->
      <div class="p-4 border-t border-slate-800/60 flex items-center gap-3 bg-slate-900/60 mt-auto">
        <div class="relative shrink-0">
          <div class="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-sm">
            T
          </div>
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-200 truncate">Alex Mercer</p>
          <p class="text-[10px] text-slate-500 truncate">Lead Educator</p>
        </div>
      </div>
    `,this.contentArea=document.createElement(`main`),this.contentArea.id=`content`,this.contentArea.className=`flex-1 overflow-auto bg-slate-950 p-8 animate-fade-in`,this.element.appendChild(e),this.element.appendChild(this.contentArea),window.addEventListener(`hashchange`,()=>this.highlightActive()),this.highlightActive()}mount(e){e.appendChild(this.element)}getContentArea(){return this.contentArea}highlightActive(){this.contentArea.classList.remove(`animate-fade-in`),this.contentArea.offsetWidth,this.contentArea.classList.add(`animate-fade-in`),this.element.querySelectorAll(`aside nav a`).forEach(e=>{e.classList.remove(`text-indigo-400`,`bg-indigo-950/30`,`shadow-[inset_0_0_12px_rgba(99,102,241,0.15)]`,`ring-1`,`ring-indigo-500/30`),e.classList.add(`text-slate-400`);let t=e.querySelector(`svg`);t&&(t.classList.remove(`text-indigo-400`),t.classList.add(`text-slate-400`))});let e=window.location.hash||`#/daily-log`,t=this.element.querySelector(`aside nav a[href="${e}"]`);if(t){t.classList.remove(`text-slate-400`),t.classList.add(`text-indigo-400`,`bg-indigo-950/30`,`shadow-[inset_0_0_12px_rgba(99,102,241,0.15)]`,`ring-1`,`ring-indigo-500/30`);let e=t.querySelector(`svg`);e&&(e.classList.remove(`text-slate-400`),e.classList.add(`text-indigo-400`))}}},c=`/api/v1`;async function l(e,t){let n=await fetch(`${c}${e}`,{headers:{"Content-Type":`application/json`},...t});if(!n.ok)throw Error(`API error ${n.status}: ${await n.text()}`);return n.json()}var u={getAll:(e=!0)=>l(`/learners/?active_only=${e}`),getOne:e=>l(`/learners/${e}`),create:e=>l(`/learners/`,{method:`POST`,body:JSON.stringify(e)}),update:(e,t)=>l(`/learners/${e}`,{method:`PUT`,body:JSON.stringify(t)}),archive:e=>l(`/learners/${e}`,{method:`DELETE`}),importSF1:async e=>{let t=new FormData;t.append(`file`,e);let n=await fetch(`${c}/learners/import/sf1`,{method:`POST`,body:t});if(!n.ok)throw Error(`Import failed`);return n.json()},permanentlyDelete:e=>l(`/learners/${e}/permanent`,{method:`DELETE`})},d={getAll:()=>l(`/subjects/`),create:e=>l(`/subjects/`,{method:`POST`,body:JSON.stringify(e)})},f={get:(e,t)=>l(`/attendance/?date=${e}&subject_id=${t}`),save:e=>l(`/attendance/bulk`,{method:`POST`,body:JSON.stringify(e)})},p={create:e=>l(`/assessments/`,{method:`POST`,body:JSON.stringify(e)}),getForDate:(e,t)=>l(`/assessments/?date=${e}&subject_id=${t}`)},m={getAll:()=>l(`/assessment-subtypes/`)},h={create:e=>l(`/assessments/`,{method:`POST`,body:JSON.stringify(e)}),getForGradeEntry:e=>l(`/assessments/grade-entry?${new URLSearchParams(e).toString()}`),update:(e,t)=>l(`/assessments/${e}`,{method:`PUT`,body:JSON.stringify(t)}),getOne:e=>l(`/assessments/${e}`)},g={getTermSummary:(e,t,n,r=!1)=>l(`/grades/term-summary?subject_id=${e}&school_year=${t}&term=${n}&use_saved=${r}`),save:e=>l(`/grades/save`,{method:`POST`,body:JSON.stringify(e)}),getWeights:()=>l(`/grades/weights`),setWeight:(e,t,n,r)=>l(`/grades/weights?ww=${e}&pt=${t}&te=${n}${r?`&subject_id=${r}`:``}`,{method:`POST`})},_=class{learners=[];listeners=new Set;activeOnly=!0;subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){this.listeners.forEach(e=>e())}async load(){this.learners=await u.getAll(this.activeOnly),this.notify()}getAll(){return this.learners}async add(e){let t=await u.create(e);this.activeOnly?(this.learners.push(t),this.notify()):await this.load()}async update(e,t){let n=await u.update(e,t),r=this.learners.findIndex(t=>t.id===e);r>=0&&(this.learners[r]=n,this.notify())}async archive(e){await u.archive(e),this.learners=this.learners.filter(t=>t.id!==e),this.notify()}async importFile(e){let t=await u.importSF1(e);return await this.load(),t}setActiveOnly(e){this.activeOnly=e,this.load()}async delete(e){await u.permanentlyDelete(e),this.learners=this.learners.filter(t=>t.id!==e),this.notify()}},v=class{store;onSelect;container;searchInput;activeOnly=!0;constructor(e,t){this.store=e,this.onSelect=t}render(e){this.container=e,this.container.innerHTML=`
      <div class="flex flex-col h-full">
        <div class="p-2 border-b">
          <input id="learner-search" type="text" placeholder="Search learners..." 
                 class="w-full border rounded px-2 py-1 text-sm" />
          <label class="flex items-center mt-2 text-sm">
            <input type="checkbox" id="show-archived" class="mr-1" ${this.activeOnly?``:`checked`} />
            Show archived
          </label>
        </div>
        <ul id="learner-list" class="flex-1 overflow-y-auto divide-y"></ul>
      </div>
    `,this.searchInput=this.container.querySelector(`#learner-search`),this.searchInput.addEventListener(`input`,()=>this.renderList());let t=this.container.querySelector(`#show-archived`);t.addEventListener(`change`,()=>{this.activeOnly=!t.checked,this.store.setActiveOnly(this.activeOnly)}),this.store.subscribe(()=>this.renderList()),this.store.load()}renderList(){let e=this.container.querySelector(`#learner-list`),t=this.searchInput?.value.toLowerCase()||``,n=this.store.getAll().filter(e=>`${e.first_name} ${e.last_name}`.toLowerCase().includes(t)||e.lrn&&e.lrn.includes(t));if(e.innerHTML=``,n.length===0){e.innerHTML=`<li class="p-2 text-sm text-gray-500">No learners found.</li>`;return}n.forEach(t=>{let n=document.createElement(`li`);n.className=`p-2 hover:bg-gray-200 cursor-pointer text-sm`,n.textContent=`${t.last_name}, ${t.first_name}`,t.is_active||n.classList.add(`opacity-50`,`line-through`),n.addEventListener(`click`,()=>this.onSelect(t)),e.appendChild(n)})}};function y(e,t){let n=document.createElement(`div`);n.className=`p-4`;function r(){return`
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">${e.first_name} ${e.last_name}</h2>
        <div>
          <button id="edit-btn" class="bg-yellow-400 text-white px-3 py-1 rounded text-sm mr-2">Edit</button>
          <button id="archive-btn" class="bg-red-500 text-white px-3 py-1 rounded text-sm">${e.is_active?`Archive`:`Restore`}</button>
          <button id="delete-btn" class="bg-red-700 text-white px-3 py-1 rounded text-sm">Delete</button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div><strong>LRN:</strong> ${e.lrn||`-`}</div>
        <div><strong>Gender:</strong> ${e.gender}</div>
        <div><strong>Birthdate:</strong> ${e.birth_date}</div>
        <div><strong>Age:</strong> ${e.age}</div>
        <div><strong>Mother Tongue:</strong> ${e.mother_tongue||`-`}</div>
        <div><strong>IP:</strong> ${e.ip?`Yes`:`No`}</div>
        <div><strong>Religion:</strong> ${e.religion||`-`}</div>
        <div><strong>Address:</strong> ${e.address||`-`}</div>
        <div><strong>Father:</strong> ${e.father_name||`-`}</div>
        <div><strong>Mother:</strong> ${e.mother_name||`-`}</div>
        <div><strong>Guardian:</strong> ${e.guardian_name||`-`}</div>
        <div><strong>Contact:</strong> ${e.guardian_contact||`-`}</div>
      </div>
    `}function i(){return`
      <h2 class="text-xl font-semibold mb-4">Edit ${e.first_name} ${e.last_name}</h2>
      <form id="edit-form" class="grid grid-cols-2 gap-3 text-sm">
        <input name="lrn" placeholder="LRN" value="${e.lrn||``}" class="border p-1 rounded" />
        <input name="first_name" required value="${e.first_name}" class="border p-1 rounded" />
        <input name="last_name" required value="${e.last_name}" class="border p-1 rounded" />
        <input name="middle_name" placeholder="Middle Name" value="${e.middle_name||``}" class="border p-1 rounded" />
        <input name="extension" placeholder="Extension" value="${e.extension||``}" class="border p-1 rounded" />
        <select name="gender" class="border p-1 rounded">
          <option value="male" ${e.gender===`male`?`selected`:``}>Male</option>
          <option value="female" ${e.gender===`female`?`selected`:``}>Female</option>
        </select>
        <input name="birth_date" type="date" required value="${e.birth_date}" class="border p-1 rounded" />
        <input name="age" type="number" required value="${e.age}" class="border p-1 rounded" />
        <input name="mother_tongue" placeholder="Mother Tongue" value="${e.mother_tongue||``}" class="border p-1 rounded" />
        <label class="flex items-center"><input type="checkbox" name="ip" ${e.ip?`checked`:``} class="mr-1" /> Indigenous People</label>
        <input name="religion" placeholder="Religion" value="${e.religion||``}" class="border p-1 rounded" />
        <input name="address" placeholder="Address" value="${e.address||``}" class="border p-1 rounded" />
        <input name="father_name" placeholder="Father" value="${e.father_name||``}" class="border p-1 rounded" />
        <input name="mother_name" placeholder="Mother" value="${e.mother_name||``}" class="border p-1 rounded" />
        <input name="guardian_name" placeholder="Guardian" value="${e.guardian_name||``}" class="border p-1 rounded" />
        <input name="guardian_contact" placeholder="Guardian Contact" value="${e.guardian_contact||``}" class="border p-1 rounded" />
        <div class="col-span-2 flex gap-2">
          <button type="submit" class="bg-green-600 text-white px-4 py-1 rounded">Save</button>
          <button type="button" id="cancel-edit" class="bg-gray-300 px-4 py-1 rounded">Cancel</button>
        </div>
      </form>
    `}return n.innerHTML=r(),n.addEventListener(`click`,async a=>{let s=a.target;s.id===`edit-btn`&&(n.innerHTML=i()),s.id===`cancel-edit`&&(n.innerHTML=r()),s.id===`archive-btn`&&await o(`Are you sure you want to ${e.is_active?`archive`:`restore`} this learner?`,{title:`${e.is_active?`Archive`:`Restore`} Learner`,isDestructive:e.is_active})&&(await t.archive(e.id),n.innerHTML=`<p class="text-gray-500">Learner archived. Select another.</p>`),s.id===`delete-btn`&&await o(`Are you sure you want to permanently delete this learner? This cannot be undone.`,{title:`Delete Learner`,isDestructive:!0})&&(await t.delete(e.id),n.innerHTML=`<p class="text-gray-500">Learner deleted. Select another.</p>`)}),n.addEventListener(`submit`,async i=>{i.preventDefault();let a=i.target,o=new FormData(a),s={};o.forEach((e,t)=>{t===`ip`?s[t]=o.get(`ip`)===`on`:t===`age`?s[t]=parseInt(e,10):s[t]=e});try{await t.update(e.id,s),alert(`Updated successfully!`),n.innerHTML=r(),t.load().then(()=>{t.getAll().find(t=>t.id===e.id)&&(n.innerHTML=r())})}catch{alert(`Update failed`)}}),n}function b(e){let t=document.createElement(`button`);return t.className=`bg-blue-500 text-white px-4 py-2 rounded text-sm`,t.textContent=`Import SF1`,t.addEventListener(`click`,()=>{let t=document.createElement(`input`);t.type=`file`,t.accept=`.xlsx,.xls`,t.onchange=async()=>{let n=t.files?.[0];if(n)try{let t=await e.importFile(n);alert(`Imported ${t.imported} learners.`),e.load()}catch{alert(`Import failed`)}},t.click()}),t}function x(){let e=document.createElement(`div`);e.className=`flex flex-col h-full`;let t=document.createElement(`div`);t.className=`p-2 border-b flex gap-2`;let n=document.createElement(`button`);n.className=`bg-green-600 text-white px-4 py-1 rounded text-sm`,n.textContent=`+ Add Learner`,n.addEventListener(`click`,()=>S(r)),t.appendChild(n);let r=new _,i=b(r);t.appendChild(i),e.appendChild(t);let a=document.createElement(`div`);a.className=`flex flex-1 overflow-hidden`;let o=document.createElement(`div`);o.className=`w-1/3 border-r overflow-hidden flex flex-col h-full`;let s=document.createElement(`div`);return s.className=`flex-1 overflow-auto`,new v(r,e=>{s.innerHTML=``,s.appendChild(y(e,r))}).render(o),a.appendChild(o),a.appendChild(s),e.appendChild(a),e}function S(e){let t=document.createElement(`div`);t.className=`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`,t.innerHTML=`
    <div class="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
      <h2 class="text-xl font-bold mb-4">Add New Learner</h2>
      <form id="add-learner-form" class="grid grid-cols-2 gap-3 text-sm">
        <input name="lrn" placeholder="LRN" class="border p-1 rounded" />
        <input name="first_name" required placeholder="First Name *" class="border p-1 rounded" />
        <input name="last_name" required placeholder="Last Name *" class="border p-1 rounded" />
        <input name="middle_name" placeholder="Middle Name" class="border p-1 rounded" />
        <input name="extension" placeholder="Extension" class="border p-1 rounded" />
        <select name="gender" class="border p-1 rounded">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input name="birth_date" type="date" required class="border p-1 rounded" />
        <input name="age" type="number" required placeholder="Age *" class="border p-1 rounded" />
        <input name="mother_tongue" placeholder="Mother Tongue" class="border p-1 rounded" />
        <label class="flex items-center"><input type="checkbox" name="ip" class="mr-1" /> Indigenous People</label>
        <input name="religion" placeholder="Religion" class="border p-1 rounded" />
        <input name="address" placeholder="Address" class="border p-1 rounded" />
        <input name="father_name" placeholder="Father" class="border p-1 rounded" />
        <input name="mother_name" placeholder="Mother" class="border p-1 rounded" />
        <input name="guardian_name" placeholder="Guardian" class="border p-1 rounded" />
        <input name="guardian_contact" placeholder="Guardian Contact" class="border p-1 rounded" />
        <div class="col-span-2 flex gap-2 mt-2">
          <button type="submit" class="bg-green-600 text-white px-4 py-1 rounded">Add</button>
          <button type="button" id="cancel-add" class="bg-gray-300 px-4 py-1 rounded">Cancel</button>
        </div>
      </form>
    </div>
  `,document.body.appendChild(t),t.querySelector(`#cancel-add`).addEventListener(`click`,()=>t.remove()),t.addEventListener(`click`,e=>{e.target===t&&t.remove()});let n=t.querySelector(`#add-learner-form`);n.addEventListener(`submit`,async r=>{r.preventDefault();let i=new FormData(n),a={};i.forEach((e,t)=>{t===`ip`?a[t]=i.get(`ip`)===`on`:t===`age`?a[t]=parseInt(e,10)||0:a[t]=e});try{await e.add(a),t.remove(),alert(`Learner added!`)}catch(e){alert(`Failed to add learner: `+e)}})}function C(){let e=document.createElement(`div`),t=new URLSearchParams(window.location.hash.split(`?`)[1]||``).get(`id`);t&&(async()=>{let e=await h.getOne(parseInt(t));a.value=e.subject_id.toString(),o.value=e.term.toString(),await x(),e.learning_objective_id&&(c.value=e.learning_objective_id.toString()),await n.load(),w(e)})().catch(console.error),e.className=`p-4 h-full flex flex-col gap-4`;let n=new _,r=`2026-2027`,i=document.createElement(`div`);i.className=`flex gap-2 items-center flex-wrap`;let a=document.createElement(`select`);a.className=`border p-2 rounded`,a.innerHTML=`<option value="">-- Select Subject --</option>`,d.getAll().then(e=>{a.innerHTML=`<option value="">-- Select Subject --</option>`,e.forEach(e=>{let t=document.createElement(`option`);t.value=e.id.toString(),t.textContent=e.name,a.appendChild(t)})}),i.appendChild(a);let o=document.createElement(`select`);o.className=`border p-2 rounded`,o.innerHTML=`<option value="">-- Term --</option><option value="1">1st Term</option><option value="2">2nd Term</option><option value="3">3rd Term</option>`,i.appendChild(o);let s=document.createElement(`span`);s.className=`text-sm ml-2`,s.textContent=`SY: ${r}`,i.appendChild(s);let c=document.createElement(`select`);c.className=`border p-2 rounded`,c.style.display=`none`,c.innerHTML=`<option value="">-- Learning Objective (optional) --</option>`,i.appendChild(c);let l=document.createElement(`select`);l.className=`border p-2 rounded`,l.innerHTML=`<option value="">-- Assessment Type --</option><option value="Written Works">Written Works</option><option value="Performance Task">Performance Task</option><option value="Term Examination">Term Examination</option>`,l.addEventListener(`change`,()=>{l.value===`Written Works`?(u.style.display=``,b()):(u.style.display=`none`,u.innerHTML=``)}),i.appendChild(l);let u=document.createElement(`select`);u.className=`border p-2 rounded`,u.style.display=`none`,i.appendChild(u);let f=document.createElement(`input`);f.type=`number`,f.placeholder=`Max Score`,f.className=`border p-2 rounded w-24`,i.appendChild(f);let p=document.createElement(`button`);p.className=`bg-blue-600 text-white px-4 py-2 rounded`,p.textContent=`Create Assessment`,i.appendChild(p),e.appendChild(i);let g=document.createElement(`div`);g.className=`border rounded p-2 overflow-auto max-h-96`,e.appendChild(g);let v=document.createElement(`button`);v.className=`bg-green-600 text-white px-4 py-2 rounded self-start hidden`,v.textContent=`Save Assessment`,e.appendChild(v);let y=document.createElement(`div`);y.className=`mt-4`,y.innerHTML=`<h3 class="font-bold">Existing Assessments</h3><div id="existing-list"></div>`,e.appendChild(y);async function b(){let e=(await m.getAll())[`Written Works`]||[];u.innerHTML=`<option value="">-- Sub-type --</option>`,e.forEach(e=>{let t=document.createElement(`option`);t.value=e,t.textContent=e,u.appendChild(t)})}async function x(){let e=parseInt(a.value),t=parseInt(o.value);if(!e||!t){c.style.display=`none`,c.innerHTML=`<option value="">-- Learning Objective (optional) --</option>`;return}try{let n=await(await fetch(`/api/v1/learning-objectives/?subject_id=${e}&term=${t}&school_year=${r}`)).json();c.innerHTML=`<option value="">-- Learning Objective (optional) --</option>`,n.forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=`${e.code}: ${e.description}`,c.appendChild(t)}),c.style.display=``}catch(e){console.error(e),c.style.display=`none`}}async function S(){let e=parseInt(a.value),t=parseInt(o.value);if(!e||!t){alert(`Please select subject and term`);return}let i=l.value;if(!i){alert(`Please select assessment type`);return}let s=u.style.display===`none`?i:u.value||i,d=parseFloat(f.value)||0;if(!d){alert(`Enter max score`);return}n.setActiveOnly(!0),await n.load();let p=n.getAll();if(p.length===0){alert(`No learners found`);return}g.innerHTML=`<div class="grid grid-cols-2 gap-1 text-sm font-medium">`,p.forEach(e=>{let t=`${e.last_name}, ${e.first_name}`;g.innerHTML+=`
        <div class="flex items-center gap-1 border-b py-1">
          <span class="w-40 truncate">${t}</span>
          <input type="number" class="border w-20 text-center" data-student="${e.id}" min="0" max="${d}" value="0" />
        </div>
      `}),g.innerHTML+=`</div>`,v.classList.remove(`hidden`),v.onclick=async()=>{let n=[];g.querySelectorAll(`input[data-student]`).forEach(e=>{n.push({student_id:parseInt(e.dataset.student),score:parseFloat(e.value)||0})});let i=c.value?parseInt(c.value):null;try{await h.create({subject_id:e,date:new Date().toISOString().split(`T`)[0],type:s,title:s,total_score:d,scores:n,source:`grades`,school_year:r,term:t,learning_objective_id:i}),alert(`Assessment saved`),g.innerHTML=``,v.classList.add(`hidden`),f.value=``,c.value=``,C()}catch(e){alert(`Error saving assessment: `+e)}}}async function C(){let e=parseInt(a.value),t=parseInt(o.value);if(!e||!t)return;let n=await h.getForGradeEntry({subject_id:e,school_year:r,term:t}),i=y.querySelector(`#existing-list`);if(i.innerHTML=``,n.length===0){i.innerHTML=`<p class="text-sm text-gray-500">No assessments yet.</p>`;return}n.forEach(e=>{let t=document.createElement(`div`);t.className=`border p-2 rounded mb-1 cursor-pointer hover:bg-gray-100`,t.textContent=`${e.type} — ${e.title} (Max: ${e.total_score}) — Scores: ${e.scores.length}`,t.addEventListener(`click`,()=>w(e)),i.appendChild(t)})}async function w(e){n.setActiveOnly(!0),await n.load();let t=n.getAll();e.learning_objective_id?c.value=e.learning_objective_id.toString():c.value=``,g.innerHTML=`<div class="grid grid-cols-2 gap-1 text-sm font-medium">`;let r=new Map(e.scores.map(e=>[e.student_id,e.score]));t.forEach(t=>{let n=`${t.last_name}, ${t.first_name}`,i=r.get(t.id)||0;g.innerHTML+=`
        <div class="flex items-center gap-1 border-b py-1">
          <span class="w-40 truncate">${n}</span>
          <input type="number" class="border w-20 text-center" data-student="${t.id}" min="0" max="${e.total_score}" value="${i}" />
        </div>
      `}),g.innerHTML+=`</div>`,v.classList.remove(`hidden`),v.textContent=`Update Assessment`,v.onclick=async()=>{let t=[];g.querySelectorAll(`input[data-student]`).forEach(e=>{t.push({student_id:parseInt(e.dataset.student),score:parseFloat(e.value)||0})});let n=c.value?parseInt(c.value):null;try{await h.update(e.id,{scores:t,learning_objective_id:n}),alert(`Assessment updated`),g.innerHTML=``,v.classList.add(`hidden`),v.textContent=`Save Assessment`,f.value=``,c.value=``,C()}catch(e){alert(`Error updating assessment: `+e)}}}return p.addEventListener(`click`,S),a.addEventListener(`change`,()=>{x(),C()}),o.addEventListener(`change`,()=>{x(),C()}),C(),x(),e}function w(){let e=document.createElement(`div`);e.className=`p-4 h-full flex flex-col gap-4`;let t=`2026-2027`,n=document.createElement(`div`);n.className=`flex gap-2 items-center`;let r=document.createElement(`select`);r.className=`border p-2 rounded`,r.innerHTML=`<option value="">-- Subject --</option>`,d.getAll().then(e=>{r.innerHTML=`<option value="">-- Subject --</option>`,e.forEach(e=>{let t=document.createElement(`option`);t.value=e.id.toString(),t.textContent=e.name,r.appendChild(t)})});let i=document.createElement(`select`);i.className=`border p-2 rounded`,i.innerHTML=`<option value="">-- Term --</option><option value="1">1st Term</option><option value="2">2nd Term</option><option value="3">3rd Term</option>`,n.appendChild(r),n.appendChild(i),e.appendChild(n);let a=document.createElement(`button`);a.className=`bg-blue-600 text-white px-4 py-2 rounded self-start`,a.textContent=`Compute Grades`,e.appendChild(a);let o=document.createElement(`div`);o.className=`overflow-x-auto`,e.appendChild(o);let s=document.createElement(`button`);s.className=`bg-green-600 text-white px-4 py-2 rounded self-start hidden`,s.textContent=`Save Grades to Records`,e.appendChild(s);let c=new _;async function l(){let e=parseInt(r.value),n=parseInt(i.value);if(!e||!n)return;let a=await g.getTermSummary(e,t,n);await c.load();let l=c.getAll(),u=new Map(l.map(e=>[e.id,`${e.last_name}, ${e.first_name}`])),d=`<table class="table-auto w-full border-collapse text-sm"><thead><tr>
      <th class="border px-2 py-1">Learner</th>
      <th class="border px-2 py-1">WW Average</th>
      <th class="border px-2 py-1">PT Average</th>
      <th class="border px-2 py-1">TE Score</th>
      <th class="border px-2 py-1">Final Grade</th>
    </tr></thead><tbody>`;a.forEach(e=>{d+=`<tr>
        <td class="border px-2 py-1">${u.get(e.student_id)||e.student_id}</td>
        <td class="border px-2 py-1 text-center">${e.ww_average}</td>
        <td class="border px-2 py-1 text-center">${e.pt_average}</td>
        <td class="border px-2 py-1 text-center">${e.te_score}</td>
        <td class="border px-2 py-1 text-center font-bold">${e.final_grade}</td>
      </tr>`}),d+=`</tbody></table>`,o.innerHTML=d,s.classList.remove(`hidden`),s.onclick=async()=>{await g.save({subject_id:e,school_year:t,term:n,grades:a}),alert(`Grades saved.`)}}return a.addEventListener(`click`,l),e}function T(){let e=document.createElement(`div`);e.className=`p-4 h-full flex flex-col gap-4`;let t=`2026-2027`,n=document.createElement(`div`);n.className=`flex gap-2 items-center`;let r=document.createElement(`select`);r.className=`border p-2 rounded`,r.innerHTML=`<option value="">-- Subject --</option>`,d.getAll().then(e=>{r.innerHTML=`<option value="">-- Subject --</option>`,e.forEach(e=>{let t=document.createElement(`option`);t.value=e.id.toString(),t.textContent=e.name,r.appendChild(t)})});let i=document.createElement(`select`);i.className=`border p-2 rounded`,i.innerHTML=`<option value="">-- Term --</option><option value="1">1st Term</option><option value="2">2nd Term</option><option value="3">3rd Term</option>`,n.appendChild(r),n.appendChild(i),n.appendChild(document.createTextNode(`SY: ${t}`));let a=document.createElement(`button`);a.className=`bg-blue-500 text-white px-4 py-2 rounded`,a.textContent=`Refresh`,n.appendChild(a),e.appendChild(n);let o=document.createElement(`div`);o.className=`flex-1 overflow-auto border rounded p-2`,e.appendChild(o);async function s(){let e=parseInt(r.value),n=parseInt(i.value);if(!e||!n){o.innerHTML=`<p class="text-gray-500">Select subject and term.</p>`;return}try{c(await(await fetch(`/api/v1/curriculum/progress?subject_id=${e}&term=${n}&school_year=${t}`)).json(),o,e,n)}catch{o.innerHTML=`<p class="text-red-500">Error loading data.</p>`}}function c(e,t,n,r){if(t.innerHTML=``,!e.performance_standards.length){t.innerHTML=`<p class="text-gray-500">No data for this subject/term.</p>`;return}e.performance_standards.forEach(e=>{let i=document.createElement(`div`);i.className=`mb-4`,e.competencies.forEach(e=>{let t=document.createElement(`div`);t.className=`ml-4 mb-2`;let a=e.progress===null?`–`:`${e.progress}%`;t.innerHTML=`
          <div class="flex items-center gap-2">
            <span class="font-semibold">${e.code}: ${e.description}</span>
            <span class="text-sm bg-gray-200 px-2 rounded">Progress: ${a}</span>
          </div>
        `;let o=document.createElement(`ul`);o.className=`ml-6 list-disc`,e.objectives.forEach(e=>{let t=document.createElement(`li`),n=e.class_average===null?`–`:`${e.class_average}%`;t.textContent=`${e.code}: ${e.description} (Class Avg: ${n})`,o.appendChild(t)});let s=document.createElement(`button`);s.className=`ml-4 mt-1 text-sm text-blue-600 underline cursor-pointer`,s.textContent=`+ Add Learning Objective`,s.addEventListener(`click`,()=>l(t,e.id,n,r)),t.appendChild(o),t.appendChild(s),i.appendChild(t)}),t.appendChild(i)})}function l(e,t,n,r){let i=document.createElement(`div`);i.className=`ml-4 mt-2 p-2 border rounded bg-gray-50`,i.innerHTML=`
      <input id="obj-code" placeholder="Code (e.g., LO-1a)" class="border p-1 mb-1 w-full" />
      <input id="obj-desc" placeholder="Description" class="border p-1 mb-1 w-full" />
      <button id="save-obj" class="bg-green-500 text-white px-3 py-1 rounded text-sm">Save</button>
      <button id="cancel-obj" class="ml-2 text-sm">Cancel</button>
    `,e.appendChild(i),document.getElementById(`save-obj`).addEventListener(`click`,async()=>{let e=document.getElementById(`obj-code`).value,n=document.getElementById(`obj-desc`).value;if(!e||!n){alert(`Please fill both fields`);return}await fetch(`/api/v1/learning-objectives/`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({code:e,description:n,learning_competency_id:t})}),i.remove(),s()}),document.getElementById(`cancel-obj`).addEventListener(`click`,()=>i.remove())}return a.addEventListener(`click`,s),r.addEventListener(`change`,s),i.addEventListener(`change`,s),e}function E(){let e=new Date().getMonth()+1;return e>=8&&e<=10?1:e===11||e===12||e===1?2:3}function D(){let e=new Date().getHours();return e>=7&&e<12}function O(){let e=new Date().getHours();return e>=13&&e<16.5}function k(){let e=document.createElement(`div`);e.className=`p-4 space-y-4`;let t=new _,n=new Date().toISOString().split(`T`)[0],r=E(),i=r,a=`2026-2027`,s=document.createElement(`div`);s.className=`grid grid-cols-1 md:grid-cols-2 gap-4`,e.appendChild(s);function c(e){let r=document.createElement(`div`);r.className=`border p-4 rounded bg-white`,r.innerHTML=`
      <h3 class="font-bold text-lg">${e} Attendance</h3>
      <div id="${e}-attendance-content"></div>
    `;let i=r.querySelector(`#${e}-attendance-content`);async function a(){let r=e===`AM`?D():O(),o=await f.get(n,e).catch(()=>[]);if(o.length>0){let e=o.filter(e=>e.status===`present`).length,n=o.length-e;await t.load();let r=t.getAll(),a=r.filter(e=>e.gender===`male`&&o.some(t=>t.student_id===e.id&&t.status===`present`)).length,s=r.filter(e=>e.gender===`female`&&o.some(t=>t.student_id===e.id&&t.status===`present`)).length;i.innerHTML=`
          <div class="text-sm mt-2">
            <div>♂ ${a} | ♀ ${s}</div>
            <div>Present: ${e} | Absent: ${n}</div>
          </div>
        `;return}if(!r){i.innerHTML=`<p class="text-sm text-gray-500">Outside attendance hours.</p>`;return}let s=document.createElement(`button`);s.className=`bg-blue-600 text-white px-4 py-2 rounded mt-2`,s.textContent=`Check Attendance`,s.addEventListener(`click`,async()=>{await t.load();let r=t.getAll(),o=`<div class="max-h-64 overflow-y-auto mt-2">`;r.forEach(e=>{o+=`
            <label class="flex items-center gap-2 text-sm py-1">
              <input type="checkbox" data-student="${e.id}" checked>
              ${e.last_name}, ${e.first_name}
            </label>
          `}),o+='</div><button id="save-${session}-attendance" class="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm">Save Attendance</button>',i.innerHTML=o,document.getElementById(`save-${e}-attendance`).addEventListener(`click`,async()=>{let t=i.querySelectorAll(`input[data-student]`),r=[];t.forEach(e=>{r.push({student_id:parseInt(e.dataset.student),status:e.checked?`present`:`absent`})}),await f.save({date:n,session:e,records:r}),a()})}),i.appendChild(s)}return a(),r}s.appendChild(c(`AM`)),s.appendChild(c(`PM`));let l=document.createElement(`div`);l.className=`border p-4 rounded bg-white space-y-4`,l.innerHTML=`<h3 class="font-bold text-lg">Lesson Plan</h3>`,e.appendChild(l);let u=document.createElement(`label`);u.className=`text-sm font-medium mr-2`,u.textContent=`Term:`,l.appendChild(u);let m=document.createElement(`select`);m.className=`border p-2 rounded`,m.innerHTML=`
  <option value="1">1st Term</option>
  <option value="2">2nd Term</option>
  <option value="3">3rd Term</option>
`,m.value=String(r),l.appendChild(m),m.addEventListener(`change`,()=>{i=parseInt(m.value),y(),S()});let h=document.createElement(`select`);h.className=`border p-2 rounded`,h.innerHTML=`<option value="">-- Select Subject --</option>`,d.getAll().then(e=>{h.innerHTML=`<option value="">-- Select Subject --</option>`,e.forEach(e=>{let t=document.createElement(`option`);t.value=e.id.toString(),t.textContent=e.name,h.appendChild(t)})}),l.appendChild(h);let g=document.createElement(`div`);l.appendChild(g);let v=document.createElement(`div`);v.className=`border-t pt-4 mt-4`,v.innerHTML=`<h4 class="font-bold">Today's Assessments</h4><div id="today-assessments-list"></div>`,l.appendChild(v);async function y(){let e=parseInt(h.value);if(!e){g.innerHTML=`<p class="text-gray-500">Select a subject.</p>`;return}g.innerHTML=`<p>Loading...</p>`;try{b((await(await fetch(`/api/v1/curriculum/progress?subject_id=${e}&term=${i}&school_year=${a}`)).json()).performance_standards)}catch{g.innerHTML=`<p class="text-red-500">Error loading curriculum.</p>`}}function b(e){if(g.innerHTML=``,!e.length){g.innerHTML=`<p class="text-gray-500">No standards for this term.</p>`;return}e.forEach(e=>{let t=document.createElement(`div`);t.className=`mb-4`,t.innerHTML=`<div class="font-semibold"> ${e.description}</div>`,e.competencies.forEach(e=>{let n=document.createElement(`div`);n.className=`ml-4 mb-2`,n.innerHTML=`
          <div class="flex items-center gap-2">
            <span class="font-medium"> ${e.description}</span>
            <span class="text-xs bg-gray-200 px-2 rounded">Progress: ${e.progress===null?`–`:e.progress+`%`}</span>
          </div>
        `;let r=document.createElement(`ul`);r.className=`ml-6 list-disc`,e.objectives.forEach(e=>{let t=document.createElement(`li`);t.className=`text-sm py-1 flex items-center gap-2`;let n=e.class_average===null?`–`:`${e.class_average}%`;t.innerHTML=`
            <span>${e.description} (Avg: ${n})</span>
            <button class="create-assess-btn text-xs bg-purple-500 text-white px-2 py-0.5 rounded" data-obj-id="${e.id}" data-obj-code="${e.code}" data-obj-desc="${e.description}">+ Assessment</button>
            <button class="delete-obj-btn text-xs text-red-600 hover:underline" data-obj-id="${e.id}">×</button>
          `,r.appendChild(t)});let i=document.createElement(`button`);i.className=`ml-4 text-xs text-blue-600 underline mb-1`,i.textContent=`+ Add Learning Objective`,i.addEventListener(`click`,()=>{let t=document.createElement(`div`);t.className=`ml-4 p-2 border rounded bg-gray-50 inline-block`,t.innerHTML=`
            <input placeholder="Code" id="new-obj-code" class="border px-1 py-0.5 text-xs w-20" />
            <input placeholder="Description" id="new-obj-desc" class="border px-1 py-0.5 text-xs w-40 ml-1" />
            <button class="bg-green-500 text-white text-xs px-2 py-0.5 ml-1" id="save-new-obj">Save</button>
            <button class="text-xs ml-1" id="cancel-new-obj">Cancel</button>
          `,r.appendChild(t),document.getElementById(`save-new-obj`).addEventListener(`click`,async()=>{let t=document.getElementById(`new-obj-desc`).value;t&&(await fetch(`/api/v1/learning-objectives/`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({description:t,learning_competency_id:e.id})}),y())}),document.getElementById(`cancel-new-obj`).addEventListener(`click`,()=>t.remove())}),n.appendChild(r),n.appendChild(i),t.appendChild(n)}),g.appendChild(t)}),g.querySelectorAll(`.create-assess-btn`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget,n=parseInt(t.dataset.objId),r=t.dataset.objCode,i=t.dataset.objDesc;x(n,r,i)})}),g.querySelectorAll(`.delete-obj-btn`).forEach(e=>{e.addEventListener(`click`,async e=>{let t=e.currentTarget,n=parseInt(t.dataset.objId);await o(`Are you sure you want to delete this learning objective?`,{title:`Delete Objective`,isDestructive:!0})&&(await fetch(`/api/v1/learning-objectives/${n}`,{method:`DELETE`}),y())})})}function x(e,t,r){let i=document.querySelector(`.modal-overlay`);i&&i.remove();let o=document.createElement(`div`);o.className=`modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`,o.innerHTML=`
      <div class="bg-white p-6 rounded w-full max-w-lg">
        <h4 class="font-bold mb-2">Create Assessment for ${t}</h4>
        <p class="text-sm text-gray-600 mb-2">${r}</p>
        
        <select id="assess-type" class="border p-1 w-full mb-2">
          <option value="Written Works">Written Works</option>
          <option value="Performance Task">Performance Task</option>
          <option value="Term Examination">Term Examination</option>
        </select>
        
        <select id="assess-subtype" class="border p-1 w-full mb-2" style="display:none;">
          <option value="Quiz">Quiz</option>
          <option value="Seatwork">Seatwork</option>
          <option value="Homework">Homework</option>
        </select>
        
        <input id="assess-title" placeholder="Title" class="border p-1 w-full mb-2" value="Assessment" />
        <input id="assess-max" type="number" placeholder="Max Score" class="border p-1 w-full mb-2" value="20" />
        <textarea id="assess-lo-text" class="border p-1 w-full mb-2" rows="3" readonly>${r}</textarea>
        
        <div class="flex gap-2">
          <button id="create-assess-btn" class="bg-green-600 text-white px-4 py-1 rounded">Create</button>
          <button id="close-modal" class="bg-gray-300 px-4 py-1 rounded">Cancel</button>
        </div>
      </div>
    `,document.body.appendChild(o);let s=o.querySelector(`#assess-type`),c=o.querySelector(`#assess-subtype`);s.addEventListener(`change`,()=>{c.style.display=s.value===`Written Works`?``:`none`}),o.querySelector(`#close-modal`).addEventListener(`click`,()=>o.remove()),o.querySelector(`#create-assess-btn`).addEventListener(`click`,async()=>{let t=s.value,r=c.style.display===`none`?t:c.value,i=o.querySelector(`#assess-title`).value,l=parseInt(o.querySelector(`#assess-max`).value)||0,u=o.querySelector(`#assess-lo-text`).value,d=parseInt(h.value);if(!d){alert(`Please select a subject first.`);return}try{await p.create({subject_id:d,date:n,type:r,title:i,total_score:l,scores:[],source:`grades`,school_year:a,term:m,learning_objective_id:e,learning_objectives:u}),o.remove(),S()}catch(e){alert(`Error creating assessment: `+e)}})}async function S(){let e=parseInt(h.value);if(!e)return;let t=document.getElementById(`today-assessments-list`);t.innerHTML=`<p class="text-sm">Loading...</p>`;try{let r=await(await fetch(`/api/v1/assessments/grade-entry?subject_id=${e}&school_year=${a}&term=${i}&date=${n}`)).json();if(t.innerHTML=``,r.length===0){t.innerHTML=`<p class="text-sm text-gray-500">No assessments today.</p>`;return}r.forEach(e=>{let n=document.createElement(`div`);n.className=`border p-2 rounded mb-1 text-sm flex justify-between items-center`,n.innerHTML=`
          <span>${e.type} – ${e.title} (Max: ${e.total_score})<br>
          <span class="text-xs text-gray-600">Obj: ${e.learning_objective_code||`–`}</span></span>
          <button class="text-blue-600 text-xs underline" data-id="${e.id}">View/Edit Scores</button>
        `,n.querySelector(`button`).addEventListener(`click`,()=>{window.location.hash=`#/grades?id=${e.id}`}),t.appendChild(n)})}catch{t.innerHTML=`<p class="text-red-500">Error loading assessments.</p>`}}return h.addEventListener(`change`,()=>{y(),S()}),y(),S(),e}var A=new s,j=document.getElementById(`app`);A.mount(j);function M(){let e=A.getContentArea();e.innerHTML=``;let t=window.location.hash.slice(1)||`/daily-log`;try{t===`/daily-log`?e.appendChild(k()):t===`/learners`?e.appendChild(x()):t===`/grades`?e.appendChild(C()):t===`/computed-grades`?e.appendChild(w()):t===`/classroom`?e.appendChild(T()):e.innerHTML=`<div class="p-8 text-gray-500">Page not found.</div>`}catch(t){console.error(t),e.innerHTML=`<div class="p-8 text-red-500">Error loading page.</div>`}}window.addEventListener(`hashchange`,M),window.addEventListener(`load`,M);