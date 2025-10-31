import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import "../others.css";
import { BASE_URL_ADMIN, UPDATE_CONTENT_BY_PAGE } from "../API";
import axios from "axios";
import parse from "html-react-parser";

const TermsAndCondition = () => {
  // const [isLoading, setIsLoading] = useState(true);
  // const [data, setData] = useState(null);
  // const [hasError, setHasError] = useState(false);

  // useEffect(() => {
  //   fetchTermsContent();
  // }, []);

  // const fetchTermsContent = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${BASE_URL_ADMIN}${UPDATE_CONTENT_BY_PAGE}?type=Terms and Conditions`
  //     );
  //     if (response.data.code === 200 && response.data.status === true) {
  //       setData(response.data.data);
  //     } else {
  //       setHasError(true);
  //     }
  //   } catch (error) {
  //     setHasError(true);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // return (
  //   <Container>
  //     <div className="card">
  //       {isLoading ? (
  //         <div className="text-center py-5">
  //           <Spinner animation="border" role="status" />
  //           <p className="mt-3">Loading terms and conditions...</p>
  //         </div>
  //       ) : hasError ? (
  //         <div className="text-center py-5 text-danger">
  //           <h5>Unable to load Terms and Conditions.</h5>
  //           <p>Please try again later.</p>
  //         </div>
  //       ) : (
  //         <>
  //           <h1 className="primary-heading">{data?.type || "Terms and Conditions"}</h1>
  //           <div className="paragraph">
  //             {data?.data ? parse(data.data) : "No terms and conditions found."}
  //           </div>
  //         </>
  //       )}
  //     </div>
  //   </Container>
  // );
};

export default TermsAndCondition;
