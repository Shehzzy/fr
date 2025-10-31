import React from "react";
import { Rings } from "react-loader-spinner";

function Loader({ isLoading }) {
  return (
    <div className="cst_loader_wrapper">
    <Rings
      visible={isLoading}
      height="50px" // Reduce the size here
      width="50px" // Reduce the size here
      radius="48"
      color="#e83424"
      ariaLabel="watch-loading"
      wrapperStyle={{
        display: "flex", // Ensure the loader is centered
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        height: "100vh", // Full viewport height if you want full screen loading
        backgroundColor: "transparent", // Keep the background transparent
      }}
    />
 </div>

  );
}

export default Loader;
