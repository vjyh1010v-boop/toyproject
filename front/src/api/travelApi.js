import axios from "axios";

const BASE_URL = "http://localhost:8080/api/travels";

export const getTravels = async () => {
  const response = await axios.get(BASE_URL);

  return response.data;
};

export const createTravel = async (travelData) => {
  const response = await axios.post(BASE_URL, travelData);

  return response.data;
};

export const deleteTravel = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};

export const updateTravel = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/${id}`, data);
  return response.data;
};
