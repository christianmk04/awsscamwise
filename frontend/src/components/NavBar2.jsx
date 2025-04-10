import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Modal from 'react-bootstrap/Modal';


const NavBar2 = () => {

    const [showPopup, setShowPopup] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const handleShow = () => setShowPopup(true);
    const handleClose = () => setShowPopup(false);

    const handleSignOut = () => {
        // Close the user details popup when sign out modal opens
        setShowPopup(false);

        // Show the sign-out confirmation modal
        setShowSignOutModal(true);
    };

    const handleCloseSignOutModal = () => setShowSignOutModal(false);

    const handleConfirmSignOut = () => {
        // Clear the user's details from local storage
        localStorage.removeItem('userId');

        // Redirect the user to the login page
        window.location.href = "/login";
    };

    const [userDetails, setUserDetails] = useState({});
    
    useEffect(() => {

        // Get userId from local storage
        const userId = localStorage.getItem('userId');
        const adminStatus = localStorage.getItem('role')
        
        if (adminStatus == 'admin'){
            setIsAdmin(true)
        }

        const fetchUserDetails = async () => {
            try {
                const response = await fetch('http://172.31.35.32:5002/get_account_details/' + userId);

                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const data = await response.json();
                setUserDetails(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUserDetails();
    }, []);

    return (
        <>
            {/* Inline styles with @media */}
            <style>
                {`
                    .nav-link-bordered:hover {
                        background-color: rgba(255, 255, 255, 0.1);
                        border: solid 1px white;
                        padding: 0.5rem;
                        border-radius: 4px;
                    }


                    .modal-content {
                        box-shadow: none !important;
                        border: none !important;
                    }
                `}
            </style>

            <Navbar data-bs-theme='dark' expand='lg' sticky='top' style={{ backgroundColor: '#13072e' }} collapseOnSelect>
                <Container fluid>
                    <Navbar.Brand href="/home" className='text-white'>
                        <img 
                            src="/logo2.png"
                            style={{ width: '190px', height: '50px' }}
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls='offcanvasNavbar-expand-lg'/>
                    <Navbar.Offcanvas
                        id='offcanvasNavbar-expand-lg'
                        aria-labelledby='offcanvasNavbarLabel-expand-lg'
                        placement="end"
                        data-bs-theme='dark'
                    >
                        <Offcanvas.Header closeButton className='text-light' style={{ backgroundColor: '#13072e' }}>
                            <Offcanvas.Title id='offcanvasNavbarLabel-expand-lg'>
                                <img 
                                    src="/logo2.png"
                                    style={{ width: '190px', height: '50px' }}
                                />
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body style={{ backgroundColor: '#13072e' }}>
                            <Nav className="justify-content-end flex-grow-1 pe-3 align-items-center">
                                <Nav.Link href="/about" className='text-light nav-link-bordered'>About</Nav.Link>
                                <Nav.Link href="/scam-spotter" className='text-light nav-link-bordered'>Scam Spotter</Nav.Link>
                                <Nav.Link href="/quiz-master" className='text-light nav-link-bordered'>Quiz Master</Nav.Link>
                                {!isAdmin && <Nav.Link href="/dashboard" className='text-light nav-link-bordered'>Dashboard</Nav.Link>}
                                <Nav.Link href="/daily-digest" className='text-light nav-link-bordered'>Daily Digest</Nav.Link>
                                {isAdmin && <Nav.Link href="/admin/requests" className='text-light'>Admin Requests</Nav.Link>}
                                <hr className='w-100 d-lg-none' style={{border:'solid 1px white'}}/>
                                <Nav.Link
                                    href="#"
                                    onClick={handleShow}
                                    style={{ cursor: 'pointer' }}
                                >   
                                    <div className='d-flex align-items-center'>
                                        
                                        <img
                                            src={userDetails.profilePicturePath || '/default-profile.png'}
                                            className="rounded-circle"
                                            style={{ width: '50px', height: '50px' }}
                                        />
                                        <h2 className='text-light d-lg-none m-1 px-2'>{userDetails.fullName}</h2>
                                    </div>
                                </Nav.Link>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>

            {/* User Details Modal */}
            <Modal show={showPopup} onHide={handleClose} centered>
                <Modal.Body className="text-center p-5">
                    <img
                        src={userDetails.profilePicturePath || '/default-profile.png'}
                        alt="Profile"
                        className="rounded-circle mb-3 w-50"
                    />
                    <h5>{userDetails.fullName}</h5>
                    <p className="text-muted">{userDetails.email}</p>

                    <Nav.Link href="/profile">
                        <Button
                            className="w-100 mb-2"
                            style={{ backgroundColor: '#d1c4e9', color: '#000' }}
                        >
                            View Your Profile
                        </Button>
                    </Nav.Link>

                    <Nav.Link href="/profile/settings">
                        <Button
                            className="w-100 mb-2"
                            style={{ backgroundColor: '#d1c4e9', color: '#000' }}
                        >
                            Profile Settings
                        </Button>
                    </Nav.Link>

                    <Button
                        className="w-100 mb-2"
                        style={{ backgroundColor: '#d1c4e9', color: '#000' }}
                    >
                        Extension Settings
                    </Button>

                    <div className="d-flex justify-content-between text-primary">
                        <Nav.Link href="#" style={{ textDecoration: 'none' }}>Privacy Policy</Nav.Link>
                        <Nav.Link href="#" style={{ textDecoration: 'none' }}>Terms of Service</Nav.Link>
                    </div>
                    <Button
                        variant="outline-secondary"
                        className="mt-3"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </Button>
                </Modal.Body>
            </Modal>

            {/* Sign Out Confirmation Modal */}
            <Modal show={showSignOutModal} onHide={handleCloseSignOutModal} centered>
                <Modal.Body className="text-center p-5">
                    <h5>Are you sure you want to sign out?</h5>
                    <Button
                        className="w-100 mb-2"
                        style={{ backgroundColor: '#d1c4e9', color: '#000' }}
                        onClick={handleConfirmSignOut}
                    >
                        Yes, Sign Out
                    </Button>
                    <Button
                        variant="outline-secondary"
                        className="w-100"
                        onClick={handleCloseSignOutModal}
                    >
                        Cancel
                    </Button>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default NavBar2;
