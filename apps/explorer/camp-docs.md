Hooks
useAuth
The useAuth hook returns the instance of the Auth class that is provided by the CampProvider. It can be used as outlined in the Core section in order to build custom authentication flows, listen for events, and fetch user data.


Copy
import { useAuth } from "@campnetwork/origin/react";

function App() {
  const auth = useAuth();

  return (
    <div>
      <button onClick={auth.connect}>Connect</button>
    </div>
  );
}
useAuthState
The useAuthState hook returns the current authentication state of the user.


Copy
import { useAuthState } from "@campnetwork/origin/react";

function App() {
  const { authenticated, loading } = useAuthState();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {authenticated && <div>Authenticated</div>}
    </div>
  );
}