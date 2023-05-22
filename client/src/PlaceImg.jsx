import React from "react";

const PlaceImg = ({ place, index = 0 }) => {
  if (!place.photos?.length) return "";
  return <img className="object-cover" src={place.photos[index].url} alt="" />;
};

export default PlaceImg;
