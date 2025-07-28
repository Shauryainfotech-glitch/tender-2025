import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  Chip,
  Paper,
  Grid,
  Tooltip,
  FormGroup,
  TextField,
  RadioGroup,
  Radio,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Contrast as ContrastIcon,
  Keyboard as KeyboardIcon,
  VolumeUp as VolumeUpIcon,
  TextFields as TextFieldsIcon,
  Speed as SpeedIcon,
  Mouse as MouseIcon,
  Visibility as VisibilityIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FormatSize as FormatSizeIcon,
  InvertColors as InvertColorsIcon,
  Brightness6 as Brightness6Icon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { AccessibilityContext } from '../contexts/AccessibilityContext';
import accessibilityService from '../services/accessibilityService';

interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: string;
  reducedMotion: boolean;
  cursorSize: 'normal' | 'large' | 'extra-large';
  
  // Audio
  screenReaderEnabled: boolean;
  soundEffects: boolean;
  voiceSpeed: number;
  voicePitch: number;
  
  // Navigation
  keyboardNavigation: boolean;
  focusIndicator: 'default' | 'high-visibility' | 'custom';
  skipLinks: boolean;
  stickyFocus: boolean;
  
  // Interaction
  clickDelay: number;
  doubleClickSpeed: number;
  autoCompleteEnabled: boolean;
  confirmActions: boolean;
  
  // Content
  simplifiedUI: boolean;
  readingMode: boolean;
  hideImages: boolean;
  captions: boolean;
}

interface KeyboardShortcut {
  id: string;
  action: string;
  keys: string[];
  description: string;
  category: string;
  customizable: boolean;
}

