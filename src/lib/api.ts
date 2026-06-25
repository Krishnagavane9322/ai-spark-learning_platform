const API_URL = import.meta.env.VITE_API_URL || "/api";

function getToken(): string | null {
  return localStorage.getItem("neuralpath_token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const finalHeaders = {
    ...headers,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers: finalHeaders });

  // Safely parse body — handles empty responses and non-JSON error pages
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Server sent non-JSON (e.g. HTML error page or SPA index.html)
    if (!res.ok) throw new Error(`Server error ${res.status}: ${res.statusText}`);
    throw new Error("API returned invalid JSON (possibly an HTML fallback page).");
  }

  if (!res.ok) {
    const errorMsg = data?.details ? `${data.error}: ${data.details}` : (data?.error || data?.message || `Request failed (${res.status})`);
    console.error("API Error Response:", data);
    throw new Error(errorMsg);
  }
  return data;
}

// Auth
export const api = {
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  googleAuth: (credential: string) =>
    request<{ user: any; token: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  getMe: () => request<any>("/auth/me"),
  getPublicPortfolio: (username: string) => request<any>(`/auth/portfolio/${username}`),
  updatePortfolio: (data: any) => 
    request<any>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboard: () => request<any>("/dashboard"),
  getLeaderboard: (sortBy?: "xp" | "streak") =>
    request<{
      leaderboard: any[];
      currentUserRank: number;
      currentUser: any;
      gapToNext: number;
      nextUser: string | null;
    }>(`/dashboard/leaderboard?sortBy=${sortBy || "xp"}`),

  // Courses
  getCourses: () => request<any[]>("/courses"),
  getCourse: (id: string) => request<any>(`/courses/${id}`),
  enrollCourse: (id: string, paymentData?: { paymentConfirmed: boolean; paymentMethod: string }) =>
    request<any>(`/courses/${id}/enroll`, {
      method: "POST",
      body: JSON.stringify(paymentData || {}),
    }),
  updateCourseProgress: (courseId: string, videoUrl: string) =>
    request<any>(`/courses/${courseId}/progress`, {
      method: "POST",
      body: JSON.stringify({ videoUrl }),
    }),
  completeCourse: (id: string) =>
    request<any>(`/courses/${id}/complete`, { method: "POST" }),
  submitCourseQuiz: (id: string, answers: number[]) =>
    request<any>(`/courses/${id}/quiz/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  rateCourse: (id: string, rating: number) =>
    request<any>(`/courses/${id}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    }),
  getCertificates: () => request<any[]>("/certificates/my-certificates"),
  verifyCertificate: (id: string) => request<any>(`/certificates/verify/${id}`),

  // Razorpay Payments
  createPaymentOrder: (courseId: string) =>
    request<any>("/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    }),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; courseId: string }) =>
    request<any>("/payment/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getTransactions: () => request<any[]>("/payment/transactions"),

  // Projects
  getProjects: () => request<any[]>("/projects"),
  submitProject: (id: string) =>
    request<any>(`/projects/${id}/submit`, { method: "POST" }),

  submitProjectWithData: (id: string, formData: FormData) => {
    const token = getToken();
    return fetch(`${API_URL}/projects/${id}/submit`, {
      method: "POST",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    }).then(async (res) => {
      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { throw new Error(`Server error ${res.status}`); }
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      return data;
    });
  },

  // Peers
  getPeers: () => request<any[]>("/peers"),
  connectPeer: (id: string) =>
    request<any>(`/peers/${id}/connect`, { method: "POST" }),

  // Messages
  getMessages: (peerId: string) => request<any[]>(`/messages/${peerId}`),
  sendMessage: (peerId: string, text: string) =>
    request<any>(`/messages/${peerId}`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Notes
  getNotes: () => request<any[]>("/notes"),
  createNote: (formData: FormData) => {
    const token = getToken();
    return fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    });
  },
  deleteNote: (id: string) =>
    request<{ message: string }>(`/notes/${id}`, { method: "DELETE" }),

  // Settings
  updateProfile: (data: { name?: string; email?: string; avatar?: string }) =>
    request<any>("/settings/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateNotifications: (data: { notifications?: boolean; weeklyDigest?: boolean }) =>
    request<any>("/settings/notifications", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<any>("/settings/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Assessment
  submitAssessment: (data: { interests: string[]; skillLevel: string; goals?: string }) =>
    request<any>("/assessment", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAssessmentStatus: () => request<any>("/assessment/status"),
  completeStep: (stepId: number) =>
    request<any>(`/assessment/step/${stepId}/complete`, { method: "PUT" }),
  logActivity: (hours: number) =>
    request<any>("/assessment/log-activity", {
      method: "POST",
      body: JSON.stringify({ hours }),
    }),

  // Notifications
  getNotifications: () => request<any>("/notifications"),
  markNotificationRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, { method: "PUT" }),
  markAllNotificationsRead: () =>
    request<any>("/notifications/read-all", { method: "PUT" }),
  deleteNotification: (id: string) =>
    request<any>(`/notifications/${id}`, { method: "DELETE" }),

  // Chat
  getChatHistory: () => request<any[]>("/chat/history"),
  sendChatMessage: (message?: string, image?: string) =>
    request<any>("/chat/send", {
      method: "POST",
      body: JSON.stringify({ message, image }),
    }),
  clearChatHistory: () => request<any>("/chat/clear", { method: "POST" }),

  // Stats
  getPlatformStats: () => request<{
    totalLearners: number;
    activeLearners: number;
    coursesCompleted: number;
    projectsBuilt: number;
  }>("/stats"),

  // AI Classroom
  classroomTeacher: (message: string, history?: {role: string; content: string}[]) =>
    request<any>("/classroom/teacher", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
  classroomQuiz: (topic: string, difficulty?: string) =>
    request<any>("/classroom/quiz", {
      method: "POST",
      body: JSON.stringify({ topic, difficulty }),
    }),
  classroomExplain: (topic: string) =>
    request<any>("/classroom/explain", {
      method: "POST",
      body: JSON.stringify({ topic }),
    }),
  classroomHomework: (question: string, subject?: string) =>
    request<any>("/classroom/homework", {
      method: "POST",
      body: JSON.stringify({ question, subject }),
    }),
  classroomCode: (data: { code?: string; question?: string; language?: string }) =>
    request<any>("/classroom/code", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  classroomResume: (data: { targetRole: string; currentSkills?: string; experienceLevel?: string; goals?: string }) =>
    request<any>("/classroom/resume", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  classroomAttendance: (question: string) =>
    request<any>("/classroom/attendance", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  classroomVoiceTutor: (transcript: string, history?: {role: string; content: string}[]) =>
    request<any>("/classroom/voice-tutor", {
      method: "POST",
      body: JSON.stringify({ transcript, history }),
    }),
  classroomLearningPath: (data: { interests: string[]; skillLevel?: string; goals?: string; timeAvailable?: string }) =>
    request<any>("/classroom/learning-path", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
