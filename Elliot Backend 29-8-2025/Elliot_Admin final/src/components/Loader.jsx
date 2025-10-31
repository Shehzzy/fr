import React from "react";
import { Rings } from 'react-loader-spinner'

function Loader({isLoading}) {
  return (
    <Rings
        visible={isLoading}
        height="80"
        width="80"
        radius="48"
        color="#e83424"
        ariaLabel="watch-loading"
        wrapperStyle={{}}
        wrapperClass="hell"
        />

  );
}

export default Loader;
