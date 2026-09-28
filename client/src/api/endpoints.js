// Central map of backend endpoints — clean REST routes served by the
// Laravel API (routes/api.php). Base path (e.g. list vs detail) is given;
// callers append /{id} or /{id}/action where noted.
const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  students: {
    profile: '/students/profile',
    skills: '/students/skills',       // POST here; DELETE `${skills}/${skillId}`
    education: '/students/education', // GET/POST here; DELETE `${education}/${id}`
    resumes: '/students/resumes',     // GET/POST here; DELETE `${resumes}/${id}`
  },
  recruiters: {
    profile: '/recruiters/profile',
  },
  jobs: {
    base: '/jobs',                    // GET (list, with query params) / POST (create)
    // GET/PUT/DELETE `${base}/${id}`
    // GET `${base}/${id}/eligibility`
  },
  applications: {
    base: '/applications',            // POST (apply) / GET (list, with query params)
    // PUT `${base}/${id}/status`
    // GET `${base}/${id}/history`
  },
  departments: {
    base: '/departments',             // GET/POST here; DELETE `${base}/${id}`
  },
  skills: {
    list: '/skills',
  },
  announcements: {
    base: '/announcements',           // GET/POST here; DELETE `${base}/${id}`
  },
  notifications: {
    base: '/notifications',           // GET here
    readAll: '/notifications/read-all', // PUT
    // PUT `${base}/${id}/read`
  },
  admin: {
    students: '/admin/students',      // GET here; PUT/DELETE `${students}/${userId}`
    recruiters: '/admin/recruiters',  // GET here; PUT/DELETE `${recruiters}/${userId}`
    analytics: '/admin/analytics',
  },
};

export default endpoints;
