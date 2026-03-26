const API_URL = "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("neuralpath_token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
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
  updatePortfolio: (data: any) => 
    request<any>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboard: () => request<any>("/dashboard"),

  // Courses
  getCourses: () => request<any[]>("/courses"),
  getCourse: (id: string) => request<any>(`/courses/${id}`),
  enrollCourse: (id: string, paymentData?: { paymentConfirmed: boolean; paymentMethod: string }) =>
    request<any>(`/courses/${id}/enroll`, {
      method: "POST",
      body: JSON.stringify(paymentData || {}),
    }),

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

  // Projects
  getProjects: () => request<any[]>("/projects"),
  submitProject: (id: string) =>
    request<any>(`/projects/${id}/submit`, { method: "POST" }),

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
};
