import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useHabits } from '../hooks/useHabits';
import api from '../utils/api';

function HabitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, loading, error, deleteHabit, logHabit } = useHabits();
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState('');
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logNotes, setLogNotes] = useState('');

  const habit = habits?.find(h => h._id === id);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get(`/logs/habit/${id}`);
        setLogs(response.data);
      } catch (error) {
        setLogsError('Failed to fetch habit logs');
        console.error('Error fetching logs:', error);
      } finally {
        setLogsLoading(false);
      }
    };

    if (id) {
      fetchLogs();
    }
  }, [id]);

  const handleLogClick = () => {
    setLogDialogOpen(true);
  };

  const handleLogConfirm = async () => {
    try {
      await logHabit(id, logNotes);
      setLogDialogOpen(false);
      setLogNotes('');
      // Refresh logs
      const response = await api.get(`/logs/habit/${id}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to log habit:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await deleteHabit(id);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete habit:', error);
      }
    }
  };

  if (loading || logsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || logsError) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || logsError}
        </Alert>
      </Container>
    );
  }

  if (!habit) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Habit not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" component="h1">
                  {habit.name}
                </Typography>
                <IconButton
                  color="error"
                  onClick={handleDelete}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography color="textSecondary" paragraph>
                {habit.description}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Habit Details
                </Typography>
                <Typography>
                  <strong>Frequency:</strong> {habit.frequency}
                </Typography>
                <Typography>
                  <strong>Reminder Time:</strong> {habit.reminderTime}
                </Typography>
                <Typography>
                  <strong>Current Streak:</strong> {habit.streakCount} days
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleLogClick}
                >
                  Log Today
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Logs
                </Typography>
                {logs.length === 0 ? (
                  <Typography color="textSecondary">
                    No logs yet. Start tracking your progress!
                  </Typography>
                ) : (
                  <List>
                    {logs.map((log, index) => (
                      <React.Fragment key={log._id}>
                        <ListItem>
                          <ListItemText
                            primary={new Date(log.date).toLocaleDateString()}
                            secondary={log.notes}
                          />
                        </ListItem>
                        {index < logs.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Log Dialog */}
      <Dialog open={logDialogOpen} onClose={() => setLogDialogOpen(false)}>
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
  );
}

export default HabitDetails; 