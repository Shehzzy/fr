import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";


const RenderHTMLList = React.memo(({ htmlString, heading }) => {
  const [listItems, setListItems] = useState([]);

  useEffect(() => {
    if (htmlString) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlString;
      const items = Array.from(tempDiv.querySelectorAll("li")).map((li) => li.textContent);
      setListItems(items);
    }
  }, [htmlString]);

  return (
    <ul className="comm_check_ul">
      {heading && <h6 className="head mt-0">{heading}</h6>}
      {listItems.length > 0 ? (
        listItems.map((item, index) => (
          <li key={item + index}>
            <FaCircleCheck />
            {item}
          </li>
        ))
      ) : (
        <li>No items found</li>
      )}
    </ul>
  );
});

export default RenderHTMLList;  // Correctly export the component
