import { Card, Button, Badge } from "react-bootstrap";
import { Bookmark } from "lucide-react";

const SavedQuizCard = ({ quiz, onRemove }) => {

    const userId = localStorage.getItem("userId");

    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case "beginner":
                return "success";
            case "intermediate":
                return "warning";
            case "advanced":
                return "danger";
            default:
                return "secondary";
        }
    };

    return (
        <Card className="mb-3 shadow-sm h-100">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                    </Badge>
                    <small className="text-muted">{quiz.createdDate}</small>
                </div>

                <Card.Title>{quiz.quizName}</Card.Title>

                <Card.Text>
                    <strong>Topic:</strong> {quiz.topic} <br />
                    <strong>Subtopic:</strong> {quiz.subtopic}
                </Card.Text>

                <Card.Text className="text-muted">
                    {/* If createdByUserId matches userId, say created by you, otherwise, put the createdByUserId instead */}
                    {quiz.createdByUserId == userId ? "Created by You" : "Created by " + quiz.createdByUserId}
                </Card.Text>

                <div className="d-flex justify-content-between align-items-center">
                    <Button variant="link" className="p-0" onClick={() => console.log(`Start quiz ${quiz.quizId}`)}>
                        Attempt Quiz →
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onRemove(quiz.quizId)}>
                        <Bookmark className="me-2" fill={"currentColor"} /> Bookmarked
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SavedQuizCard;
