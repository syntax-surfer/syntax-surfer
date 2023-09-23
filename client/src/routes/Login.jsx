import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div>
      <h1 className="">Login</h1>
      <p>
        <Link to="/dashboard">Dashboard</Link>
      </p>
    </div>
  );
}