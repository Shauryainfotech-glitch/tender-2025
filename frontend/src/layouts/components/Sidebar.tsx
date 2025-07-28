import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Toolbar,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  TrendingUp,
  Business,
  People,
  Payment,
  Security,
  AccountTree,
  Analytics,
  Settings,
  Notifications,
  Description,
  ExpandLess,
  ExpandMore,
  MonetizationOn,
  Gavel,
  Assessment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface SidebarProps {
  onItemClick?: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    text: 'Tenders',
    icon: <Assignment />,
    children: [
      { text: 'All Tenders', icon: <Assignment />, path: '/tenders' },
      { text: 'Create Tender', icon: <Assignment />, path: '/tenders/create' },
    ],
  },
  {
    text: 'Bids',
    icon: <TrendingUp />,
    children: [
      { text: 'All Bids', icon: <TrendingUp />, path: '/bids' },
      { text: 'My Bids', icon: <TrendingUp />, path: '/bids/my-bids' },
    ],
  },
  {
    text: 'Organizations',
    icon: <Business />,
    path: '/organizations',
  },
  {
    text: 'Vendors',
    icon: <People />,
    children: [
      { text: 'All Vendors', icon: <People />, path: '/vendors' },
      { text: 'Add Vendor', icon: <People />, path: '/vendors/create' },
    ],
  },
  {
    text: 'Contracts',
    icon: <Description />,
    children: [
      { text: 'All Contracts', icon: <Description />, path: '/contracts' },
      { text: 'Create Contract', icon: <Description />, path: '/contracts/create' },
    ],
  },
  {
    text: 'Payments',
    icon: <Payment />,
    children: [
      { text: 'All Payments', icon: <Payment />, path: '/payments' },
      { text: 'Invoices', icon: <MonetizationOn />, path: '/payments/invoices' },
      { text: 'Transactions', icon: <Payment />, path: '/payments/transactions' },
    ],
  },
  {
    text: 'Security',
    icon: <Security />,
    children: [
      { text: 'EMD Management', icon: <Security />, path: '/security/emd' },
      { text: 'Bank Guarantees', icon: <Gavel />, path: '/security/bank-guarantees' },
      { text: 'Insurance Policies', icon: <Security />, path: '/security/insurance' },
    ],
  },
  {
    text: 'Workflow',
    icon: <AccountTree />,
    children: [
      { text: 'All Workflows', icon: <AccountTree />, path: '/workflows' },
      { text: 'Templates', icon: <AccountTree />, path: '/workflows/templates' },
    ],
  },
  {
    text: 'Analytics',
    icon: <Analytics />,
    children: [
      { text: 'Dashboard', icon: <Analytics />, path: '/analytics' },
      { text: 'Reports', icon: <Assessment />, path: '/analytics/reports' },
    ],
  },
  {
    text: 'Notifications',
    icon: <Notifications />,
    path: '/notifications',
  },
  {
    text: 'Settings',
    icon: <Settings />,
    path: '/settings',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
      onItemClick?.();
    } else if (item.children) {
      const isOpen = openItems.includes(item.text);
      if (isOpen) {
        setOpenItems(openItems.filter(text => text !== item.text));
      } else {
        setOpenItems([...openItems, item.text]);
      }
    }
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.text);
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            selected={active}
            sx={{
              pl: 2 + level * 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: active ? 'inherit' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: level > 0 ? '0.875rem' : '1rem',
              }}
            />
            {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AVGC Tender
        </Typography>
      </Toolbar>
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>
    </Box>
  );
};
