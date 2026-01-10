import React, {FC, ReactElement} from "react";
import {signOut} from "aws-amplify/auth";

function logout() {
    signOut();
}

export const LogoutButton: FC = (): ReactElement => {
    return (<>
        <button onClick={() => logout()}>Log out</button>
    </>);
}