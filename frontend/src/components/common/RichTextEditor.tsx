import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  FormHelperText,
  Typography,
  useTheme,
} from '@mui/material';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Custom toolbar icons
const CustomUndo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
    <path className="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9" />
  </svg>
);

const CustomRedo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
    <path className="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5" />
  </svg>
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: number;
  maxHeight?: number;
  toolbar?: 'full' | 'basic' | 'minimal' | false;
  label?: string;
  required?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  error = false,
  helperText,
  disabled = false,
  readOnly = false,
  minHeight = 200,
  maxHeight = 600,
  toolbar = 'full',
  label,
  required = false,
}) => {
  const theme = useTheme();

  // Define toolbar options based on type
  const getToolbarOptions = () => {
    if (toolbar === false) return false;
    
    const toolbarOptions = {
      full: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }, { 'align': [] }],
        ['link', 'image', 'video', 'formula'],
        ['clean'],
        ['undo', 'redo'],
      ],
      basic: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
      minimal: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean'],
      ],
    };

    return toolbarOptions[toolbar] || toolbarOptions.full;
  };

  // Custom modules configuration
  const modules = useMemo(() => {
    const config: any = {
      toolbar: getToolbarOptions(),
      clipboard: {
        matchVisual: false,
      },
    };

    // Add undo/redo handlers if toolbar includes them
    if (toolbar === 'full') {
      config.history = {
        delay: 1000,
        maxStack: 50,
        userOnly: true,
      };
    }

    return config;
  }, [toolbar]);

  // Custom formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'indent', 'direction', 'align',
    'link', 'image', 'video', 'formula',
  ];

  // Handle change
  const handleChange = useCallback((content: string, delta: any, source: string, editor: any) => {
    if (source === 'user') {
      onChange(content);
    }
  }, [onChange]);

  // Custom styles
  const editorStyles = {
    '.quill': {
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
      transition: 'border-color 0.3s',
      '&:hover': {
        borderColor: error ? theme.palette.error.main : theme.palette.action.hover,
      },
    },
    '.ql-toolbar': {
      backgroundColor: theme.palette.background.default,
      borderBottom: `1px solid ${theme.palette.divider}`,
      borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    },
    '.ql-container': {
      fontSize: theme.typography.body1.fontSize,
      fontFamily: theme.typography.fontFamily,
      borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    },
    '.ql-editor': {
      minHeight: `${minHeight}px`,
      maxHeight: `${maxHeight}px`,
      overflowY: 'auto',
      padding: theme.spacing(2),
      '&.ql-blank::before': {
        color: theme.palette.text.secondary,
        fontStyle: 'normal',
      },
    },
    '.ql-editor p': {
      marginBottom: theme.spacing(1),
    },
    '.ql-editor h1': {
      fontSize: '2em',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    '.ql-editor h2': {
      fontSize: '1.5em',
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(1),
    },
    '.ql-editor h3': {
      fontSize: '1.3em',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(0.5),
    },
    '.ql-snow .ql-stroke': {
      stroke: theme.palette.text.primary,
    },
    '.ql-snow .ql-fill': {
      fill: theme.palette.text.primary,
    },
    '.ql-toolbar button:hover .ql-stroke': {
      stroke: theme.palette.primary.main,
    },
    '.ql-toolbar button:hover .ql-fill': {
      fill: theme.palette.primary.main,
    },
    '.ql-toolbar button.ql-active .ql-stroke': {
      stroke: theme.palette.primary.main,
    },
    '.ql-toolbar button.ql-active .ql-fill': {
      fill: theme.palette.primary.main,
    },
    // Disabled state
    '&.disabled': {
      '.quill': {
        backgroundColor: theme.palette.action.disabledBackground,
        cursor: 'not-allowed',
      },
      '.ql-toolbar': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
      '.ql-editor': {
        cursor: 'not-allowed',
      },
    },
  };

  // Register custom icons
  React.useEffect(() => {
    if (toolbar === 'full') {
      const icons = Quill.import('ui/icons');
      icons['undo'] = CustomUndo;
      icons['redo'] = CustomRedo;
    }
  }, [toolbar]);

  // Add undo/redo handlers
  React.useEffect(() => {
    if (toolbar === 'full') {
      const handleUndo = () => {
        const quill = (window as any).quillRef;
        if (quill) {
          quill.history.undo();
        }
      };

      const handleRedo = () => {
        const quill = (window as any).quillRef;
        if (quill) {
          quill.history.redo();
        }
      };

      // Add keyboard shortcuts
      const handleKeyboard = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            handleUndo();
          } else if (e.key === 'z' && e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else if (e.key === 'y') {
            e.preventDefault();
            handleRedo();
          }
        }
      };

      document.addEventListener('keydown', handleKeyboard);
      return () => {
        document.removeEventListener('keydown', handleKeyboard);
      };
    }
  }, [toolbar]);

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
          {required && <span style={{ color: theme.palette.error.main }}> *</span>}
        </Typography>
      )}
      <Box sx={editorStyles} className={disabled ? 'disabled' : ''}>
        <ReactQuill
          ref={(el) => {
            if (el) {
              (window as any).quillRef = el.getEditor();
            }
          }}
          theme="snow"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          readOnly={readOnly || disabled}
        />
      </Box>
      {helperText && (
        <FormHelperText error={error} sx={{ mt: 1 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default RichTextEditor;
