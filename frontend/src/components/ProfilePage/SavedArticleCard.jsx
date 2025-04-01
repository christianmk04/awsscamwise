import { Card, Button, Badge } from "react-bootstrap";
import { Bookmark } from "lucide-react";

const SavedArticleCard = ({ article, onRemove }) => {
    const getCategoryColor = (category) => {
        switch (category.toLowerCase()) {
        case "prevention":
            return "info";
        case "awareness":
            return "danger";
        case "case studies":
            return "warning";
        case "policy and legal":
            return "success";
        case "education":
            return "primary";
        default:
            return "secondary";
        }
    };

    return (
        <Card className="mb-3 shadow-sm h-100">
        <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
            <Badge bg={getCategoryColor(article.topicCategory)}>
                {article.topicCategory}
            </Badge>
            <small className="text-muted">{new Date(article.date).toLocaleDateString()}</small>
            </div>
            <Card.Title>{article.title}</Card.Title>
            <Card.Text className="text-muted">{article.contentSummary}</Card.Text>
            <div className="d-flex justify-content-between align-items-center">
            <Button variant="link" className="p-0" href={article.urlPath} target="_blank" rel="noopener noreferrer">
                Read more →
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
                onRemove(article.newsId)
                
                }}>
                <Bookmark className="me-2" fill={"currentColor"} />Bookmarked
            </Button>
            </div>
        </Card.Body>
        </Card>
    );
};

export default SavedArticleCard;