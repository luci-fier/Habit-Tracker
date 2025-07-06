import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import api from '../utils/api';
import { styled } from '@mui/material/styles';

const BackgroundBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.secondary.dark, 0.95)} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%)`,
    animation: 'pulse 8s ease-in-out infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.5,
    animation: 'slide 20s linear infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 0.5,
    },
    '50%': {
      transform: 'scale(1.5)',
      opacity: 0.2,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 0.5,
    },
  },
  '@keyframes slide': {
    '0%': {
      backgroundPosition: '0 0',
    },
    '100%': {
      backgroundPosition: '100px 100px',
    },
  },
}));

function Analytics() {
  const theme = useTheme();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/analytics');
        setAnalyticsData(response.data);
        // Set default selected habit if available
        if (response.data.habitCompletions.length > 0) {
          setSelectedHabit(response.data.habitCompletions[0].habitId);
        }
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#8dd1e1'];

  const getHabitData = (habitId) => {
    return analyticsData?.habitCompletions.find(h => h.habitId === habitId);
  };

  const getStreakData = (habitId) => {
    return analyticsData?.streakHistory.find(h => h.habitId === habitId);
  };

  if (loading) {
    return (
      <BackgroundBox>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} thickness={4} sx={{ color: 'white' }}/>
        </Box>
      </BackgroundBox>
    );
  }

  if (error) {
    return (
      <BackgroundBox>
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </BackgroundBox>
    );
  }

  if (!analyticsData || (analyticsData.overallProgress.length === 0 && analyticsData.habitCompletions.length === 0)) {
    return (
      <BackgroundBox>
        <Box sx={{ mt: 4, mb: 4, color: 'white' }}>
          <Paper 
            elevation={3} 
            sx={{
              p: 4, 
              textAlign: 'center', 
              background: `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.main} 90%)`,
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              No Analytics Data Yet
            </Typography>
            <Typography variant="body1">
              Start logging your habits to see insightful charts and progress here!
            </Typography>
          </Paper>
        </Box>
      </BackgroundBox>
    );
  }

  const currentHabitCompletionData = selectedHabit ? getHabitData(selectedHabit)?.data : [];
  const currentHabitStreakData = selectedHabit ? getStreakData(selectedHabit)?.data : [];

  const totalCompletions = analyticsData.habitCompletions.map(h => ({
    name: h.name,
    value: h.data.reduce((sum, entry) => sum + entry.count, 0)
  })).filter(h => h.value > 0);

  return (
    <BackgroundBox>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, color: 'white', position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            Habit Analytics & Insights
          </Typography>

          <Grid container spacing={4}>
            {/* Overall Progress Chart */}
            {analyticsData.overallProgress.length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, background: alpha(theme.palette.background.paper, 0.8), borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>Overall Habit Completions Over Time</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.overallProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.3)} />
                      <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip 
                        contentStyle={{ background: theme.palette.background.paper, border: 'none', borderRadius: 5, boxShadow: theme.shadows[3] }}
                        labelStyle={{ color: theme.palette.text.primary }}
                        itemStyle={{ color: theme.palette.text.primary }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={2} name="Completions" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Habit Completion Breakdown (Pie Chart) */}
            {totalCompletions.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, background: alpha(theme.palette.background.paper, 0.8), borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>Habit Completion Breakdown</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={totalCompletions}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {totalCompletions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: theme.palette.background.paper, border: 'none', borderRadius: 5, boxShadow: theme.shadows[3] }}
                        labelStyle={{ color: theme.palette.text.primary }}
                        itemStyle={{ color: theme.palette.text.primary }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Individual Habit Progress (Bar Chart) */}
            {analyticsData.habitCompletions.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, background: alpha(theme.palette.background.paper, 0.8), borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>Individual Habit Progress</Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: theme.palette.text.secondary }}>Select Habit</InputLabel>
                    <Select
                      value={selectedHabit}
                      onChange={(e) => setSelectedHabit(e.target.value)}
                      label="Select Habit"
                      sx={{ color: theme.palette.text.primary, '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.secondary } }}
                    >
                      {analyticsData.habitCompletions.map(habit => (
                        <MenuItem key={habit.habitId} value={habit.habitId}>
                          {habit.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {currentHabitCompletionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={currentHabitCompletionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.3)} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <Tooltip 
                          contentStyle={{ background: theme.palette.background.paper, border: 'none', borderRadius: 5, boxShadow: theme.shadows[3] }}
                          labelStyle={{ color: theme.palette.text.primary }}
                          itemStyle={{ color: theme.palette.text.primary }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill={theme.palette.primary.main} name="Completions" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      No completion data for this habit yet.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Habit Streak History (Line Chart) */}
            {analyticsData.streakHistory.length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, background: alpha(theme.palette.background.paper, 0.8), borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>Habit Streak History</Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: theme.palette.text.secondary }}>Select Habit for Streak</InputLabel>
                    <Select
                      value={selectedHabit}
                      onChange={(e) => setSelectedHabit(e.target.value)}
                      label="Select Habit for Streak"
                      sx={{ color: theme.palette.text.primary, '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.secondary } }}
                    >
                      {analyticsData.streakHistory.map(habit => (
                        <MenuItem key={habit.habitId} value={habit.habitId}>
                          {habit.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {currentHabitStreakData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={currentHabitStreakData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.3)} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <Tooltip 
                          contentStyle={{ background: theme.palette.background.paper, border: 'none', borderRadius: 5, boxShadow: theme.shadows[3] }}
                          labelStyle={{ color: theme.palette.text.primary }}
                          itemStyle={{ color: theme.palette.text.primary }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="streak" stroke={theme.palette.secondary.main} strokeWidth={2} name="Streak" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      No streak data for this habit yet.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>
    </BackgroundBox>
  );
}

export default Analytics; 