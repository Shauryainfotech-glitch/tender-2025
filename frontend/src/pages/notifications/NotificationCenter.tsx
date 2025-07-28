import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';

const NotificationCenter: React.FC = () => {
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const [emailTemplate, setEmailTemplate] = React.useState('');
  const [notificationSettings, setNotificationSettings] = React.useState({
    email: true,
    push: true,
    sms: false,
  });
  const [notificationList, setNotificationList] = React.useState([
    { id: 1, message: 'Contract #123456 was approved', type: 'email', date: '2025-07-01' },
    { id: 2, message: 'New vendor registration', type: 'push', date: '2025-07-02' },
    { id: 3, message: 'Payment received for Contract #789101', type: 'sms', date: '2025-07-03' }
  ]);

  const handleTemplateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailTemplate(event.target.value);
  };

  const handleNotificationTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTypes: string[],
  ) => {
    setNotificationSettings({
      email: newTypes.includes('email'),
      push: newTypes.includes('push'),
      sms: newTypes.includes('sms'),
    });
  };

  const handleEmailDialogOpen = () => {
    setEmailDialogOpen(true);
  };

  const handleEmailDialogClose = () => {
    setEmailDialogOpen(false);
  };

  return (
    <Box px={3} py={5}>
      <Typography variant="h4" mb={3}>
        Notification Center
      </Typography>

      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Notification Settings
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Notification Types
              </Typography>
              <ToggleButtonGroup
                value={Object.keys(notificationSettings).filter(
                  (key) => notificationSettings[key as keyof typeof notificationSettings]
                )}
                onChange={handleNotificationTypeChange}
                aria-label="notification types"
              >
                <ToggleButton value="email" aria-label="email">
                  Email
                </ToggleButton>
                <ToggleButton value="push" aria-label="push">
                  Push
                </ToggleButton>
                <ToggleButton value="sms" aria-label="sms">
                  SMS
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Email Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.email}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        email: e.target.checked,
                      }))
                    }
                  />
                }
                label="Enable Email Notifications"
              />

              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ mt: 3 }}
                onClick={handleEmailDialogOpen}
              >
                Edit Email Templates
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Recent Notifications
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                {notificationList.map((notification) => (
                  <ListItem key={notification.id} secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  }>
                    <ListItemText
                      primary={notification.message}
                      secondary={`Type: ${notification.type.toUpperCase()} | Date: ${notification.date}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={emailDialogOpen} onClose={handleEmailDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Email Template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Template"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={emailTemplate}
            onChange={handleTemplateChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEmailDialogClose}>Cancel</Button>
          <Button onClick={handleEmailDialogClose} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationCenter;

