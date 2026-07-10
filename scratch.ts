import { renderClassroomPage } from '../modules/classroom/pages/classroom-page';

// Inside router function
if (hash === '/classroom') {
    app.innerHTML = '';
    app.appendChild(renderClassroomPage());
}