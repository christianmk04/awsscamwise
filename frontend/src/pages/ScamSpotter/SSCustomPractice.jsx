import { useState } from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'

const SSCustomPractice = () => {

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState(null);


  const categories = [
    {
      title: 'Personal',
      description: 'Romance Scams, Phishing, Identity Theft, etc.',
      imgSrc: '/public/chat.png',
      bgColour: 'bg-success-subtle',
      borderColour: 'border-success'
    },
    {
      title: 'Business',
      description: 'Invoice fraud, fake vendor emails, impersonation scams etc.',
      imgSrc: '/public/cooperation.png',
      bgColour: 'bg-warning-subtle',
      borderColour: 'border-warning'
    },
    {
      title: 'Tech Support',
      description: 'Fake tech support, ransomware, etc.',
      imgSrc: '/public/customer-service.png',
      bgColour: 'bg-primary-subtle',
      borderColour: 'border-primary'
    },
    {
      title: 'Financial',
      description: 'Investment Fraud, Ponzi schemes, banking emails etc.',
      imgSrc: '/public/bank.png',
      bgColour: 'bg-info-subtle',
      borderColour: 'border-info'
    },
    {
      title: 'Health',
      description: 'Fake COVID-19 cures, miracle cures, etc.',
      imgSrc: '/public/healthcare.png',
      bgColour: 'bg-danger-subtle',
      borderColour: 'border-danger'
    },
    {
      title: 'Shuffle',
      description: 'Randomly generated scams from all categories.',
      imgSrc: '/public/dice.png',
      bgColour: 'bg-secondary-subtle',
      borderColour: 'border-secondary'
    }
  ]

  const difficultyLevels = [
    {
      title: 'Rookie Spotter',
      description: ['5 Free Hints', 'No Time Limit', 'Scams that are easy to spot.'],
      imgSrc: '/public/leaf.png',
      bgColour: 'bg-success-subtle',
      borderColour: 'border-success'
    },
    {
      title: 'Sharp Spotter',
      description: ['3 Free Hints', 'Time per Question: 10 minutes', 'Scams that are trickier to spot.'],
      imgSrc: '/public/mountain.png',
      bgColour: 'bg-warning-subtle',
      borderColour: 'border-warning'
    },
    {
      title: 'Pro Spotter',
      description: ['No Free Hints', 'Time per Question: 5 minutes', 'Scams that are difficult to spot.'],
      imgSrc: '/public/cyber-criminal.png',
      bgColour: 'bg-danger-subtle',
      borderColour: 'border-danger'
    }
  ]

  const questionOptions = [5, 10, 15, 20];

  const handleCategorySelect = (index) => {
    setSelectedCategory(index);
  };

  const handleDifficultySelect = (index) => {
    setSelectedDifficulty(index);
  };

  const handleQuestionSelect = (index) => {
    setSelectedQuestions(index);
  };

  const handleSubmit = () => {
    const payload = {
      category: selectedCategory !== null ? categories[selectedCategory].title : null,
      difficulty: selectedDifficulty !== null ? difficultyLevels[selectedDifficulty].title : null,
      questions: selectedQuestions !== null ? questionOptions[selectedQuestions] : null,
    };

    console.log('Submitting:', payload);
    // Example: send payload to your endpoint
    // fetch('/api/submit', {
    //   method: 'POST',
    //   body: JSON.stringify(payload),
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });
  };

  return (
    <>
        <style>
          {`
            .selected-card {
              transform: translateY(-5px) scale(1.05);
              transition: all 0.1s ease-in-out;
              box-shadow: 0px 4px 50px rgba(0, 0, 0, 0.2);
            }

            .category-card:hover, .difficulty-card:hover {
              cursor: pointer;
              transition: all 0.1s ease-in-out;
            }
          `}
        </style>

        <div className="content-container m-5 p-5">
          <h5>Custom Practice</h5>
          <h1>Spot the Scam!</h1>
          <p className='mb-5'>Customise your challenge to match your learning needs!</p>
          <Container fluid className="category-container">
          <Row>
            <h4>
              <u>
                <b>Category</b>
              </u>
            </h4>
            {categories.map((category, index) => (
              <Col key={index} sm={12} md={6} xl={4} xxl={2} className="my-3">
                <Card
                  onClick={() => handleCategorySelect(index)}
                  className={`category-card h-100 border-4 rounded-5 ${category.bgColour} ${category.borderColour} ${
                    selectedCategory === index ? 'selected-card' : ''
                  }`}
                >
                  <Card.Body className="text-center">
                    <Card.Img variant="top" src={category.imgSrc} className="w-50 my-4" />
                    <Card.Title className="fw-bold fs-3">{category.title}</Card.Title>
                    <Card.Text>{category.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>

        <Container fluid className="difficulty-container my-5">
          <Row>
            <h4>
              <u>
                <b>Difficulty Level</b>
              </u>
            </h4>
            {difficultyLevels.map((difficultyLevel, index) => (
              <Col key={index} sm={12} md={6} xl={4} xxl={2} className="my-3">
                <Card
                  onClick={() => handleDifficultySelect(index)}
                  className={`difficulty-card h-100 border-4 rounded-5 ${difficultyLevel.bgColour} ${difficultyLevel.borderColour} ${
                    selectedDifficulty === index ? 'selected-card' : ''
                  }`}
                >
                  <Card.Body className="text-center">
                    <Card.Img variant="top" src={difficultyLevel.imgSrc} className="w-50 my-4" />
                    <Card.Title className="fw-bold fs-3">{difficultyLevel.title}</Card.Title>
                    <Card.Text>
                      <ul className="text-start">
                        {difficultyLevel.description.map((desc, index) => (
                          <li key={index}>{desc}</li>
                        ))}
                      </ul>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>

        <Container fluid className="question-select-container">
          <Row>
            <h4 className="mb-5">
              <u>
                <b>Number of Questions</b>
              </u>
            </h4>
            {questionOptions.map((number, index) => (
              <Col key={index} className="d-flex justify-content-center align-items-center">
                <Card
                  onClick={() => handleQuestionSelect(index)}
                  className={`text-center border-success border-4 rounded-circle d-flex justify-content-center align-items-center ${
                    selectedQuestions === index ? 'selected-card' : ''
                  }`}
                  style={{ width: '75px', height: '75px' }}
                >
                  <Card.Body className="d-flex justify-content-center align-items-center">
                    <Card.Title>
                      <u>
                        <b>{number}</b>
                      </u>
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
        
        <div className="text-center mt-5">
          <Button variant="dark" onClick={handleSubmit} className='border-warning-subtle border-4 rounded-4'>
            I&apos;m Ready! <img src="/public/fast-forward.png" alt="" style={{width:'20px', height:'auto', marginBottom:'1.5px', marginLeft: '2px'}} />
          </Button>
        </div>


            
        </div>
    </>
  )
}

export default SSCustomPractice