import { useContext } from "react";
import { RequestContext } from "./RequestContext";

export const useRequestContext = () => useContext(RequestContext);
