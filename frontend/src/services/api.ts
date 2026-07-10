// src/services/api.ts
const BASE = '/api/v1';

export interface Learner {
  id: number;
  lrn: string | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  extension: string | null;
  gender: 'male' | 'female';
  birth_date: string;       // YYYY-MM-DD
  age: number;
  mother_tongue: string | null;
  ip: boolean;
  religion: string | null;
  address: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  is_active: boolean;
}

export type LearnerFormData = Omit<Learner, 'id' | 'is_active'>;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const LearnersAPI = {
  getAll: (activeOnly = true) =>
    request<Learner[]>(`/learners/?active_only=${activeOnly}`),

  getOne: (id: number) =>
    request<Learner>(`/learners/${id}`),

  create: (data: LearnerFormData) =>
    request<Learner>('/learners/', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<LearnerFormData>) =>
    request<Learner>(`/learners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  archive: (id: number) =>
    request<{ message: string }>(`/learners/${id}`, { method: 'DELETE' }),

  importSF1: async (file: File): Promise<{ imported: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/learners/import/sf1`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Import failed');
    return res.json();
  },
  permanentlyDelete: (id: number) =>
    request<{ message: string }>(`/learners/${id}/permanent`, { method: 'DELETE' }),
};

// Subject
export interface Subject {
  id: number;
  name: string;
  code: string | null;
}

// Attendance
export interface AttendanceRecord {
  student_id: number;
  status: string;
}

// Lesson
export interface LessonData {
  subject_id: number;
  date: string;
  title?: string;
  description?: string;
  competencies?: string;
  resources?: string;
  notes?: string;
}

// Assessment
export interface ScoreEntry {
  student_id: number;
  score: number;
}
export interface AssessmentCreate {
  subject_id: number;
  date: string;
  type: string;
  title: string;
  total_score: number;
  description?: string;
  scores: ScoreEntry[];
}
export interface AssessmentOut {
  id: number;
  subject_id: number;
  date: string;
  type: string;
  title: string;
  total_score: number;
  description?: string;
  scores: ScoreEntry[];
}

// Add methods to LearnersAPI? No, create separate objects.
export const SubjectsAPI = {
  getAll: () => request<Subject[]>('/subjects/'),
  create: (data: { name: string; code?: string }) =>
    request<Subject>('/subjects/', { method: 'POST', body: JSON.stringify(data) }),
};

export const AttendanceAPI = {
  get: (date: string, session: string) =>
    request<AttendanceRecord[]>(`/attendance/?date=${date}&session=${session}`),
  save: (data: { date: string; session: string; records: { student_id: number; status: string }[] }) =>
    request<{ message: string }>('/attendance/bulk', { method: 'POST', body: JSON.stringify(data) }),
};

export const LessonAPI = {
  get: (date: string, subjectId: number) =>
    request<LessonData | null>(`/lessons/?date=${date}&subject_id=${subjectId}`),
  save: (data: LessonData) =>
    request<LessonData>('/lessons/', { method: 'POST', body: JSON.stringify(data) }),
};

export const AssessmentAPI = {
  create: (data: AssessmentCreate) =>
    request<AssessmentOut>('/assessments/', { method: 'POST', body: JSON.stringify(data) }),
  getForDate: (date: string, subjectId: number) =>
    request<AssessmentOut[]>(`/assessments/?date=${date}&subject_id=${subjectId}`),
};


// Assessment Subtypes
export interface SubtypeGroups {
  [parentType: string]: string[];
}

export const AssessmentSubtypesAPI = {
  getAll: () => request<SubtypeGroups>('/assessment-subtypes/'),
};

// Grade Entry (assessments extended)
export const GradeAssessmentsAPI = {
  create: (data: any) => request<any>('/assessments/', { method: 'POST', body: JSON.stringify(data) }),
  getForGradeEntry: (params: { subject_id: number; school_year: string; term: number; type?: string; subtype?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/assessments/grade-entry?${q}`);
  },
  update: (id: number, data: any) => request<any>(`/assessments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getOne: (id: number) => request<any>(`/assessments/${id}`),
};

// Grades
export interface GradeRow {
  student_id: number;
  ww_average: number;
  pt_average: number;
  te_score: number;
  final_grade: number;
}

export const GradesAPI = {
  getTermSummary: (subjectId: number, schoolYear: string, term: number, useSaved = false) =>
    request<GradeRow[]>(`/grades/term-summary?subject_id=${subjectId}&school_year=${schoolYear}&term=${term}&use_saved=${useSaved}`),
  save: (data: { subject_id: number; school_year: string; term: number; grades: GradeRow[] }) =>
    request<{ message: string }>('/grades/save', { method: 'POST', body: JSON.stringify(data) }),
  getWeights: () => request<any[]>('/grades/weights'),
  setWeight: (ww: number, pt: number, te: number, subjectId?: number) =>
    request<{ message: string }>(`/grades/weights?ww=${ww}&pt=${pt}&te=${te}${subjectId ? `&subject_id=${subjectId}` : ''}`, { method: 'POST' }),
};
