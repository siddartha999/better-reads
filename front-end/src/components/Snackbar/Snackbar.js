import React, { useContext } from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { SnackbarContext } from '../../contexts/SnackbarContext';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SnackBar = (props) => {

const {snackbarOpen: open, toggleSnackbar: setOpen, snackbarObj: details} = useContext(SnackbarContext);
  console.log(details);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} key="bottom + center" 
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleClose} severity={details?.current?.severity} sx={{ width: '100%' }}>
          {details?.current?.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default SnackBar;
