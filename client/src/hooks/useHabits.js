import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/api/habits');
      setHabits(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (habitData) => {
    try {
      const response = await api.post('/api/habits', habitData);
      setHabits(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create habit');
    }
  };

  const updateHabit = async (id, habitData) => {
    try {
      const response = await api.patch(`/api/habits/${id}`, habitData);
      setHabits(prev => prev.map(habit => 
        habit._id === id ? response.data : habit
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update habit');
    }
  };

  const deleteHabit = async (id) => {
    try {
      await api.delete(`/api/habits/${id}`);
      setHabits(prev => prev.filter(habit => habit._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete habit');
    }
  };

  const logHabit = async (habitId, notes = '') => {
    try {
      const response = await api.post('/api/logs', { habitId, notes });
      // Update the habit's streak count in the local state
      setHabits(prev => prev.map(habit => 
        habit._id === habitId 
          ? { 
              ...habit, 
              streakCount: response.data.habit.streakCount, 
              lastCompletedDate: response.data.habit.lastCompletedDate 
            }
          : habit
      ));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to log habit');
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabit,
    refreshHabits: fetchHabits
  };
}; 