import axios from "axios";
import { createContext } from "react";

export const RequestContext = createContext({
  axiosInstance: axios.create(),
  requestQueue: [],
});

export const RequestProvider = RequestContext.Provider;
