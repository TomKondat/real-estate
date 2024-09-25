import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useEditPropertyMutation,
  useDeletePropertyMutation,
  useGetPropertyByIdQuery,
  useAddSavePropertyMutation,
  useRemoveSavePropertyMutation,
} from "./../slices/propertyApiSlice";
import * as Icon from "react-bootstrap-icons";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Image,
} from "react-bootstrap";
import PropertyMap from "./PropertyMap";
import "../styles/propertyItem.css";
import { UPLOADS_URL } from "../slices/urlConstrains";
import { useGetUserInfoQuery } from "../slices/userApiSlice";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract flags from ManagedProperties, HomePage, or SavedProperties
  const fromManagedProperty = location.state?.fromManagedProperty || false;
  const fromHomePage = location.state?.fromHomePage || false;
  const fromSavedProperties = location.state?.fromSavedProperties || false;

  const { data: property, refetch } = useGetPropertyByIdQuery(id);
  const [editProperty] = useEditPropertyMutation();
  const [deleteProperty] = useDeletePropertyMutation();
  const [addSaveProperty] = useAddSavePropertyMutation();
  const [removeSaveProperty] = useRemoveSavePropertyMutation();

  // Modal state for Edit and Contact Agent
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Fetch user info to check role and ownership
  const { data: userInfo, refetch: refetchUserInfo } = useGetUserInfoQuery();
  const userRole = userInfo?.data?.user?.role || null;
  const userId = userInfo?.data?.user?._id;
  const savedProperties = userInfo?.data?.user?.savedProperties || [];

  // Check if the current property is already saved
  const isPropertySaved = savedProperties.includes(id);
  // Check if the current user is the owner (agent) of the property
  const isPropertyOwner = userId === property?.property.agent?._id;

  // State to control the visibility of the Save button
  const [showSaveButton, setShowSaveButton] = useState(!isPropertySaved);

  // Initialize state variables for the form fields
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");

  // Initialize state variables for the agent fields
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentPhone, setAgentPhone] = useState("");

  useEffect(() => {
    if (property) {
      setAgentName(property?.property.agent.username);
      setAgentEmail(property?.property.agent.email);
      setAgentPhone(property?.property.agent.phone);
    }
  }, [property]);

  // Modal state for Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    refetch();
  }, [id, refetch]);

  if (!property) {
    return <h2 className="text-center">Property not found</h2>;
  }

  // Populate form fields with current property data when opening the modal
  const handleOpenEditModal = () => {
    setTitle(property?.property.title || "");
    setPropertyType(property?.property.propertyType || "");
    setHouseNumber(property?.property.location.houseNumber || "");
    setStreet(property?.property.location.street || "");
    setCity(property?.property.location.city || "");
    setPrice(property?.property.price || "");
    setDescription(property?.property.description || "");
    setBedrooms(property?.property.bedrooms || "");
    setBathrooms(property?.property.bathrooms || "");
    setArea(property?.property.area || "");
    setShowEditModal(true);
  };

  // Handle Save Property
  const handleSave = async () => {
    try {
      await addSaveProperty(id).unwrap();
      alert("Property saved successfully!");
      setShowSaveButton(false);
      refetchUserInfo(); // Refetch user info to update saved properties list
      refetch();
    } catch (err) {
      console.error("Failed to save the property:", err);
      alert("Failed to save the property.");
    }
  };

  // Handle Delete Saved Property
  const handleDeleteSavedProperty = async () => {
    try {
      await removeSaveProperty(id).unwrap();
      alert("Property removed from saved properties!");
      navigate(-1); // Go back to the previous page
      refetchUserInfo();
      refetch();
    } catch (err) {
      console.error("Failed to remove saved property:", err);
      alert("Failed to remove saved property.");
    }
  };

  // Handle Edit Property
  const handleEditSubmit = async () => {
    try {
      const addressQuery = `${houseNumber} ${street}, ${city}`;

      const fetchCoordinates = async (query) => {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json`
        );
        const data = await response.json();
        return data.length > 0 ? { lat: data[0].lat, lng: data[0].lon } : null;
      };

      const coordinates = await fetchCoordinates(addressQuery);

      if (!coordinates) {
        alert("Failed to fetch coordinates. Please check the address.");
        return;
      }

      const updatedProperty = {
        title,
        propertyType,
        location: {
          houseNumber,
          street,
          city,
          coordinates: {
            lat: parseFloat(coordinates.lat),
            lng: parseFloat(coordinates.lng),
          },
        },
        price,
        description,
        bedrooms,
        bathrooms,
        area,
      };

      await editProperty({ data: updatedProperty, propertyId: id }).unwrap();

      alert("Property updated successfully!");
      setShowEditModal(false);
      refetch();
    } catch (err) {
      console.error("Failed to update property:", err);
      alert("Failed to update property.");
    }
  };

  // Handle Delete Property
  const handleDelete = async () => {
    try {
      await deleteProperty(id).unwrap();
      alert("Property deleted successfully!");
      navigate("/");
      refetch();
    } catch (err) {
      console.error("Failed to delete property:", err);
      alert("Failed to delete property.");
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center propertypage py-5"
    >
      <Row className="w-100 d-flex justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Card
            className="shadow-lg carddetail position-relative"
            style={{ padding: "20px", fontSize: "1.2rem" }}
          >
            {/* Edit and Delete Button for Agents if they own the property and accessed from ManagedProperties */}
            {userRole === "agent" && isPropertyOwner && fromManagedProperty && (
              <div className="position-absolute top-0 end-0 m-3">
                <Button
                  variant="outline-secondary"
                  onClick={handleOpenEditModal}
                  className="me-2"
                >
                  <Icon.Pencil />
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Icon.Trash />
                </Button>
              </div>
            )}

            {/* Save Button for Buyers only from HomePage */}
            {userRole === "buyer" && fromHomePage && showSaveButton && (
              <Button
                variant="outline-warning"
                className="position-absolute top-0 end-0 m-3"
                onClick={handleSave}
              >
                Save
              </Button>
            )}

            {/* Delete Button for Saved Properties */}
            {userRole === "buyer" && fromSavedProperties && isPropertySaved && (
              <Button
                variant="outline-danger"
                className="position-absolute top-0 end-0 m-3"
                onClick={handleDeleteSavedProperty}
              >
                <Icon.Trash />
              </Button>
            )}

            {/* Property Title */}
            <Card.Title className="text-center display-5 mb-4">
              {property?.property.title}
            </Card.Title>

            <Row className="property-details-row mb-4">
              <Col xs={12} md={8}>
                <Card.Img
                  variant="top"
                  src={
                    `${UPLOADS_URL}/${property?.property.images[0]}` ||
                    "https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko="
                  }
                  alt={property?.property.title}
                  className="property-detail-image"
                />
              </Col>
              <Col xs={12} md={4} className="property-details-container">
                <Card.Text className="property-detail-item">
                  <strong>Property Type:</strong>{" "}
                  {property?.property.propertyType}
                </Card.Text>
                <Card.Text className="property-detail-item">
                  <strong>House Number:</strong>{" "}
                  {property?.property.location.houseNumber}
                </Card.Text>
                <Card.Text className="property-detail-item">
                  <strong>Street:</strong> {property?.property.location.street}
                </Card.Text>
                <Card.Text className="property-detail-item">
                  <strong>City:</strong> {property?.property.location.city}
                </Card.Text>
                <Card.Text className="property-detail-item">
                  <strong>Price:</strong> ${property?.property.price}
                </Card.Text>
                <Card.Text className="property-detail-item">
                  <strong>Bedrooms:</strong> {property?.property.bedrooms}
                </Card.Text>
                <Card.Text className="property-detail-item">
                  <strong>Bathrooms:</strong> {property?.property.bathrooms}
                </Card.Text>
                <Card.Text className="property-detail-item">
                  <strong>Area:</strong> {property?.property.area} sq. ft.
                </Card.Text>
              </Col>
            </Row>

            {/* Description Section */}
            <Card.Text className="my-4 text-center">
              <strong>Description:</strong> {property?.property.description}
            </Card.Text>

            {/* Contact Agent Button */}
            <Button
              variant="warning"
              size="md"
              onClick={() => setShowContactModal(true)}
              className="d-block mx-auto"
            >
              Contact Agent
            </Button>

            {/* Contact Agent Modal */}
            <Modal
              show={showContactModal}
              onHide={() => setShowContactModal(false)}
              centered
            >
              <Modal.Body className="text-center">
                {/* Circular Image */}
                <Image
                  src="https://via.placeholder.com/100"
                  roundedCircle
                  alt="Agent"
                  className="mb-3"
                />

                <h4>{agentName}</h4>
                <hr />

                <div className="mb-3">
                  <h6>Email:</h6>
                  <a href={`mailto:${agentEmail}`} className="text-warning">
                    {agentEmail}
                  </a>
                </div>

                <div className="mb-3">
                  <h6>Phone:</h6>
                  <a href={`tel:${agentPhone}`} className="text-warning">
                    {agentPhone}
                  </a>
                </div>
              </Modal.Body>
              <Modal.Footer className="justify-content-center">
                <Button
                  variant="warning"
                  onClick={() => setShowContactModal(false)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Map Section */}
            <div className="mt-4 map-wrapper">
              {property?.property.location?.coordinates?.lat &&
              property?.property.location?.coordinates?.lng ? (
                <PropertyMap
                  latitude={property?.property.location.coordinates.lat}
                  longitude={property?.property.location.coordinates.lng}
                  zoom={property?.property.location.zoom}
                  title={property?.property.title}
                />
              ) : (
                <p className="text-center">
                  Map information is not available for this property
                </p>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ----------------Edit Modal---------------- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Property</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formHouseNumber">
                  <Form.Label>House Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formCity">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBedrooms">
                  <Form.Label>Bedrooms</Form.Label>
                  <Form.Control
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formArea">
                  <Form.Label>Area (in sq. ft.)</Form.Label>
                  <Form.Control
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPropertyType">
                  <Form.Label>Property Type</Form.Label>
                  <Form.Control
                    as="select"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      Choose Property Type
                    </option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="land">Land</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formStreet">
                  <Form.Label>Street</Form.Label>
                  <Form.Control
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPrice">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBathrooms">
                  <Form.Label>Bathrooms</Form.Label>
                  <Form.Control
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="warning" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            No
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PropertyDetail;
