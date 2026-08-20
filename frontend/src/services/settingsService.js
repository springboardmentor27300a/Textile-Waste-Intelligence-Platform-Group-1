import api from "../api/axios";

const settingsService = {
  // Get logged-in user
  async getProfile() {
    const { data } = await api.get("/auth/me");
    return data;
  },

  // Update profile
  async updateProfile(payload) {
    const { data } = await api.put("/auth/me", payload);
    return data;
  },

  // Change password
  async updatePassword(payload) {
    const { data } = await api.patch(
      "/auth/password",
      payload
    );

    return data;
  },
};

export default settingsService;