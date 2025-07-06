import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
  Avatar,
  Zoom,
  Fade,
  Grow,
  Collapse,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useHabits } from '../hooks/useHabits';
import { useAuth } from '../context/AuthContext';
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

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
  },
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out',
  '&.expanded': {
    transform: 'rotate(180deg)',
  },
}));

const MOTIVATIONAL_QUOTES = [
  "The best way to predict the future is to create it.",
  "The only limit to our realization of tomorrow will be our doubts of today.",
  "It always seems impossible until it's done.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Do not wait for a leader; do it alone, person to person.",
  "What you get by achieving your goals is not as important as what you become by achieving your goals.",
  "The mind is everything. What you think you become.",
  "The only true wisdom is in knowing you know nothing.",
  "Strive not to be a success, but rather to be of value.",
  "The unexamined life is not worth living.",
  "Change your thoughts and you change your world.",
  "Happiness is not something ready made. It comes from your own actions.",
  "It is better to travel well than to arrive.",
  "Life is 10% what happens to you and 90% how you react to it.",
  "The journey of a thousand miles begins with a single step.",
  "Either you run the day, or the day runs you.",
  "The only way to do great work is to love what you do.",
  "If you are not willing to risk the usual, you will have to settle for the ordinary."
];

function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    habits,
    loading,
    error,
    deleteHabit,
    logHabit
  } = useHabits();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [habitToLog, setHabitToLog] = useState(null);
  const [logNotes, setLogNotes] = useState('');
  const [expandedHabit, setExpandedHabit] = useState(null);
  const [dailyQuote, setDailyQuote] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const quoteIndex = dayOfYear % MOTIVATIONAL_QUOTES.length;
    setDailyQuote(MOTIVATIONAL_QUOTES[quoteIndex]);
  }, []);

  const handleDeleteClick = (habit) => {
    setHabitToDelete(habit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteHabit(habitToDelete._id);
      setDeleteDialogOpen(false);
      setHabitToDelete(null);
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const handleLogClick = (habit) => {
    setHabitToLog(habit);
    setLogDialogOpen(true);
  };

  const handleLogConfirm = async () => {
    try {
      await logHabit(habitToLog._id, logNotes);
      setLogDialogOpen(false);
      setHabitToLog(null);
      setLogNotes('');
    } catch (error) {
      console.error('Failed to log habit:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate dashboard statistics
  const totalHabits = habits.length;
  const totalStreaks = habits.reduce((sum, habit) => sum + habit.streakCount, 0);
  const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.streakCount), 0);
  const completedToday = habits.filter(habit => {
    const today = new Date().toDateString();
    return habit.lastCompletedDate && new Date(habit.lastCompletedDate).toDateString() === today;
  }).length;

  const toggleHabitExpand = (habitId) => {
    setExpandedHabit(expandedHabit === habitId ? null : habitId);
  };

  if (loading) {
    return (
      <BackgroundBox>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </BackgroundBox>
    );
  }

  return (
    <BackgroundBox>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1, color: 'white' }}>
          {/* Header Section */}
          <Fade in timeout={1000}>
            <Grid container justifyContent="space-between" alignItems="center" mb={4}>
              <Grid item>
                <Box display="flex" alignItems="center" gap={2}>
                  <AnimatedAvatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </AnimatedAvatar>
                  <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                      Welcome, {user?.name}!
                    </Typography>
                    <Typography color="textSecondary" sx={{ fontSize: '1.1rem' }}>
                      Track your habits and build streaks
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item>
                <Box display="flex" gap={2}>
                  <Tooltip title="View Analytics" arrow>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<AnalyticsIcon />}
                      onClick={() => navigate('/analytics')}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        boxShadow: theme.shadows[4],
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      Analytics
                    </Button>
                  </Tooltip>
                  <Tooltip title="Add New Habit" arrow>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/habits/new')}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        boxShadow: theme.shadows[4],
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      Add Habit
                    </Button>
                  </Tooltip>
                  <Tooltip title="Logout" arrow>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                      }}
                    >
                      Logout
                    </Button>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Fade>

          {error && (
            <Fade in timeout={500}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          {/* Daily Motivation Section */}
          <Fade in timeout={1200}>
            <Paper 
              elevation={3} 
              sx={{
                p: 3,
                mb: 4,
                textAlign: 'center',
                background: `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.success.main} 90%)`,
                color: 'white',
                borderRadius: 2,
                boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Daily Motivation
              </Typography>
              <Typography variant="h6" fontStyle="italic">
                "{dailyQuote}"
              </Typography>
            </Paper>
          </Fade>

          {/* Quick Stats Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { value: totalHabits, label: 'Total Habits', icon: <TrophyIcon />, color: 'primary.light' },
              { value: totalStreaks, label: 'Total Streaks', icon: <TrendingUpIcon />, color: 'success.light' },
              { value: longestStreak, label: 'Longest Streak', icon: <TrophyIcon />, color: 'warning.light' },
              { value: completedToday, label: 'Completed Today', icon: <CalendarIcon />, color: 'info.light' }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <Grow in timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                  <StatCard elevation={2} sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <AnimatedAvatar sx={{ bgcolor: stat.color }}>
                        {stat.icon}
                      </AnimatedAvatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {stat.value}
                        </Typography>
                        <Typography color="textSecondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </StatCard>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {/* Habits Grid */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Your Habits
          </Typography>
          <Grid container spacing={3}>
            {habits.map((habit, index) => (
              <Grid item xs={12} sm={6} md={4} key={habit._id}>
                <Grow in timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                  <StyledCard>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                          {habit.name}
                        </Typography>
                        <Box>
                          <Tooltip title="Edit Habit" arrow>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/habits/${habit._id}/edit`)}
                              sx={{ '&:hover': { color: theme.palette.primary.main } }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Habit" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(habit)}
                              sx={{ '&:hover': { color: theme.palette.error.main } }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={expandedHabit === habit._id ? "Show Less" : "Show More"} arrow>
                            <ExpandButton
                              size="small"
                              onClick={() => toggleHabitExpand(habit._id)}
                              className={expandedHabit === habit._id ? 'expanded' : ''}
                            >
                              {expandedHabit === habit._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ExpandButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Typography color="textSecondary" gutterBottom>
                        {habit.description}
                      </Typography>

                      <Box display="flex" alignItems="center" mt={2}>
                        <Typography variant="h4" color="primary" mr={1} sx={{ fontWeight: 'bold' }}>
                          {habit.streakCount}
                        </Typography>
                        <Typography color="textSecondary">
                          day{habit.streakCount !== 1 ? 's' : ''} streak
                        </Typography>
                      </Box>

                      <Collapse in={expandedHabit === habit._id}>
                        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Frequency:</strong> {habit.frequency}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Reminder Time:</strong> {habit.reminderTime}
                          </Typography>
                        </Box>
                      </Collapse>

                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleLogClick(habit)}
                        sx={{
                          mt: 2,
                          borderRadius: '20px',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        Log Today
                      </Button>
                    </CardContent>
                  </StyledCard>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {habits.length === 0 && (
            <Zoom in timeout={1000}>
              <Paper 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  mt: 4,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.main} 90%)`,
                  color: 'white'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  No habits yet
                </Typography>
                <Typography paragraph>
                  Start by adding your first habit to begin tracking your progress!
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/habits/new')}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    px: 4,
                    py: 1,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  Create Your First Habit
                </Button>
              </Paper>
            </Zoom>
          )}
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          TransitionComponent={Zoom}
        >
          <DialogTitle>Delete Habit</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{habitToDelete?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Log Habit Dialog */}
        <Dialog 
          open={logDialogOpen} 
          onClose={() => setLogDialogOpen(false)}
          TransitionComponent={Zoom}
        >
          <DialogTitle>Log Habit Completion</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Notes (optional)"
              multiline
              rows={3}
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLogDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLogConfirm} color="primary">
              Log
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </BackgroundBox>
  );
}

export default Dashboard; 