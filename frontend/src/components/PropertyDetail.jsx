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
  Alert,
} from "react-bootstrap";
import PropertyMap from "./PropertyMap";
import "../styles/propertyItem.css";
import { DEFAULT_PROPERTY_IMG, UPLOADS_URL } from "../slices/urlConstrains";
import { useGetUserInfoQuery } from "../slices/userApiSlice";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fromManagedProperty = location.state?.fromManagedProperty || false;
  const fromHomePage = location.state?.fromHomePage || false;
  const fromSavedProperties = location.state?.fromSavedProperties || false;

  const { data: property, refetch } = useGetPropertyByIdQuery(id);
  const [editProperty] = useEditPropertyMutation();
  const [deleteProperty] = useDeletePropertyMutation();
  const [addSaveProperty] = useAddSavePropertyMutation();
  const [removeSaveProperty] = useRemoveSavePropertyMutation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const { data: userInfo, refetch: refetchUserInfo } = useGetUserInfoQuery();
  const userRole = userInfo?.data?.user?.role || null;
  const userId = userInfo?.data?.user?._id;
  const savedProperties = userInfo?.data?.user?.savedProperties || [];

  const isPropertySaved = savedProperties.includes(id);
  const isPropertyOwner = userId === property?.property.agent?._id;

  const [showSaveButton, setShowSaveButton] = useState(!isPropertySaved);

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
  const [images, setImages] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [agentImage, setAgentImage] = useState("");

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (property) {
      setAgentName(property?.property.agent.username);
      setAgentEmail(property?.property.agent.email);
      setAgentPhone(property?.property.agent.phone);
      setAgentImage(property?.property.agent.image);
    }
  }, [property]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    refetch();
  }, [id, refetch]);

  if (!property) {
    return <h2 className="text-center">Property not found</h2>;
  }

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
    setPreviewImages(property?.property.images || []);
    setShowEditModal(true);
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSave = async () => {
    try {
      await addSaveProperty(id).unwrap();
      setAlertMessage("Property saved successfully!");
      setShowSuccessAlert(true);
      setShowErrorAlert(false);
      setShowSaveButton(false);
      refetchUserInfo();
      refetch();

      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 2000);
    } catch (err) {
      setAlertMessage("Failed to save the property.");
      setShowErrorAlert(true);
      setShowSuccessAlert(false);

      setTimeout(() => {
        setShowErrorAlert(false);
      }, 2000);
    }
  };

  const handleDeleteSavedProperty = async () => {
    try {
      await removeSaveProperty(id).unwrap();

      setAlertMessage("Property removed from saved properties!");
      setShowSuccessAlert(true);
      setShowErrorAlert(false);

      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate(-1);
      }, 2000);
    } catch (err) {
      setAlertMessage("Failed to remove saved property.");
      setShowErrorAlert(true);
      setShowSuccessAlert(false);

      setTimeout(() => {
        setShowErrorAlert(false);
      }, 2000);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("propertyType", propertyType);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("bedrooms", bedrooms);
      formData.append("bathrooms", bathrooms);
      formData.append("area", area);
      formData.append("location[houseNumber]", houseNumber);
      formData.append("location[street]", street);
      formData.append("location[city]", city);

      if (images) {
        images.forEach((image, index) => {
          formData.append("image", image);
        });
      }
      await editProperty({ data: formData, propertyId: id }).unwrap();
      setAlertMessage("Property updated successfully!");
      setShowSuccessAlert(true);
      setShowErrorAlert(false);
      setShowEditModal(false);
      refetch();

      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 2000);
    } catch (err) {
      setAlertMessage("Failed to update property.");
      setShowErrorAlert(true);
      setShowSuccessAlert(false);

      setTimeout(() => {
        setShowErrorAlert(false);
      }, 2000);
    }
  };
  const handleDelete = async () => {
    try {
      await deleteProperty(id).unwrap();

      setShowDeleteModal(false);

      setAlertMessage("Property deleted successfully!");
      setShowSuccessAlert(true);
      setShowErrorAlert(false);

      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate(-1);
      }, 1000);
    } catch (err) {
      setAlertMessage("Failed to delete property.");
      setShowErrorAlert(true);
      setShowSuccessAlert(false);

      setTimeout(() => {
        setShowErrorAlert(false);
      }, 2000);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center propertypage py-5"
    >
      <Row className="w-100 d-flex justify-content-center">
        <Col xs={12} md={10} lg={8}>
          {/* Success Alert */}
          {showSuccessAlert && (
            <Alert
              variant="success"
              onClose={() => setShowSuccessAlert(false)}
              dismissible
            >
              {alertMessage}
            </Alert>
          )}

          {/* Error Alert */}
          {showErrorAlert && (
            <Alert
              variant="danger"
              onClose={() => setShowErrorAlert(false)}
              dismissible
            >
              {alertMessage}
            </Alert>
          )}

          <Card
            className="shadow-lg carddetail position-relative"
            style={{ padding: "20px", fontSize: "1.2rem" }}
          >
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

            {userRole === "buyer" && fromHomePage && showSaveButton && (
              <Button
                variant="outline-danger"
                className="position-absolute top-0 end-0 m-3"
                onClick={handleSave}
              >
                <Icon.Heart />
              </Button>
            )}

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
            <Card.Title className="text-center display-5 mb-4 mt-5">
              {property?.property.title}
            </Card.Title>

            <Row className="property-details-row mb-4">
              <Col xs={12} md={8} className="property-detail-con">
                <Card.Img
                  variant="top"
                  src={
                    property?.property.images[0]
                      ? `${UPLOADS_URL}/${property?.property.images[0]}`
                      : `${UPLOADS_URL}/${DEFAULT_PROPERTY_IMG}`
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

            <Card.Text className="my-4 text-center">
              <strong>Description:</strong> {property?.property.description}
            </Card.Text>

            <Button
              variant="warning"
              size="md"
              onClick={() => setShowContactModal(true)}
              className="d-block mx-auto"
            >
              Contact Agent
            </Button>

            <Modal
              show={showContactModal}
              onHide={() => setShowContactModal(false)}
              centered
            >
              <Modal.Body className="text-center">
                <Image
                  src={`${UPLOADS_URL}/${agentImage}`}
                  roundedCircle
                  alt="Agent"
                  className="mb-3 agent-image "
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

                <Form.Group className="mb-3" controlId="formCity">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formStreet">
                  <Form.Label>Street</Form.Label>
                  <Form.Control
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
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
                    <option value="land">Land</option>
                    <option value="industrial">Industrial</option>
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                    <option value="mixed-use">Mixed-Use</option>
                    <option value="retail">Retail</option>
                    <option value="hospitality">Hospitality</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBedrooms">
                  <Form.Label>Bedrooms</Form.Label>
                  <Form.Control
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
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
                <Form.Group className="mb-3" controlId="formPrice">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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
            <Form.Group className="mb-3" controlId="formImages">
              <Form.Label>Property Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </Form.Group>

            <div className="image-preview">
              {previewImages.map((img, index) => (
                <Image
                  key={index}
                  src={img.startsWith("blob:") ? img : UPLOADS_URL + "/" + img}
                  alt={`property-img-${index}`}
                  thumbnail
                  style={{ width: "150px", margin: "5px" }}
                />
              ))}
            </div>
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
