import { apiClient } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  profilePicture?: string;
  organizationId?: string;
  organization?: any;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  organizationId?: string;
  password: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  organizationId?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Create user
  async create(data: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  // Get all users
  async getAll(params?: any): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users', params);
    return response.data;
  },

  // Get user by ID
  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // Update user (admin)
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  // Update own profile
  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await apiClient.patch<User>('/users/profile', data);
    return response.data;
  },

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<User>('/users/profile-picture', formData);
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/users/change-password', data);
    return response.data;
  },

  // Activate user
  async activate(id: string): Promise<User> {
    const response = await apiClient.post<User>(`/users/${id}/activate`);
    return response.data;
  },

  // Deactivate user
  async deactivate(id: string): Promise<User> {
    const response = await apiClient.post<User>(`/users/${id}/deactivate`);
    return response.data;
  },

  // Suspend user
  async suspend(id: string, reason: string): Promise<User> {
    const response = await apiClient.post<User>(`/users/${id}/suspend`, { reason });
    return response.data;
  },

  // Reset user password (admin)
  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await apiClient.post<{ temporaryPassword: string }>(`/users/${id}/reset-password`);
    return response.data;
  },

  // Get user statistics
  async getStatistics(id?: string): Promise<any> {
    const url = id ? `/users/${id}/statistics` : '/users/statistics';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Delete user
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // Export users data
  async exportData(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await apiClient.get<Blob>('/users/export', { format });
    return response.data;
  },
};