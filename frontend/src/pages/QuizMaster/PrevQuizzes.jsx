import { useState, useEffect } from "react";
import { Container, Table, Card, Form, Nav, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const PrevQuizzes = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [quizData, setQuizData] = useState([]);

    useEffect(() => {

        // Fetch quiz details from backend
        const fetchDailyQuizQuestions = async () => {
            try {

                const response = await fetch("http://172.31.35.32:5004/get_daily_quiz_details");
                const data = await response.json();
                setQuizData(data);
                
            } catch (error) {
                
                console.error('Error fetching quiz questions:', error);
                
            }

        }

        fetchDailyQuizQuestions();

    }, []);


    const filteredQuizzes = quizData.filter(quiz => {
        return (!startDate || quiz.createdDate >= startDate) &&
                (quiz.quizName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.subtopic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.difficulty.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    
    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        setSearchTerm("");
    };

return (
    <Container className="mt-4">
        <h2 className="text-center mb-4">Daily Quiz History</h2>
        <Card className="p-3">
            <div className="d-flex justify-content-between">
                <h5 className="mb-3">Filter by Date Range</h5>
                <Button variant="secondary" className="mb-3" onClick={clearFilters}>
                    Clear Filters
                </Button>
            </div>
        
        <Form className="d-flex mb-3">
            <Form.Control 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="me-2"
            />
            <Form.Control 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            />
        </Form>
        <Form.Control 
            type="text" 
            placeholder="Search quizzes..." 
            className="mb-3" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>Name</th>
                <th>Main Topic</th>
                <th>Sub Topic</th>
                <th>Difficulty</th>
                <th>Number of Questions</th>
                <th>Date</th>
            </tr>
            </thead>
            <tbody>
            {filteredQuizzes.map((quiz, index) => (
                <tr key={index}>
                <td>{quiz.quizName}</td>
                <td>{quiz.topic}</td>
                <td>{quiz.subtopic}</td>
                <td>{quiz.difficulty}</td>
                <td>{quiz.numQuestions}</td>
                <td>{quiz.createdDate}</td>
                </tr>
            ))}
            </tbody>
        </Table>
        </Card>

        <div className="text-center mt-4">   
            <Nav.Link href="/quiz-master/daily-practice">
                <Button className="btn btn-primary">Back to Today&apos;s Daily Quiz</Button>
            </Nav.Link>
        </div>
        

    </Container>
    );
};

export default PrevQuizzes