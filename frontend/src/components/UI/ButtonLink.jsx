import { Link } from "react-router-dom";

export const ButtonLink = ({ to, children }) => (
  <Link to={to} className="bg-amber-950 m-1 p-3 rounded-md text-amber-100 font-bold hover:bg-amber-500 hover:text-amber-950">
    {children}
  </Link>
);