const AccessibilitySettingsComponent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { settings, updateSettings } = useContext(AccessibilityContext);
  
  const [localSettings, setLocalSettings] = useState<AccessibilitySettings>(settings);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<KeyboardShortcut[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [accessibilityScore, setAccessibilityScore] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [activeSection, setActiveSection] = useState('visual');

  useEffect(() => {
    loadKeyboardShortcuts();
    checkAccessibilityCompliance();
  }, []);

  useEffect(() => {
    // Apply accessibility settings
    applyAccessibilitySettings(localSettings);
  }, [localSettings]);

  const loadKeyboardShortcuts = async () => {
    try {
      const shortcuts = await accessibilityService.getKeyboardShortcuts();
      setKeyboardShortcuts(shortcuts);
    } catch (error) {
      console.error('Failed to load keyboard shortcuts:', error);
    }
  };

  const checkAccessibilityCompliance = async () => {
    try {
      const score = await accessibilityService.checkWCAGCompliance();
      setAccessibilityScore(score);
    } catch (error) {
      console.error('Failed to check accessibility compliance:', error);
    }
  };

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    // Apply high contrast mode
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Apply color blind mode
    document.body.setAttribute('data-color-blind-mode', settings.colorBlindMode);

    // Apply font size
    document.documentElement.style.setProperty('--base-font-size', 
      settings.fontSize === 'small' ? '14px' :
      settings.fontSize === 'large' ? '18px' :
      settings.fontSize === 'extra-large' ? '20px' : '16px'
    );

    // Apply reduced motion
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }

    // Apply cursor size
    document.body.setAttribute('data-cursor-size', settings.cursorSize);

    // Enable/disable keyboard navigation
    if (settings.keyboardNavigation) {
      document.body.setAttribute('data-keyboard-nav', 'true');
    } else {
      document.body.removeAttribute('data-keyboard-nav');
    }

    // Apply focus indicator style
    document.body.setAttribute('data-focus-style', settings.focusIndicator);

    // Update accessibility service
    accessibilityService.updateSettings(settings);
  };

  const handleSettingChange = (setting: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...localSettings, [setting]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleSaveSettings = async () => {
    try {
      await accessibilityService.saveSettings(localSettings);
      showSnackbar('Accessibility settings saved successfully', 'success');
      setSettingsDialog(false);
    } catch (error) {
      showSnackbar('Failed to save settings', 'error');
    }
  };

  const handleResetSettings = () => {
    const defaultSettings = accessibilityService.getDefaultSettings();
    setLocalSettings(defaultSettings);
    updateSettings(defaultSettings);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const renderVisualSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Visual Settings
      </Typography>
      
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.highContrast}
              onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
              name="highContrast"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ContrastIcon />
              <span>High Contrast Mode</span>
            </Box>
          }
        />
        
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Color Blind Mode</InputLabel>
          <Select
            value={localSettings.colorBlindMode}
            onChange={(e) => handleSettingChange('colorBlindMode', e.target.value)}
            label="Color Blind Mode"
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="protanopia">Protanopia (Red-Green)</MenuItem>
            <MenuItem value="deuteranopia">Deuteranopia (Red-Green)</MenuItem>
            <MenuItem value="tritanopia">Tritanopia (Blue-Yellow)</MenuItem>
            <MenuItem value="monochrome">Monochrome</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>Font Size</Typography>
          <RadioGroup
            value={localSettings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
            row
          >
            <FormControlLabel value="small" control={<Radio />} label="Small" />
            <FormControlLabel value="medium" control={<Radio />} label="Medium" />
            <FormControlLabel value="large" control={<Radio />} label="Large" />
            <FormControlLabel value="extra-large" control={<Radio />} label="Extra Large" />
          </RadioGroup>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={localSettings.reducedMotion}
              onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
              name="reducedMotion"
            />
          }
          label="Reduce Motion"
          sx={{ mt: 2 }}
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Cursor Size</InputLabel>
          <Select
            value={localSettings.cursorSize}
            onChange={(e) => handleSettingChange('cursorSize', e.target.value)}
            label="Cursor Size"
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="large">Large</MenuItem>
            <MenuItem value="extra-large">Extra Large</MenuItem>
          </Select>
        </FormControl>
      </FormGroup>
    </Box>
  );

  const renderAudioSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Audio & Screen Reader Settings
      </Typography>
      
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.screenReaderEnabled}
              onChange={(e) => handleSettingChange('screenReaderEnabled', e.target.checked)}
              name="screenReaderEnabled"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VolumeUpIcon />
              <span>Enable Screen Reader Support</span>
            </Box>
          }
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.soundEffects}
              onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
              name="soundEffects"
            />
          }
          label="Sound Effects"
          sx={{ mt: 2 }}
        />

        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>Voice Speed</Typography>
          <Slider
            value={localSettings.voiceSpeed}
            onChange={(e, value) => handleSettingChange('voiceSpeed', value)}
            min={0.5}
            max={2}
            step={0.1}
            marks
            valueLabelDisplay="auto"
            disabled={!localSettings.screenReaderEnabled}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>Voice Pitch</Typography>
          <Slider
            value={localSettings.voicePitch}
            onChange={(e, value) => handleSettingChange('voicePitch', value)}
            min={0.5}
            max={2}
            step={0.1}
            marks
            valueLabelDisplay="auto"
            disabled={!localSettings.screenReaderEnabled}
          />
        </Box>
      </FormGroup>
    </Box>
  );

  const renderNavigationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Navigation Settings
      </Typography>
      
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.keyboardNavigation}
              onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
              name="keyboardNavigation"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyboardIcon />
              <span>Enhanced Keyboard Navigation</span>
            </Box>
          }
        />
        
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Focus Indicator Style</InputLabel>
          <Select
            value={localSettings.focusIndicator}
            onChange={(e) => handleSettingChange('focusIndicator', e.target.value)}
            label="Focus Indicator Style"
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="high-visibility">High Visibility</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={localSettings.skipLinks}
              onChange={(e) => handleSettingChange('skipLinks', e.target.checked)}
              name="skipLinks"
            />
          }
          label="Show Skip Links"
          sx={{ mt: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={localSettings.stickyFocus}
              onChange={(e) => handleSettingChange('stickyFocus', e.target.checked)}
              name="stickyFocus"
            />
          }
          label="Sticky Focus (Prevent focus loss)"
          sx={{ mt: 1 }}
        />
      </FormGroup>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Keyboard Shortcuts
        </Typography>
        <List dense>
          {keyboardShortcuts.slice(0, 5).map((shortcut) => (
            <ListItem key={shortcut.id}>
              <ListItemText
                primary={shortcut.action}
                secondary={shortcut.keys.join(' + ')}
              />
              {shortcut.customizable && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" size="small">
                    <SettingsIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
        <Button size="small" sx={{ mt: 1 }}>
          View All Shortcuts
        </Button>
      </Box>
    </Box>
  );

  const renderInteractionSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Interaction Settings
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography gutterBottom>Click Delay (ms)</Typography>
        <Slider
          value={localSettings.clickDelay}
          onChange={(e, value) => handleSettingChange('clickDelay', value)}
          min={0}
          max={1000}
          step={50}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>Double Click Speed (ms)</Typography>
        <Slider
          value={localSettings.doubleClickSpeed}
          onChange={(e, value) => handleSettingChange('doubleClickSpeed', value)}
          min={200}
          max={800}
          step={50}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      <FormGroup sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.autoCompleteEnabled}
              onChange={(e) => handleSettingChange('autoCompleteEnabled', e.target.checked)}
              name="autoCompleteEnabled"
            />
          }
          label="Enable Auto-Complete"
        />

        <FormControlLabel
          control={
            <Switch
              checked={localSettings.confirmActions}
              onChange={(e) => handleSettingChange('confirmActions', e.target.checked)}
              name="confirmActions"
            />
          }
          label="Confirm Destructive Actions"
          sx={{ mt: 1 }}
        />
      </FormGroup>
    </Box>
  );

  const renderContentSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Content Settings
      </Typography>
      
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.simplifiedUI}
              onChange={(e) => handleSettingChange('simplifiedUI', e.target.checked)}
              name="simplifiedUI"
            />
          }
          label="Simplified UI Mode"
        />

        <FormControlLabel
          control={
            <Switch
              checked={localSettings.readingMode}
              onChange={(e) => handleSettingChange('readingMode', e.target.checked)}
              name="readingMode"
            />
          }
          label="Reading Mode"
          sx={{ mt: 1 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={localSettings.hideImages}
              onChange={(e) => handleSettingChange('hideImages', e.target.checked)}
              name="hideImages"
            />
          }
          label="Hide Images"
          sx={{ mt: 1 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={localSettings.captions}
              onChange={(e) => handleSettingChange('captions', e.target.checked)}
              name="captions"
            />
          }
          label="Show Captions"
          sx={{ mt: 1 }}
        />
      </FormGroup>
    </Box>
  );

  const renderAccessibilityScore = () => (
    <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.background.default }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6">WCAG 2.1 Compliance Score</Typography>
          <Typography variant="body2" color="textSecondary">
            Based on automated testing
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" color={
            accessibilityScore >= 90 ? 'success.main' :
            accessibilityScore >= 70 ? 'warning.main' : 'error.main'
          }>
            {accessibilityScore}%
          </Typography>
          <Chip
            label={
              accessibilityScore >= 90 ? 'AA Compliant' :
              accessibilityScore >= 70 ? 'Partially Compliant' : 'Non-Compliant'
            }
            color={
              accessibilityScore >= 90 ? 'success' :
              accessibilityScore >= 70 ? 'warning' : 'error'
            }
            size="small"
          />
        </Box>
      </Box>
      <Button
        variant="outlined"
        size="small"
        sx={{ mt: 2 }}
        onClick={() => accessibilityService.runAccessibilityAudit()}
      >
        Run Full Audit
      </Button>
    </Paper>
  );

  return (
    <>
      {/* Quick Access Button */}
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="Accessibility settings"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => setSettingsDialog(true)}
        >
          <AccessibilityIcon />
        </Fab>
      </Zoom>

      {/* Main Settings Dialog */}
      <Dialog
        open={settingsDialog}
        onClose={() => setSettingsDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessibilityIcon />
              <Typography variant="h6">Accessibility Settings</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => setShowHelp(true)}>
                <HelpIcon />
              </IconButton>
              <IconButton onClick={() => setSettingsDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {renderAccessibilityScore()}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <List>
                {[
                  { id: 'visual', label: 'Visual', icon: <VisibilityIcon /> },
                  { id: 'audio', label: 'Audio', icon: <VolumeUpIcon /> },
                  { id: 'navigation', label: 'Navigation', icon: <KeyboardIcon /> },
                  { id: 'interaction', label: 'Interaction', icon: <MouseIcon /> },
                  { id: 'content', label: 'Content', icon: <TextFieldsIcon /> }
                ].map((section) => (
                  <ListItem
                    key={section.id}
                    button
                    selected={activeSection === section.id}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {section.icon}
                      <ListItemText primary={section.label} />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Card>
                <CardContent>
                  {activeSection === 'visual' && renderVisualSettings()}
                  {activeSection === 'audio' && renderAudioSettings()}
                  {activeSection === 'navigation' && renderNavigationSettings()}
                  {activeSection === 'interaction' && renderInteractionSettings()}
                  {activeSection === 'content' && renderContentSettings()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleResetSettings}>Reset to Default</Button>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Accessibility Help</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Our application is designed to be accessible to all users, including those with disabilities.
            We follow WCAG 2.1 guidelines to ensure our content is perceivable, operable, understandable, and robust.
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            Key Features:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Screen Reader Support"
                secondary="Full compatibility with popular screen readers like JAWS, NVDA, and VoiceOver"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Keyboard Navigation"
                secondary="Navigate the entire application using only the keyboard"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="High Contrast Mode"
                secondary="Improved visibility for users with low vision"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Customizable Text"
                secondary="Adjust font size and spacing for better readability"
              />
            </ListItem>
          </List>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            For additional assistance, please contact our support team at accessibility@tendermanagement.com
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelp(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AccessibilitySettingsComponent;
