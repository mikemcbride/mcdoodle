import React from "react";
import { IAuthContext } from "../types";

export const AuthContext = React.createContext<IAuthContext | null>(null);
