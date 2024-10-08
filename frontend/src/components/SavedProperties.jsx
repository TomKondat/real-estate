import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetUserInfoQuery,
  useGetSavedPropertiesByIdQuery,
} from "../slices/userApiSlice";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { DEFAULT_PROPERTY_IMG, UPLOADS_URL } from "../slices/urlConstrains";
import "../styles/propertyItem.css";

const SavedProperties = () => {
  const navigate = useNavigate();

  const {
    data: userInfo,
    isLoading: userInfoLoading,
    isError: userInfoError,
  } = useGetUserInfoQuery();

  const {
    data: savedPropertiesData,
    isLoading: savedPropertiesLoading,
    isError: savedPropertiesError,
    refetch: refetchSavedProperties,
  } = useGetSavedPropertiesByIdQuery();

  useEffect(() => {
    refetchSavedProperties();
  }, [refetchSavedProperties]);

  if (userInfoLoading || savedPropertiesLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status"></Spinner>
      </Container>
    );
  }

  if (userInfoError || savedPropertiesError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error: Failed to load data.</Alert>
      </Container>
    );
  }

  const userRole = userInfo?.data?.user?.role;
  if (userRole !== "buyer") {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Access Denied: Only buyers can view this page.
        </Alert>
      </Container>
    );
  }

  const propertiesArr = savedPropertiesData?.data?.savedProperties || [];

  const handleCardClick = (propertyId) => {
    navigate(`/properties/${propertyId}`, {
      state: { fromSavedProperties: true },
    });
  };

  return (
    <Container fluid className="property-list-wrapper pt-5">
      <h4>Saved Properties</h4>
      <Row className="g-3">
        {propertiesArr.length > 0 ? (
          propertiesArr.map((property) => (
            <Col key={property._id} xs={12} sm={6} md={4} lg={3} xl={3}>
              <div
                className="property-item clickable-card"
                onClick={() => handleCardClick(property._id)}
                role="button"
                tabIndex="0"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleCardClick(property._id);
                }}
              >
                <div className="image-wrapper">
                  <img
                    src={
                      property.images[0]
                        ? `${UPLOADS_URL}/${property.images[0]}`
                        : `${UPLOADS_URL}/${DEFAULT_PROPERTY_IMG}`
                    }
                    alt={property.name}
                    className="property-image"
                  />
                </div>
                <div className="property-card-body">
                  <h5 className="property-title">{property.title}</h5>
                  <p className="property-price">${property.price}</p>
                </div>
              </div>
            </Col>
          ))
        ) : (
          <p className="text-center">No saved properties yet.</p>
        )}
      </Row>
    </Container>
  );
};

export default SavedProperties;
