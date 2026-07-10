/**
 * Beautiful, non-blocking floating notification cards (toasts)
 * and premium custom confirmation dialog modals.
 */

// Icons matching tailwind design
const ICONS = {
  success: `<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
  error: `<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
  warning: `<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
  info: `<svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
};

const BARS = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-indigo-500'
};

// Check if container exists, otherwise create it
let toastContainer: HTMLDivElement | null = null;
function getToastContainer(): HTMLDivElement {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export function showToast(message: string, type: ToastType = 'info', duration = 4000) {
  const container = getToastContainer();
  
  const toast = document.createElement('div');
  toast.className = 'relative flex items-start gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 shadow-lg hover:shadow-xl rounded-xl p-4 transform translate-x-full opacity-0 transition-all duration-300 ease-out pointer-events-auto overflow-hidden group cursor-pointer';
  
  toast.innerHTML = `
    <div class="flex-shrink-0 mt-0.5">${ICONS[type]}</div>
    <div class="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 pr-4 leading-relaxed">${message}</div>
    <button class="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    <div class="absolute bottom-0 left-0 h-1 ${BARS[type]} w-full transition-all ease-linear" style="transition-duration: ${duration}ms; width: 100%;"></div>
  `;

  const progressBar = toast.querySelector('.absolute') as HTMLDivElement;

  container.appendChild(toast);

  // Trigger animation next frame
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  });

  // Start progress bar animation
  requestAnimationFrame(() => {
    if (progressBar) {
      progressBar.style.width = '0%';
    }
  });

  let dismissTimeout = setTimeout(() => dismiss(), duration);

  function dismiss() {
    toast.classList.add('translate-x-full', 'opacity-0');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }

  // Allow clicking the toast or close button to dismiss immediately
  toast.addEventListener('click', () => {
    clearTimeout(dismissTimeout);
    dismiss();
  });
}

// Automatically analyze the alert message to decide a suitable type
function inferToastType(message: string): ToastType {
  const lower = message.toLowerCase();
  if (lower.includes('error') || lower.includes('failed') || lower.includes('unable') || lower.includes('invalid') || lower.includes('enter') || lower.includes('select') || lower.includes('fill')) {
    return 'error';
  }
  if (lower.includes('success') || lower.includes('saved') || lower.includes('added') || lower.includes('updated') || lower.includes('imported') || lower.includes('done')) {
    return 'success';
  }
  if (lower.includes('warn') || lower.includes('careful') || lower.includes('attention')) {
    return 'warning';
  }
  return 'info';
}

// Global window.alert override
window.alert = (message: any) => {
  const msgStr = String(message);
  const type = inferToastType(msgStr);
  showToast(msgStr, type);
};

// Promise-based custom confirmation modal
export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function customConfirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const title = options.title || 'Confirm Action';
    const confirmText = options.confirmText || 'Confirm';
    const cancelText = options.cancelText || 'Cancel';
    const isDestructive = options.isDestructive !== false; // Default true to be safe, but can be configured

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 opacity-0 pointer-events-auto';

    const confirmIcon = isDestructive 
      ? `<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30"><svg class="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg></div>`
      : `<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30"><svg class="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg></div>`;

    const buttonClasses = isDestructive
      ? 'inline-flex w-full justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition-all sm:col-start-2 sm:mt-0'
      : 'inline-flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all sm:col-start-2 sm:mt-0';

    overlay.innerHTML = `
      <div class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 scale-95 opacity-0 duration-200 ease-out">
        <div>
          ${confirmIcon}
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-base font-semibold leading-6 text-slate-900 dark:text-white" id="modal-title">${title}</h3>
            <div class="mt-2">
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">${message}</p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button type="button" id="confirm-ok-btn" class="${buttonClasses}">${confirmText}</button>
          <button type="button" id="confirm-cancel-btn" class="mt-3 inline-flex w-full justify-center rounded-xl bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 sm:col-start-1 sm:mt-0 transition-all">
            ${cancelText}
          </button>
        </div>
      </div>
    `;

    const card = overlay.firstElementChild as HTMLDivElement;

    document.body.appendChild(overlay);

    // Trigger open animations
    requestAnimationFrame(() => {
      overlay.classList.add('opacity-100');
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });

    const cleanUp = (value: boolean) => {
      // Fade out
      overlay.classList.remove('opacity-100');
      card.classList.remove('scale-100', 'opacity-100');
      card.classList.add('scale-95', 'opacity-0');
      
      overlay.addEventListener('transitionend', () => {
        overlay.remove();
        resolve(value);
      });
    };

    overlay.querySelector('#confirm-ok-btn')!.addEventListener('click', () => cleanUp(true));
    overlay.querySelector('#confirm-cancel-btn')!.addEventListener('click', () => cleanUp(false));
    
    // Close on clicking backdrop
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanUp(false);
      }
    });
  });
}
