import { useState, useEffect, useMemo } from "react";
import { Card, Button, InputGroup, Form, Badge, Row, Col, Container, Spinner, Alert, Modal, Dropdown } from "react-bootstrap";
import { BookOpen, Shield, AlertTriangle, Gavel, GraduationCap, Info, Search, Bookmark, Filter, Star, Calendar, Trash2, CheckCircle, XCircle, ArrowDown, ArrowUp, SortAsc } from "lucide-react";

const DailyDigest = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [newsArticles, setNewsArticles] = useState([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendationsSent, setRecommendationsSent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // New sorting states
  const [sortBy, setSortBy] = useState("date"); // Options: "date", "category"
  const [sortOrder, setSortOrder] = useState("desc"); // Options: "asc", "desc"
  
  // New state for deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState("idle"); // idle, loading, success, error
  const [deleteMessage, setDeleteMessage] = useState("");

  const categories = ["all", "prevention", "case studies", "policy and legal", "education", "awareness"];

  // Fetch articles only once when the component mounts
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("http://172.31.35.32:5009/get_all_news");

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data = await response.json();

        setNewsArticles(data); // Store the fetched articles
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []); // Empty dependency array means it runs only once when the component mounts

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole == "admin") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      const fetchBookmarkedArticles = async () => {
        try {
          const response = await fetch(`http://172.31.35.32:5002/get_saved_articles/${userId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch bookmarked articles");
          }
          const data = await response.json(); // API returns an array of article IDs
          setBookmarkedArticles(new Set(data)); // Directly store IDs in a Set
        } catch (err) {
          console.error(err);
        }
      };

      fetchBookmarkedArticles();
    }
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!recommendationsSent) {
        try {
          const response = await fetch("http://172.31.35.32:5009/get_news_recommendation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([...bookmarkedArticles]), // Convert Set to array
          });

          if (!response.ok) {
            throw new Error("Failed to fetch recommendations");
          }
          const data = await response.json();

          setRecommendedArticles(data); // Store the fetched recommendations
          setRecommendationsSent(true); // Mark as sent
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchRecommendations();
  }, [bookmarkedArticles, recommendationsSent]);

  // Filtered articles based on search query and active category
  const filteredArticles = useMemo(() => {
    let results = newsArticles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.contentSummary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "all" || article.topicCategory.toLowerCase() === activeCategory;

      return matchesSearch && matchesCategory;
    });
    
    // Sort filtered articles based on sortBy and sortOrder
    return results.sort((a, b) => {
      if (sortBy === "date") {
        // Parse dates for comparison (assuming date format is MM/DD/YYYY)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "category") {
        // Sort by category name alphabetically
        const categoryA = a.topicCategory.toLowerCase();
        const categoryB = b.topicCategory.toLowerCase();
        
        return sortOrder === "asc" 
          ? categoryA.localeCompare(categoryB)
          : categoryB.localeCompare(categoryA);
      }
      return 0;
    });
  }, [searchQuery, activeCategory, newsArticles, sortBy, sortOrder]);

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

  const getIcon = (category) => {
    switch (category.toLowerCase()) {
      case "prevention":
        return Shield;
      case "awareness":
        return AlertTriangle;
      case "case studies":
        return GraduationCap;
      case "policy and legal":
        return Gavel;
      case "education":
        return BookOpen;
      default:
        return Info;
    }
  };

  const handleBookmark = (articleId) => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Please log in to bookmark articles.");
      return;
    }

    const isBookmarked = bookmarkedArticles.has(articleId);
    const url = isBookmarked
      ? `http://172.31.35.32:5002/remove_saved_article`
      : `http://172.31.35.32:5002/add_saved_article`;

    const json_body = {
      userId: userId,
      articleId: articleId
    }

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json_body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to ${isBookmarked ? "remove" : "add"} bookmark`);
        }
        return response.json();
      })
      .then(() => {
        setBookmarkedArticles((prev) => {
          const updated = new Set(prev);
          if (isBookmarked) {
            updated.delete(articleId);
          } else {
            updated.add(articleId);
          }
          return updated;
        });
      })
      .catch((err) => {
        alert(`Failed to ${isBookmarked ? "remove" : "add"} bookmark`);
        console.error(err);
      });
  };

  // Show confirmation modal before deletion
  const confirmDelete = (article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
    setDeleteStatus("idle");
    setDeleteMessage("");
  };

  // Handle actual deletion after confirmation
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    
    try {
      setDeleteStatus("loading");
      setDeleteMessage("Deleting article...");
      
      const response = await fetch(`http://172.31.35.32:5009/delete_news_article/${articleToDelete.newsId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete article");
      }
      
      // Short delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the news articles state by removing the deleted article
      setNewsArticles((prevArticles) => 
        prevArticles.filter((article) => article.newsId !== articleToDelete.newsId)
      );
      
      setDeleteStatus("success");
      setDeleteMessage("Article successfully deleted!");
      
      // Auto close after success
      setTimeout(() => {
        setShowDeleteModal(false);
        setArticleToDelete(null);
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setDeleteStatus("error");
      setDeleteMessage("Failed to delete article. Please try again.");
    }
  };

  // Close the delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setArticleToDelete(null);
    setDeleteStatus("idle");
  };

  // Handle sort selection
  // const handleSortChange = (sortType, order) => {
  //   setSortBy(sortType);
  //   setSortOrder(order);
  // };

  const renderArticleCard = (article, isRecommended = false) => {
    const Icon = getIcon(article.topicCategory || "default");
    return (
      <Card className={`h-100 shadow-sm transition-all hover:shadow-md ${isRecommended ? 'border-warning' : ''}`}>
        {isRecommended && (
          <div className="position-absolute" style={{ top: "-12px", right: "15px" }}>
            <Badge bg="warning" className="px-2 py-1">
              <Star size={14} className="me-1" /> Recommended
            </Badge>
          </div>
        )}
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Badge bg={getCategoryColor(article.topicCategory || "default")} className="px-3 py-2">
              <Icon size={16} className="me-1" />
              {article.topicCategory || "General"}
            </Badge>
            <small className="text-muted d-flex align-items-center">
              <Calendar size={14} className="me-1" /> {article.date}
            </small>
          </div>
          <Card.Title className="mb-3 fw-bold">{article.title}</Card.Title>
          <Card.Text className="text-muted mb-4" style={{ lineHeight: "1.5" }}>
            {article.contentSummary}
          </Card.Text>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <a href={article.urlPath} target="_blank" rel="noreferrer">
              <Button variant="primary" size="sm" className="rounded-pill px-3">
                Read more →
              </Button>
            </a>

            {/* Bookmark button for non-admins */}
            {!isAdmin && (
              <Button
                variant={bookmarkedArticles.has(article.newsId) ? "secondary" : "outline-secondary"}
                size="sm"
                className="rounded-pill"
                onClick={() => handleBookmark(article.newsId)}
              >
                <Bookmark size={16} className="me-1" fill={bookmarkedArticles.has(article.newsId) ? "currentColor" : "none"} />
                {bookmarkedArticles.has(article.newsId) ? "Bookmarked" : "Bookmark"}
              </Button>
            )}

            {/* Improved delete button for admins */}
            {isAdmin && (
              <Button 
                variant="outline-danger" 
                className="rounded-pill d-flex align-items-center" 
                size="sm" 
                onClick={() => confirmDelete(article)}
              >
                <Trash2 size={16} className="me-1" />
                Delete
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h1 className="mb-4">Phishing News & Updates</h1>
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted">Loading the latest articles...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <h1 className="mb-4">Phishing News & Updates</h1>
        <Alert variant="danger">
          <AlertTriangle className="me-2" />
          Error: {error}. Please try refreshing the page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Phishing News & Updates</h1>
        <p className="lead text-muted mb-0">Stay informed about the latest email scams and protection strategies</p>
        <div className="mx-auto mt-3" style={{ maxWidth: "60px", height: "4px", background: "#007bff" }}></div>
      </div>

      {/* Recommended Articles Section - Always in Grid View */}
      {recommendedArticles.length > 0 && isAdmin == false && (
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">
              <Star className="me-2 text-warning" /> Recommended Articles
            </h3>
          </div>
          <Row xs={1} md={3} className="g-4">
            {recommendedArticles.map((article) => (
              <Col key={article.newsId}>
                {renderArticleCard(article, true)}
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Search, Filter, and Sort Section */}
      <div className="bg-light p-4 rounded-3 mb-4">
        <Row className="g-3">
          <Col xs={12} md={8}>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <Search size={18} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search articles by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-start-0 shadow-none"
              />
            </InputGroup>
          </Col>
          <Col xs={12} md={4}>
            <div className="d-flex align-items-center">
              <span className="me-2">
                <SortAsc size={18} className="text-muted me-1" /> Sort by:
              </span>
              <Dropdown className="me-2">
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-sort" className="rounded-pill">
                  {sortBy === "date" ? "Date" : "Category"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSortBy("date")}>Date</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy("category")}>Category</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="rounded-pill" 
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </Button>
            </div>
          </Col>
        </Row>
        <Row className="mt-4">
          <div className="d-flex align-items-center">
            <div className="me-2">
              <Filter size={18} className="text-muted me-1" /> Filter:
            </div>
            <div className="d-flex flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === activeCategory ? "primary" : "outline-primary"}
                  size="sm"
                  className="me-2 mb-1 rounded-pill"
                  onClick={() => setActiveCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Row>
      </div>

      {/* Articles Section */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">{`${activeCategory !== "all" ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) + " " : ""}Articles`}</h3>
          <div className="d-flex align-items-center">
            <span className="text-muted me-2">
              {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"} found
            </span>
          </div>
        </div>
        
        {filteredArticles.length > 0 ? (
          <Row xs={1} md={2} className="g-4">
            {filteredArticles.map((article) => (
              <Col key={article.newsId}>
                {renderArticleCard(article)}
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5 bg-light rounded-3">
            <Info size={48} className="text-muted mb-3" />
            <h4>No articles found</h4>
            <p className="text-muted">
              Try adjusting your search criteria or filter selection.
            </p>
            <Button variant="primary" onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}>
              View all articles
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header className={
          deleteStatus === "success" ? "bg-success text-white" : 
          deleteStatus === "error" ? "bg-danger text-white" : 
          "border-bottom"
        }>
          <Modal.Title>
            {deleteStatus === "idle" && "Confirm Deletion"}
            {deleteStatus === "loading" && "Deleting Article"}
            {deleteStatus === "success" && "Success"}
            {deleteStatus === "error" && "Error"}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="py-4">
          {deleteStatus === "idle" && articleToDelete && (
            <div className="text-center">
              <AlertTriangle size={48} className="text-warning mb-3" />
              <p className="mb-1">Are you sure you want to delete the article:</p>
              <p className="fw-bold mb-3">&quot;{articleToDelete.title}&quot;</p>
              <p className="text-muted small">This action cannot be undone.</p>
            </div>
          )}
          
          {deleteStatus === "loading" && (
            <div className="text-center py-3">
              <div className="d-inline-block mb-3">
                <Spinner animation="border" variant="primary" />
              </div>
              <p>{deleteMessage}</p>
            </div>
          )}
          
          {deleteStatus === "success" && (
            <div className="text-center py-3">
              <CheckCircle size={48} className="text-success mb-3" />
              <p>{deleteMessage}</p>
            </div>
          )}
          
          {deleteStatus === "error" && (
            <div className="text-center py-3">
              <XCircle size={48} className="text-danger mb-3" />
              <p>{deleteMessage}</p>
            </div>
          )}
        </Modal.Body>
        
        <Modal.Footer className={
          deleteStatus === "success" ? "bg-light" : 
          deleteStatus === "error" ? "bg-light" : 
          "border-top"
        }>
          {deleteStatus === "idle" && (
            <>
              <Button variant="outline-secondary" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteArticle}>
                <Trash2 size={16} className="me-1" />
                Delete
              </Button>
            </>
          )}
          
          {deleteStatus === "loading" && (
            <Button variant="outline-secondary" disabled>
              Processing...
            </Button>
          )}
          
          {deleteStatus === "success" && (
            <Button variant="outline-success" onClick={closeDeleteModal}>
              Close
            </Button>
          )}
          
          {deleteStatus === "error" && (
            <>
              <Button variant="outline-secondary" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteArticle}>
                Try Again
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DailyDigest;