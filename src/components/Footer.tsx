import React from 'react';
import { Typography, Container } from '@mui/material';

const Footer: React.FC = () => {
    return (
        <footer style={{ backgroundColor: '#f8f9fa', padding: '1rem 0', marginTop: 'auto' }}>
            <Container maxWidth="lg">
                <Typography variant="body2" color="textSecondary" align="center">
                    {'© '}
                    {new Date().getFullYear()}
                    {' Your Company. All rights reserved.'}
                </Typography>
            </Container>
        </footer>
    );
};

export default Footer;
