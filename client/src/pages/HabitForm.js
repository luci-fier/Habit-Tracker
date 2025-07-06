import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useHabits } from '../hooks/useHabits';

function HabitForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const {
    habits,
    loading,
    error,
    createHabit,
    updateHabit
  } = useHabits();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    reminderTime: '09:00',
    reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isEditMode && habits) {
      const habit = habits.find(h => h._id === id);
      if (habit) {
        setFormData({
          name: habit.name,
          description: habit.description,
          frequency: habit.frequency,
          reminderTime: habit.reminderTime,
          reminderDays: habit.reminderDays
        });
      }
    }
  }, [isEditMode, id, habits]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Habit name is required');
      return;
    }

    try {
      if (isEditMode) {
        await updateHabit(id, formData);
      } else {
        await createHabit(formData);
      }
      navigate('/');
    } catch (error) {
      setFormError(error.response?.data?.message || 'An error occurred');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Edit Habit' : 'Create New Habit'}
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Habit Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Frequency</InputLabel>
            <Select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              label="Frequency"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Reminder Time"
            name="reminderTime"
            type="time"
            value={formData.reminderTime}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              {isEditMode ? 'Update Habit' : 'Create Habit'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default HabitForm; 