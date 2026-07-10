import '../style.css';
import { MainLayout } from '../layouts/main-layout';
import { renderLearnersPage } from '../modules/learners/pages/learners-page';
import { renderGradeEntryPage } from '../modules/grades/pages/grade-entry-page';
import { renderComputedGradesPage } from '../modules/grades/pages/computed-grade-page';
import { renderMonitoringPage } from '../modules/classroom/pages/monitoring-page';
import { renderDailyLogPage } from '../modules/daily-log/pages/daily-log-pages';

const layout = new MainLayout();
const app = document.getElementById('app')!;
layout.mount(app);

function route() {
  const content = layout.getContentArea();
  content.innerHTML = '';

  const hash = window.location.hash.slice(1) || '/daily-log';

  try {
    if (hash === '/daily-log') {
      content.appendChild(renderDailyLogPage());
    } else if (hash === '/learners') {
      content.appendChild(renderLearnersPage());
    } else if (hash === '/grades') {
      content.appendChild(renderGradeEntryPage());
    } else if (hash === '/computed-grades') {
      content.appendChild(renderComputedGradesPage());
    } else if (hash === '/classroom') {
      content.appendChild(renderMonitoringPage());
    } else {
      content.innerHTML = '<div class="p-8 text-gray-500">Page not found.</div>';
    }
  } catch (err) {
    console.error(err);
    content.innerHTML = '<div class="p-8 text-red-500">Error loading page.</div>';
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);