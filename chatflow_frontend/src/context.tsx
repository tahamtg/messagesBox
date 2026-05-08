import { createContext } from "react";

interface api_sign {
  username: string
  password: string
}

interface propsca {
  form: api_sign,
  setForm: React.Dispatch<React.SetStateAction<api_sign>>,
}

export const Usecontext = createContext<propsca | null>(null)
