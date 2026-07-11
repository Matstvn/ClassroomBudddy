import './styles/main.css';
import './services/dialog';
import { MainLayout } from './layouts/main-layout';
import { renderLearnersPage } from './modules/learners/pages/learners-page';
import { renderGradeEntryPage } from './modules/grades/pages/grade-entry-page';
import { renderComputedGradesPage } from './modules/grades/pages/computed-grade-page';
import { renderMonitoringPage } from './modules/classroom/pages/monitoring-page';
import { renderDailyLogPage } from './modules/daily-log/pages/daily-log-pages';
import { renderReadingPage } from './modules/reading/pages/reading-page';
import { renderToolsPage } from './modules/tools/pages/tools-page';
import { renderGradeSheetPage } from './modules/reports/pages/grade-sheet';
import { renderAttendanceSummaryPage } from './modules/reports/pages/attendance-summary';
import { renderIndividualReportPage } from './modules/reports/pages/individual-report';
import { renderDashboardPage } from './modules/dashboard/pages/dashboard-page';
import { renderSettingsPage } from './modules/settings/pages/settings-page';
import { renderCompetencyDetailPage } from './modules/classroom/pages/competency-detail-page';

// Inside route function:


const layout = new MainLayout();
const app = document.getElementById('app')!;
layout.mount(app);

function route() {
  const content = layout.getContentArea();
  content.innerHTML = '';

  const hash = window.location.hash.slice(1) || '/dashboard';// default changed

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
    } 
   else if (hash === '/reading') {
    content.appendChild(renderReadingPage());
  }else if (hash === '/tools') {
    content.appendChild(renderToolsPage());
  } else if (hash === '/reports/grade-sheet') {
    content.appendChild(renderGradeSheetPage());
  }// inside route function:
  else if (hash === '/reports/attendance-summary') {
    content.appendChild(renderAttendanceSummaryPage());
  }
    // inside route function:
  else if (hash === '/reports/individual') {
      content.appendChild(renderIndividualReportPage());
  }
  else if (hash === '/dashboard' || hash === '/') {
    content.appendChild(renderDashboardPage());
  }
  // Inside route function:
  else if (hash === '/settings') {
      content.appendChild(renderSettingsPage());
  }else if (hash.startsWith('/competency/')) {
    content.appendChild(renderCompetencyDetailPage());
} 


  //Insert here
  else {
      content.innerHTML = '<div class="p-8 text-gray-500">Page not found.</div>';
    }
  } catch (err) {
    console.error(err);
    content.innerHTML = '<div class="p-8 text-red-500">Error loading page.</div>';
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);