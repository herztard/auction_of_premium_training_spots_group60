import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';

const AdminPanel = () => {
  const { contract, isOwner } = useWeb3();
  const [formData, setFormData] = useState({
    coachName: '',
    trainingDate: '',
    description: '',
    location: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const dateToTimestamp = (dateString) => {
    return Math.floor(new Date(dateString).getTime() / 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.coachName || !formData.trainingDate || !formData.location || !formData.description) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      const timestamp = dateToTimestamp(formData.trainingDate);

      const imageUrl = formData.imageUrl || 'https://via.placeholder.com/400x200?text=Training+Session';

      const tx = await contract.createTrainingSpot(
        formData.coachName,
        timestamp,
        formData.description,
        formData.location,
        imageUrl
      );

      await tx.wait();

      setFormData({
        coachName: '',
        trainingDate: '',
        description: '',
        location: '',
        imageUrl: ''
      });

      setSuccess('Training spot created successfully!');
    } catch (error) {
      console.error('Error creating training spot:', error);
      setError(error.message || 'Failed to create training spot');
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Create New Training Spot</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Coach Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="coachName"
                  value={formData.coachName}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Training Date & Time*</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="trainingDate"
                  value={formData.trainingDate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Location*</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Downtown Fitness Center"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Description*</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the training session..."
              required
            />
          </Form.Group>
          
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Training Spot'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AdminPanel; 