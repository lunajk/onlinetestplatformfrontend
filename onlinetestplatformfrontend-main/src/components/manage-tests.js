import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  CircularProgress,
  AppBar,
  Toolbar,
  Modal,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { MoreVert, Edit,ContentCopy, Delete, Menu as MenuIcon } from "@mui/icons-material";
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import logo from "../assets/Image20250320122406.png";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./adminNavbar";

const API_BASE_URL = "http://127.0.0.1:8000"; // Base URL

const ManageTestsPage = () => {
  const navigate = useNavigate(); // Get the navigate function
  const [duplicatedTestId, setDuplicatedTestId] = React.useState(null);
  const [duplicatedTestLink, setDuplicatedTestLink] = React.useState("");
  const [openDuplicateSuccessDialog, setOpenDuplicateSuccessDialog] = React.useState(false);
  const [openDuplicateCSVModal, setOpenDuplicateCSVModal] = React.useState(false);
  const [emailList, setEmailList] = React.useState([]);
  const [tests, setTests] = useState([]);
  const [testLink, setTestLink] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to get the token from localStorage
  const token = () => {
    return localStorage.getItem("user_token");
  };

  // Fetch tests with the correct token
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tests/`, {
          headers: { Authorization: `Token ${token()}` },
        });
        setTests(response.data);
      } catch (error) {
        console.error("Error fetching tests:", error);
        setSnackbarMessage("Failed to fetch tests.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleMenuOpen = (event, test) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTest(test);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  const handleDuplicateTest = async () => {
    try {
      const userToken = localStorage.getItem("user_token"); // Assuming userToken is stored in localStorage
  
      const response = await axios.post(
        `${API_BASE_URL}/api/tests/${selectedTest.id}/duplicate/`,
        {},
        {
          headers: {
            Authorization: `Token ${userToken}`,
          },
        }
      );
  
      if (response.data.test_link) {
        setTestLink(response.data.test_link);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to duplicate test", error);
    }
  };
  const handleCSVUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    Papa.parse(file, {
      complete: (results) => {
        const emails = results.data
          .map((row) => row[0]?.trim())
          .filter((email) => email && /\S+@\S+\.\S+/.test(email));
        setEmailList(emails);
      },
    });
  }
};
const handleSaveAndSendEmails = async () => {
  if (!duplicatedTestId || emailList.length === 0) {
    alert("Please upload a valid CSV and ensure test ID is set.");
    return;
  }
  const userToken = localStorage.getItem("user_token");
  try {
    const response = await fetch(`${API_BASE_URL}/upload-allowed-emails/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`,
      },
      body: JSON.stringify({
        test_id: duplicatedTestId,
        emails: emailList,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Emails uploaded and invitations sent!");
      setOpenDuplicateCSVModal(false);
      setOpenDuplicateSuccessDialog(false);
      setEmailList([]);
    } else {
      alert(data.error || "Failed to send emails.");
    }
  } catch (error) {
    console.error("Error sending emails:", error);
    alert("An unexpected error occurred.");
  }
};

    
  const handleEditTest = () => {
    if (selectedTest && selectedTest.id) {  // Ensure selectedTest and its ID exist
      navigate(`/edit-test/${selectedTest.id}`); // Navigate to edit page with test ID
      handleMenuClose();
    } else {
      console.error("No test selected or test ID is missing");
    }
  };
  

  // Function to delete a test
  const handleDeleteTest = async () => {
    if (selectedTest) {
      try {
        await axios.delete(`${API_BASE_URL}/api/tests/${selectedTest.id}/`, {
          headers: { Authorization: `Token ${token()}` },
        });
        setTests(tests.filter((test) => test.id !== selectedTest.id));
        setSnackbarMessage("Test deleted successfully!");
      } catch (error) {
        setSnackbarMessage("Failed to delete test.");
      }
      setSnackbarOpen(true);
      handleMenuClose();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
    <AdminNavbar/>
    <Box sx={{ display: "flex" }}>
    

      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Test Management Hub
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
<TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
  <Table>
    <TableHead>
      <TableRow sx={{ backgroundColor: "#003366" }}>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Serial No</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Test No</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Test Name</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Time Limit (Minutes)</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Duration Date</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Duration Time</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Created At</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {tests.map((test, index) => (
        <TableRow key={test.id} hover>
          <TableCell>{index + 1}</TableCell> {/* Serial Number */}
          <TableCell>{test.id}</TableCell>
          <TableCell>{test.title}</TableCell>
          <TableCell>{test.status || "Completed"}</TableCell>
          <TableCell>{test.total_time_limit}</TableCell>
          <TableCell>{test.start_date ? new Date(test.end_date).toLocaleDateString() : "N/A"}</TableCell>
          <TableCell>{test.due_time || "N/A"}</TableCell>
          <TableCell>{new Date(test.created_at).toLocaleString()}</TableCell>
          <TableCell>
            <Tooltip title="More Actions">
              <IconButton
                onClick={(e) => handleMenuOpen(e, test)}
                sx={{ color: "#003366" }}
              >
                <MoreVert />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
        )}
<Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
  <MenuItem onClick={handleEditTest}>
    <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
  </MenuItem>

  <MenuItem onClick={handleDuplicateTest}>
    <ContentCopy fontSize="small" sx={{ mr: 1 }} /> Duplicate Test
  </MenuItem>

  <MenuItem onClick={handleDeleteTest}>
    <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
  </MenuItem>
</Menu>
<Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 600,  // Increased width for larger modal
      height: 400, // Optional: Set a height if you want to control the height of the modal
      bgcolor: "background.paper",
      boxShadow: 24,
      p: 6,  // Increased padding for a more spacious design
      borderRadius: 2,
    }}
  >
    {/* Duplicate Success Dialog */}
<Dialog open={openDuplicateSuccessDialog} onClose={() => setOpenDuplicateSuccessDialog(false)}>
  <DialogTitle>Test Duplicated Successfully!</DialogTitle>
  <DialogContent>
    <Typography>
      Your test has been duplicated. You can share the link below or upload emails for test access:
    </Typography>
    <TextField
      value={duplicatedTestLink}
      fullWidth
      margin="normal"
      InputProps={{ readOnly: true }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDuplicateCSVModal(true)} color="primary">
      Upload Allowed Emails
    </Button>
    <Button onClick={() => setOpenDuplicateSuccessDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>

{/* Duplicate Email Upload Dialog */}
<Dialog open={openDuplicateCSVModal} onClose={() => setOpenDuplicateCSVModal(false)}>
  <DialogTitle>Upload Emails for Test Access</DialogTitle>
  <DialogContent>
    <Typography variant="body2" sx={{ mb: 2 }}>
      Upload a CSV file with a column named <b>email</b> to give test access to selected participants.
    </Typography>
    <input type="file" accept=".csv" onChange={handleCSVUpload} />
    {emailList.length > 0 && (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">✅ {emailList.length} valid emails loaded:</Typography>
        <ul style={{ maxHeight: 150, overflowY: "auto" }}>
          {emailList.map((email, idx) => (
            <li key={idx}>{email}</li>
          ))}
        </ul>
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDuplicateCSVModal(false)} color="secondary">
      Cancel
    </Button>
    <Button onClick={handleSaveAndSendEmails} variant="contained" color="primary">
      Save & Send
    </Button>
  </DialogActions>
</Dialog>
</Box>
</Modal>

     
       
      </Box>
    </Box>
    </>
  );
};

export default ManageTestsPage;