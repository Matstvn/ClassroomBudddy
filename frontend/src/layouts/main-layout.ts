export class MainLayout {
  private element: HTMLElement;
  private contentArea: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'flex flex-row h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden';

    // Left-aligned Sidebar
    const sidebar = document.createElement('aside');
    sidebar.className = 'w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col h-full text-slate-300 shrink-0';
    sidebar.innerHTML = `
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
    `;

    // Content area where pages will be rendered
    this.contentArea = document.createElement('main');
    this.contentArea.id = 'content';
    this.contentArea.className = 'flex-1 overflow-auto bg-slate-950 p-8 animate-fade-in';

    this.element.appendChild(sidebar);
    this.element.appendChild(this.contentArea);

    // Update active link on hash change
    window.addEventListener('hashchange', () => this.highlightActive());
    this.highlightActive();
  }

  /** Append the layout to a parent DOM element */
  mount(parent: HTMLElement) {
    parent.appendChild(this.element);
  }

  /** Return the container where page content should be injected */
  getContentArea(): HTMLElement {
    return this.contentArea;
  }

  /** Highlight the active navigation link */
  private highlightActive() {
    // Reset/retrigger page animation
    this.contentArea.classList.remove('animate-fade-in');
    void this.contentArea.offsetWidth; // Trigger reflow to restart animation
    this.contentArea.classList.add('animate-fade-in');

    const links = this.element.querySelectorAll('aside nav a');
    links.forEach(link => {
      // Remove active classes
      link.classList.remove(
        'text-indigo-400',
        'bg-indigo-950/30',
        'shadow-[inset_0_0_12px_rgba(99,102,241,0.15)]',
        'ring-1',
        'ring-indigo-500/30'
      );
      link.classList.add('text-slate-400');
      
      const icon = link.querySelector('svg');
      if (icon) {
        icon.classList.remove('text-indigo-400');
        icon.classList.add('text-slate-400');
      }
    });

    const currentHash = window.location.hash || '#/daily-log';
    const activeLink = this.element.querySelector(`aside nav a[href="${currentHash}"]`);
    if (activeLink) {
      activeLink.classList.remove('text-slate-400');
      activeLink.classList.add(
        'text-indigo-400',
        'bg-indigo-950/30',
        'shadow-[inset_0_0_12px_rgba(99,102,241,0.15)]',
        'ring-1',
        'ring-indigo-500/30'
      );
      
      const icon = activeLink.querySelector('svg');
      if (icon) {
        icon.classList.remove('text-slate-400');
        icon.classList.add('text-indigo-400');
      }
    }
  }
}